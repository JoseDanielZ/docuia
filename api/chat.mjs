import { verifyBearerUser } from '../lib/server/verifyUser.js';
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';
import { logger } from '../lib/server/logger.js';

const MODEL_PRIMARY  = 'llama-3.3-70b-versatile';
const MODEL_FALLBACK = 'llama-3.1-8b-instant';
const CHAT_TIMEOUT   = 15_000;
const CHAT_PER_IP_HOUR = 120;
const MAX_MSG_CHARS  = 500;

const LUCIA_SYSTEM = `Eres Lucía, asistente virtual amigable de DocuIA para docentes de la Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa.

DocuIA es una plataforma que genera documentos oficiales con inteligencia artificial:
- Informe Académico y Comportamental del Docente Tutor/a (trimestral)
- Plan de Contingencia para estudiantes que no asisten normalmente
- Planificación Microcurricular para Bachillerato Técnico
- Reporte de Calificaciones y Asistencia

Flujo de uso: el docente elige el tipo de documento → llena el formulario con sus datos reales → hace clic en "Generar" → la IA crea el documento → lo descarga en Word (.docx).

Funciones adicionales:
- Historial: guarda todos los documentos generados, se pueden editar y descargar de nuevo
- Plantillas: formularios pre-llenados para reutilizar datos del grado y paralelo
- Cursos: gestión de cursos del docente

Consejos clave:
- Los campos vacíos en el formulario quedan como "Sin novedad" en el documento
- Los nombres de estudiantes se ingresan uno por línea
- La generación puede tardar hasta 30 segundos para documentos largos
- Si la descarga no funciona, revisar que el navegador no esté bloqueando descargas

REGLAS:
- Responde SIEMPRE en español
- Tono cálido, simple y directo — como si hablaras con un docente no técnico
- Máximo 3 oraciones por respuesta
- Si no sabes algo específico de DocuIA, di "Para eso te recomiendo contactar al coordinador"
- NUNCA inventes datos, nombres de estudiantes, calificaciones ni información institucional
- Si preguntan algo fuera del ámbito de DocuIA, redirige amablemente a las funciones disponibles`;

async function callGroq(model, messages, signal, apiKey) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 300,
      temperature: 0.5,
      stream: false,
    }),
    signal,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  const { message, context = '' } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Mensaje vacío' });
  }

  const trimmed = message.trim().slice(0, MAX_MSG_CHARS);

  const ip = clientIp(req);
  if (!allowRateLimit(`chat:ip:${ip}`, CHAT_PER_IP_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiadas preguntas. Espera un momento.' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Servicio de IA no configurado' });
  }

  // Sanitizar context: eliminar saltos de línea que permiten inyectar nuevas
  // "instrucciones" al LLM fuera del bloque de datos del usuario.
  const safeContext = typeof context === 'string'
    ? context.replace(/[\n\r]/g, ' ').slice(0, 200)
    : '';
  const contextHint = safeContext ? ` [Vista: ${safeContext}]` : '';
  const messages = [
    { role: 'system', content: LUCIA_SYSTEM },
    { role: 'user',   content: trimmed + contextHint },
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT);

    let groqRes;
    try {
      groqRes = await callGroq(MODEL_PRIMARY, messages, controller.signal, GROQ_API_KEY);
    } finally {
      clearTimeout(timeout);
    }

    if (!groqRes.ok && groqRes.status >= 500) {
      const fc = new AbortController();
      const ft = setTimeout(() => fc.abort(), CHAT_TIMEOUT);
      try {
        groqRes = await callGroq(MODEL_FALLBACK, messages, fc.signal, GROQ_API_KEY);
      } finally {
        clearTimeout(ft);
      }
    }

    if (!groqRes.ok) {
      logger.warn('Groq chat error', { status: groqRes.status });
      return res.status(502).json({ error: 'No pude responder ahora. Usa las preguntas frecuentes.' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'No tengo respuesta para eso. Prueba con otra pregunta.';

    return res.status(200).json({ reply });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'La respuesta tardó demasiado. Intenta de nuevo.' });
    }
    logger.error('chat handler error', { err: err.message });
    return res.status(500).json({ error: 'Error interno. Usa las preguntas frecuentes.' });
  }
}
