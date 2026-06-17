import { verifyBearerUser, getSupabaseEnv, serviceRestHeaders } from '../lib/server/verifyUser.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  const { url } = getSupabaseEnv();
  try {
    const profileRes = await fetch(
      `${url}/rest/v1/profiles?id=eq.${user.id}&select=name,role,institucion,cargo`,
      { headers: serviceRestHeaders() }
    );
    const profiles = await profileRes.json();
    const profile = Array.isArray(profiles) && profiles[0] ? profiles[0] : {};

    return res.status(200).json({
      user: {
        id:            user.id,
        email:         user.email,
        name:          profile.name        || user.user_metadata?.name        || '',
        role:          profile.role        || user.user_metadata?.role        || '',
        institucion:   profile.institucion || user.user_metadata?.institucion || '',
        cargo:         profile.cargo       || user.user_metadata?.cargo       || '',
        user_metadata: user.user_metadata,
      },
    });
  } catch {
    return res.status(500).json({ error: 'Error al obtener perfil' });
  }
}
