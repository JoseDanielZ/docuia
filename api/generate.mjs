import { verifyBearerUser } from '../lib/server/verifyUser.js';
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';
import { getSystemPrompt } from '../src/config.js';
import { logger } from '../lib/server/logger.js';

const MAX_PROMPT_CHARS  = 48_000;
const GEN_PER_USER_HOUR = 45;
const GEN_PER_IP_HOUR   = 120;

function detectHasFormato(prompt) {
  return typeof prompt === 'string' && prompt.includes('FORMATO INSTITUCIONAL DEL DOCENTE');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};

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

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({
      error: authErr || 'Debes iniciar sesión para generar reportes.',
    });
  }

  const ip = clientIp(req);
  if (!allowRateLimit(`gen:ip:${ip}`, GEN_PER_IP_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes desde esta red. Intenta más tarde.' });
  }
  if (!allowRateLimit(`gen:user:${user.id}`, GEN_PER_USER_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Has alcanzado el límite de generaciones por hora.' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Servicio de IA no configurado' });
  }

  const hasFormato = detectHasFormato(trimmed);
  const system     = getSystemPrompt({ hasFormato });
  const useStream  = req.headers['accept'] === 'text/event-stream';

  const t0 = Date.now();

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: 6000,
        temperature: 0.3,
        stream:     useStream,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: trimmed },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      logger.error('Groq HTTP error', { status: groqRes.status, err: errData?.error?.message });
      return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });
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

    if (data.choices?.[0]?.message?.content) {
      logger.info('generate done', { userId: user.id, ms: Date.now() - t0 });
      return res.status(200).json({ text: data.choices[0].message.content });
    }

    logger.error('Groq empty response', { userId: user.id, data });
    return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });

  } catch (err) {
    logger.error('generate exception', { userId: user.id, err: err.message });
    return res.status(500).json({ error: 'Error al contactar el servicio de IA' });
  }
}
