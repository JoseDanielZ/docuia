import { getSupabaseEnv } from './lib/verifyUser.js';
import { allowRateLimit, clientIp } from './lib/rateLimit.js';

const MAX_REFERRER = 500;
const PER_IP_HOUR = 200;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!allowRateLimit(`visitas:${ip}`, PER_IP_HOUR, 3_600_000)) {
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
    console.error('[visitas]', e);
  }

  return res.status(204).end();
}
