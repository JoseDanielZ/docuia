/**
 * Auth unificado para Vercel Hobby (1 Serverless Function en lugar de 3).
 * POST /api/auth  body: { action: 'login'|'signup'|'recover', ... }
 */
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleLogin(req, res) {
  const ip = clientIp(req);
  if (!allowRateLimit(`login:${ip}`, 40, 3_600_000)) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera un momento.' });
  }

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    });
    const data = await authRes.json();

    if (data.error) {
      return res.status(401).json({ error: data.error_description || data.msg || 'Credenciales incorrectas' });
    }

    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleSignup(req, res) {
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
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email: emailNorm, password, data: { name, role } }),
    });
    const authData = await authRes.json();

    if (authData.error) return res.status(400).json({ error: authData.error.message || authData.msg });

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
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleRecover(req, res) {
  const ip = clientIp(req);
  if (!allowRateLimit(`recover:${ip}`, 8, 3_600_000)) {
    return res.status(200).json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email es obligatorio' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email }),
    });

    return res.status(200).json({
      success: true,
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = req.body?.action;
  if (action === 'login') return handleLogin(req, res);
  if (action === 'signup') return handleSignup(req, res);
  if (action === 'recover') return handleRecover(req, res);

  return res.status(400).json({ error: 'action debe ser login, signup o recover' });
}
