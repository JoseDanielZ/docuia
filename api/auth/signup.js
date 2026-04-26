import { allowRateLimit, clientIp } from '../lib/rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!allowRateLimit(`signup:${ip}`, 12, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiados registros desde esta red. Intenta más tarde.' });
  }

  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Correo no válido' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const emailNorm = email.trim();

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    // 1. Create user in Supabase Auth
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email: emailNorm, password, data: { name, role } }),
    });
    const authData = await authRes.json();

    if (authData.error) return res.status(400).json({ error: authData.error.message || authData.msg });

    // 2. Save profile to profiles table
    if (authData.user) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: authData.user.id,
          email: emailNorm,
          name: name || '',
          role: role || 'Docente',
          institucion: req.body.institucion || '',
          cargo: req.body.cargo || role || 'Docente',
        }),
      });
    }

    return res.status(200).json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
}
