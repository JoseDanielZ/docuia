import { verifyBearerUser } from './lib/verifyUser.js';
import { allowRateLimit, clientIp } from './lib/rateLimit.js';
import { getSystemPrompt } from '../src/config.js';

const MAX_PROMPT_CHARS = 48_000;
/** Generaciones por usuario por hora (autenticado) */
const GEN_PER_USER_HOUR = 45;
/** Por IP para la misma ruta (capa extra) */
const GEN_PER_IP_HOUR = 120;

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
      error: `El contenido enviado supera el máximo permitido (${MAX_PROMPT_CHARS} caracteres).`,
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
    return res.status(429).json({ error: 'Has alcanzado el límite de generaciones por hora. Intenta más tarde.' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Servicio de IA no configurado' });
  }

  const hasFormato = detectHasFormato(trimmed);
  const system = getSystemPrompt({ hasFormato });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 6000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: trimmed },
        ],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ text: data.choices[0].message.content });
    }

    const providerMsg = data.error?.message || 'No response from AI';
    console.error('[generate] Groq error:', providerMsg);
    return res.status(502).json({ error: 'No se pudo generar el reporte. Intenta de nuevo.' });
  } catch (err) {
    console.error('[generate]', err);
    return res.status(500).json({ error: 'Error al contactar el servicio de IA' });
  }
}
