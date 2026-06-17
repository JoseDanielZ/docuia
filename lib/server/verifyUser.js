/**
 * Verifica el JWT de Supabase (Authorization: Bearer …) y devuelve el usuario.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getSupabaseEnv() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;
  if (url && !url.startsWith('https://')) {
    return { url: null, key: null };
  }
  return { url, key };
}

function parseCookieToken(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? match[1].trim() : null;
}

export async function verifyBearerUser(req) {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    return { user: null, error: 'Configuración del servidor incompleta', status: 500 };
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || parseCookieToken(req);
  if (!token) {
    return { user: null, error: 'No autorizado', status: 401 };
  }

  try {
    const userRes = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: key },
    });
    const user = await userRes.json();
    if (!user?.id || !UUID_RE.test(user.id)) {
      return { user: null, error: 'Token inválido o expirado', status: 401 };
    }
    return { user, error: null, status: 200 };
  } catch {
    return { user: null, error: 'Token inválido', status: 401 };
  }
}

export function serviceRestHeaders() {
  const { key } = getSupabaseEnv();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}
