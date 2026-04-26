// API de formatos institucionales
// GET    /api/formatos                    -> lista mis formatos + compartidos por mi institucion
// PATCH  /api/formatos?id=...             -> actualizar { compartido } (solo dueño)
// DELETE /api/formatos?id=...             -> borrado lógico (solo dueño)

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  let user;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY }
    });
    user = await userRes.json();
    if (!user.id) return res.status(401).json({ error: 'Token inválido' });
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const baseHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

  if (req.method === 'GET') {
    try {
      // 1. Mis formatos (todos los míos, compartidos o no)
      const misRes = await fetch(
        `${SUPABASE_URL}/rest/v1/formatos_institucionales?user_id=eq.${user.id}&activo=eq.true&order=created_at.desc&select=id,created_at,nombre_archivo,tipo_reporte,tipo_archivo,num_campos_detectados,compartido,institucion,user_id`,
        { headers: baseHeaders }
      );
      const mios = (await misRes.json()) || [];

      // 2. Buscar mi institución para los compartidos
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=institucion`,
        { headers: baseHeaders }
      );
      const profile = (await profileRes.json())?.[0];
      const institucion = profile?.institucion || '';

      let compartidos = [];
      if (institucion) {
        const encInst = encodeURIComponent(institucion);
        const compRes = await fetch(
          `${SUPABASE_URL}/rest/v1/formatos_institucionales?compartido=eq.true&institucion=eq.${encInst}&user_id=neq.${user.id}&activo=eq.true&order=created_at.desc&select=id,created_at,nombre_archivo,tipo_reporte,tipo_archivo,num_campos_detectados,compartido,institucion,user_id`,
          { headers: baseHeaders }
        );
        compartidos = (await compRes.json()) || [];
      }

      return res.status(200).json({ mios, compartidos, institucion });
    } catch (e) {
      return res.status(500).json({ error: 'Error al listar formatos', details: e.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Falta id' });
    const { compartido } = req.body || {};
    if (typeof compartido !== 'boolean') {
      return res.status(400).json({ error: 'compartido debe ser boolean' });
    }
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/formatos_institucionales?id=eq.${id}&user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { ...baseHeaders, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ compartido })
        }
      );
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return res.status(200).json({ success: true, formato: data[0] });
      return res.status(404).json({ error: 'Formato no encontrado' });
    } catch (e) {
      return res.status(500).json({ error: 'Error al actualizar formato' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Falta id' });
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/formatos_institucionales?id=eq.${id}&user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { ...baseHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: false })
        }
      );
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error al eliminar formato' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
