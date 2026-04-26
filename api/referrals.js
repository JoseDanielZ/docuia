import { verifyBearerUser, getSupabaseEnv } from './lib/verifyUser.js';
import { allowRateLimit } from './lib/rateLimit.js';

const PER_USER_HOUR = 40;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  if (!allowRateLimit(`referrals:${user.id}`, PER_USER_HOUR, 3_600_000)) {
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
    console.error('[referrals]', e);
  }

  return res.status(204).end();
}
