/**
 * Verifica el JWT de Supabase (Authorization: Bearer …) y devuelve el usuario.
 */

export function getSupabaseEnv() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;
  return { url, key };
}

export async function verifyBearerUser(req) {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    return { user: null, error: 'Configuración del servidor incompleta', status: 500 };
  }

  const raw = req.headers.authorization || '';
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { user: null, error: 'No autorizado', status: 401 };
  }

  try {
    const userRes = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: key },
    });
    const user = await userRes.json();
    if (!user?.id) {
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
