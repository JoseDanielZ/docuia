import { verifyBearerUser, getSupabaseEnv, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';
import { getSystemPrompt } from '../src/config.js';
import { isFeAlegriaType } from '../src/config/feAlegriaSchemas.js';
import { logger } from '../lib/server/logger.js';

const MAX_PROMPT_CHARS  = 48_000;
const GEN_PER_USER_HOUR = 45;
const GEN_PER_IP_HOUR   = 120;
const MODEL_PRIMARY     = 'llama-3.3-70b-versatile';
const MODEL_FALLBACK    = 'llama-3.1-8b-instant';
const GROQ_TIMEOUT_MS   = 55_000;

export const config = { maxDuration: 60 };

function detectHasFormato(prompt) {
  return typeof prompt === 'string' && prompt.includes('FORMATO INSTITUCIONAL DEL DOCENTE');
}

function sanitizePrompt(raw) {
  const injectionRe = /^(System:|Ignore\s|<\|system\|>|\[INST\]|###\s*System|Assistant:)/im;
  if (injectionRe.test(raw)) {
    logger.warn('prompt_injection_attempt', { snippet: raw.slice(0, 120) });
  }
  return raw
    .replace(injectionRe, '')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

async function countRecentReports(userId) {
  const { url } = getSupabaseEnv();
  if (!url) return 0;
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  try {
    const r = await fetch(
      `${url}/rest/v1/reportes?user_id=eq.${userId}&created_at=gte.${hourAgo}&select=id`,
      { headers: serviceRestHeaders() }
    );
    const rows = await r.json();
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return 0;
  }
}

async function callGroq(model, payload, signal, apiKey) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, model }),
    signal,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type = '' } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Falta el texto del reporte (prompt)' });
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'El prompt no puede estar vacío' });
  }

  if (trimmed.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({
      error: `El contenido supera el máximo permitido (${MAX_PROMPT_CHARS} caracteres).`,
    });
  }

  const sanitized = sanitizePrompt(trimmed);

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({
      error: authErr || 'Debes iniciar sesión para generar reportes.',
    });
  }

  // Rate limit persistente: contar reportes reales en la última hora desde Supabase
  const recentCount = await countRecentReports(user.id);
  if (recentCount >= GEN_PER_USER_HOUR) {
    return res.status(429).json({ error: `Límite de ${GEN_PER_USER_HOUR} reportes por hora alcanzado. Intenta más tarde.` });
  }

  // Segunda capa: rate limit in-memory por IP (sigue siendo útil para ráfagas)
  const ip = clientIp(req);
  if (!allowRateLimit(`gen:ip:${ip}`, GEN_PER_IP_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes desde esta red. Intenta más tarde.' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Servicio de IA no configurado' });
  }

  const hasFormato = detectHasFormato(sanitized);
  const system     = getSystemPrompt({ hasFormato, type });
  const isFeA        = isFeAlegriaType(type) && !hasFormato;
  const useStream    = !isFeA && req.headers['accept'] === 'text/event-stream';

  // Delimitar el input del usuario con etiquetas XML para que el modelo no
  // interprete su contenido como instrucciones del sistema (prompt injection).
  const userContent = `<datos_del_docente>\n${sanitized}\n</datos_del_docente>`;

  const groqPayload = {
    max_tokens:  isFeA ? 10_000 : 6000,
    temperature: 0.3,
    stream:      useStream,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: userContent },
    ],
  };

  if (isFeA) {
    groqPayload.response_format = { type: 'json_object' };
    groqPayload.stream = false;
  }

  const t0 = Date.now();

  try {
    // ── Primary model attempt ─────────────────────────────────────────────
    const primaryController = new AbortController();
    const primaryTimeout = setTimeout(() => primaryController.abort(), GROQ_TIMEOUT_MS);
    let groqRes;
    let usedFallback = false;

    try {
      groqRes = await callGroq(MODEL_PRIMARY, groqPayload, primaryController.signal, GROQ_API_KEY);
    } finally {
      clearTimeout(primaryTimeout);
    }

    // ── Fallback on 5xx ───────────────────────────────────────────────────
    if (!groqRes.ok && groqRes.status >= 500) {
      logger.warn('Groq primary failed, switching to fallback', {
        status: groqRes.status, userId: user.id,
      });

      const fallbackController = new AbortController();
      const fallbackTimeout = setTimeout(() => fallbackController.abort(), GROQ_TIMEOUT_MS);

      try {
        groqRes = await callGroq(MODEL_FALLBACK, groqPayload, fallbackController.signal, GROQ_API_KEY);
      } finally {
        clearTimeout(fallbackTimeout);
      }

      if (!groqRes.ok && groqRes.status >= 500) {
        logger.error('Groq fallback also failed', { status: groqRes.status, userId: user.id });
        return res.status(503).json({ error: 'Servicio IA no disponible, intenta en unos minutos' });
      }

      usedFallback = true;
    }

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      logger.error('Groq HTTP error', { status: groqRes.status, err: errData?.error?.message });
      return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });
    }

    if (usedFallback) {
      res.setHeader('X-Model-Used', MODEL_FALLBACK);
    }

    // ── Streaming (SSE) mode ──────────────────────────────────────────────
    if (useStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const reader  = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          res.write(chunk);
        }
      }

      logger.info('generate stream done', { userId: user.id, ms: Date.now() - t0 });
      return res.end();
    }

    // ── Non-streaming (JSON) fallback ─────────────────────────────────────
    const data = await groqRes.json();

    if (isFeA) {
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) {
        logger.error('Groq empty JSON response', { userId: user.id });
        return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        logger.error('Groq invalid JSON', { userId: user.id, snippet: raw.slice(0, 200) });
        return res.status(502).json({ error: 'La IA devolvió un formato inválido. Intenta de nuevo.' });
      }
      logger.info('generate fea json done', { userId: user.id, ms: Date.now() - t0 });
      return res.status(200).json({ format: 'fea_v2', type, data: parsed });
    }

    if (data.choices?.[0]?.message?.content) {
      logger.info('generate done', { userId: user.id, ms: Date.now() - t0 });
      return res.status(200).json({ text: data.choices[0].message.content });
    }

    logger.error('Groq empty response', { userId: user.id, data });
    return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });

  } catch (err) {
    if (err.name === 'AbortError') {
      logger.warn('Groq timeout', { userId: user.id, ms: Date.now() - t0 });
      return res.status(503).json({ error: 'El servicio de IA tardó demasiado, intenta de nuevo.' });
    }
    logger.error('generate exception', { userId: user.id, err: err.message });
    return res.status(500).json({ error: 'Error al contactar el servicio de IA' });
  }
}
