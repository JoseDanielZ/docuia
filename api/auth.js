/**
 * Auth unificado para Vercel Hobby (1 Serverless Function en lugar de 3).
 * POST /api/auth  body: { action: 'login'|'signup'|'recover'|'refresh'|'logout', ... }
 */
import { allowRateLimit, clientIp } from '../lib/server/rateLimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const SECURE = isProd ? '; Secure' : '';

function setAuthCookies(res, access_token, refresh_token) {
  const cookies = [
    `access_token=${access_token}; HttpOnly${SECURE}; SameSite=Strict; Path=/; Max-Age=3600`,
  ];
  if (refresh_token) {
    cookies.push(`refresh_token=${refresh_token}; HttpOnly${SECURE}; SameSite=Strict; Path=/; Max-Age=2592000`);
  }
  res.setHeader('Set-Cookie', cookies);
}

function clearAuthCookies(res) {
  res.setHeader('Set-Cookie', [
    `access_token=; HttpOnly${SECURE}; SameSite=Strict; Path=/; Max-Age=0`,
    `refresh_token=; HttpOnly${SECURE}; SameSite=Strict; Path=/; Max-Age=0`,
  ]);
}

function parseCookieValue(req, name) {
  const raw = req.headers.cookie || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1].trim() : null;
}

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

    // Enrich user_metadata with profile data from the profiles table
    // This covers existing users who signed up before institucion was added to auth metadata
    if (data.user?.id && UUID_RE.test(data.user.id)) {
      try {
        const profileRes = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=name,role,institucion,cargo`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const profiles = await profileRes.json();
        if (Array.isArray(profiles) && profiles.length > 0) {
          const p = profiles[0];
          data.user = {
            ...data.user,
            user_metadata: {
              ...data.user.user_metadata,
              name:        p.name        || data.user.user_metadata?.name        || '',
              role:        p.role        || data.user.user_metadata?.role        || '',
              institucion: p.institucion || data.user.user_metadata?.institucion || '',
              cargo:       p.cargo       || data.user.user_metadata?.cargo       || '',
            },
          };
        }
      } catch { /* no bloqueamos el login si falla el enriquecimiento */ }
    }

    setAuthCookies(res, data.access_token, data.refresh_token);
    return res.status(200).json({ success: true, user: data.user });
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
      body: JSON.stringify({
        email: emailNorm,
        password,
        data: {
          name,
          role,
          institucion: req.body.institucion || '',
          cargo: req.body.cargo || role || 'Docente',
        },
      }),
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

    if (authData.session?.access_token) {
      setAuthCookies(res, authData.session.access_token, authData.session.refresh_token);
    }
    return res.status(200).json({ success: true, user: authData.user, session: authData.session });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleRefresh(req, res) {
  // Lee el refresh token de la cookie HttpOnly (preferido) o del body (compatibilidad)
  const refresh_token = parseCookieValue(req, 'refresh_token') || req.body?.refresh_token;
  if (!refresh_token || typeof refresh_token !== 'string') {
    return res.status(401).json({ error: 'No hay sesión activa. Inicia sesión nuevamente.' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ refresh_token }),
    });
    const data = await r.json();
    if (data.error) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Sesión expirada. Inicia sesión nuevamente.' });
    }
    setAuthCookies(res, data.access_token, data.refresh_token);
    return res.status(200).json({ success: true, user: data.user });
  } catch {
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleLogout(req, res) {
  clearAuthCookies(res);
  return res.status(200).json({ success: true });
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
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Correo no válido' });
  }

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
  if (action === 'login')   return handleLogin(req, res);
  if (action === 'signup')  return handleSignup(req, res);
  if (action === 'recover') return handleRecover(req, res);
  if (action === 'refresh') return handleRefresh(req, res);
  if (action === 'logout')  return handleLogout(req, res);

  return res.status(400).json({ error: 'action debe ser login, signup, recover o refresh' });
}
