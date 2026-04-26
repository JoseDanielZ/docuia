/**
 * Telemetría unificada (1 Serverless Function en lugar de 3).
 * POST /api/telemetry  body: { kind: 'visita'|'reporte_copiado'|'referral', ... }
 */
import { verifyBearerUser, getSupabaseEnv } from '../lib/server/verifyUser.js';
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';

const MAX_REFERRER = 500;
const VISITAS_PER_IP_HOUR = 200;
const COPIADOS_PER_USER_HOUR = 80;
const REFERRALS_PER_USER_HOUR = 40;

async function handleVisita(req, res) {
  const ip = clientIp(req);
  if (!allowRateLimit(`visitas:${ip}`, VISITAS_PER_IP_HOUR, 3_600_000)) {
    return res.status(429).end();
  }

  const { referrer } = req.body || {};
  const ref =
    typeof referrer === 'string' && referrer.trim()
      ? referrer.trim().slice(0, MAX_REFERRER)
      : 'directo';

  const { url, key } = getSupabaseEnv();
  if (!url || !key) return res.status(204).end();

  try {
    await fetch(`${url}/rest/v1/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ referrer: ref }),
    });
  } catch (e) {
    console.error('[telemetry visita]', e);
  }

  return res.status(204).end();
}

async function handleReporteCopiado(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  if (!allowRateLimit(`copiados:${user.id}`, COPIADOS_PER_USER_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes' });
  }

  const { tipo } = req.body || {};
  const tipoStr = typeof tipo === 'string' ? tipo.slice(0, 64) : '';

  const { url, key } = getSupabaseEnv();
  if (!url || !key) return res.status(204).end();

  try {
    await fetch(`${url}/rest/v1/reportes_copiados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email_docente: user.email || '',
        tipo: tipoStr || 'desconocido',
      }),
    });
  } catch (e) {
    console.error('[telemetry copiado]', e);
  }

  return res.status(204).end();
}

async function handleReferral(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  if (!allowRateLimit(`referrals:${user.id}`, REFERRALS_PER_USER_HOUR, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes' });
  }

  const { url, key } = getSupabaseEnv();
  if (!url || !key) return res.status(204).end();

  try {
    await fetch(`${url}/rest/v1/referrals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        email_from: user.email || '',
      }),
    });
  } catch (e) {
    console.error('[telemetry referral]', e);
  }

  return res.status(204).end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const kind = req.body?.kind;
  if (kind === 'visita') return handleVisita(req, res);
  if (kind === 'reporte_copiado') return handleReporteCopiado(req, res);
  if (kind === 'referral') return handleReferral(req, res);

  return res.status(400).json({ error: 'kind debe ser visita, reporte_copiado o referral' });
}
