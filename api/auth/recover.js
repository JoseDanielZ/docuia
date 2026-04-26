import { allowRateLimit, clientIp } from '../lib/rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!allowRateLimit(`recover:${ip}`, 8, 3_600_000)) {
    return res.status(200).json({ success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email es obligatorio' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email }),
    });

    // Always return success to avoid email enumeration
    return res.status(200).json({ success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
}
