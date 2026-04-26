// API del historial de reportes generados (privado por usuario)
// POST   /api/reportes              -> crea un reporte (solo user_id del token)
// GET    /api/reportes              -> lista mis reportes (no archivados)
// GET    /api/reportes?id=...       -> obtiene un reporte completo
// PATCH  /api/reportes?id=...       -> actualiza { reporte_generado } (editar texto guardado)
// DELETE /api/reportes?id=...       -> archiva (borrado lógico)

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

  const baseHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  const { id } = req.query;

  if (req.method === 'POST') {
    const {
      email_docente,
      nombre_docente,
      institucion,
      curso,
      periodo,
      tipo_reporte,
      datos_ingresados,
      reporte_generado,
    } = req.body || {};

    if (!tipo_reporte || typeof tipo_reporte !== 'string') {
      return res.status(400).json({ error: 'tipo_reporte es obligatorio' });
    }
    if (!reporte_generado || typeof reporte_generado !== 'string') {
      return res.status(400).json({ error: 'reporte_generado es obligatorio' });
    }
    if (reporte_generado.length > 500_000) {
      return res.status(413).json({ error: 'El reporte es demasiado largo' });
    }

    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/reportes`, {
        method: 'POST',
        headers: { ...baseHeaders, Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: user.id,
          email_docente: typeof email_docente === 'string' ? email_docente.slice(0, 320) : (user.email || ''),
          nombre_docente:
            typeof nombre_docente === 'string'
              ? nombre_docente.slice(0, 320)
              : (user.user_metadata?.name || ''),
          institucion: typeof institucion === 'string' ? institucion.slice(0, 320) : '',
          curso: typeof curso === 'string' ? curso.slice(0, 320) : '',
          periodo: typeof periodo === 'string' ? periodo.slice(0, 320) : '',
          tipo_reporte: tipo_reporte.slice(0, 64),
          datos_ingresados: datos_ingresados && typeof datos_ingresados === 'object' ? datos_ingresados : {},
          reporte_generado,
          archivado: false,
        }),
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) {
        return res.status(201).json({ success: true, reporte: data[0] });
      }
      return res.status(400).json({ error: 'No se pudo guardar el reporte' });
    } catch (e) {
      return res.status(500).json({ error: 'Error del servidor' });
    }
  }

  if (req.method === 'GET' && id) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/reportes?id=eq.${id}&user_id=eq.${user.id}&select=*`,
        { headers: baseHeaders }
      );
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return res.status(200).json({ reporte: data[0] });
      return res.status(404).json({ error: 'Reporte no encontrado' });
    } catch (e) {
      return res.status(500).json({ error: 'Error al obtener reporte' });
    }
  }

  if (req.method === 'GET') {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/reportes?user_id=eq.${user.id}&archivado=eq.false&order=created_at.desc&select=id,created_at,nombre_docente,curso,periodo,tipo_reporte,institucion`,
        { headers: baseHeaders }
      );
      const reportes = await r.json();
      return res.status(200).json({ reportes: Array.isArray(reportes) ? reportes : [] });
    } catch (e) {
      return res.status(500).json({ error: 'Error al listar reportes' });
    }
  }

  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    const { reporte_generado } = req.body || {};
    if (typeof reporte_generado !== 'string') {
      return res.status(400).json({ error: 'reporte_generado debe ser string' });
    }
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/reportes?id=eq.${id}&user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { ...baseHeaders, Prefer: 'return=representation' },
          body: JSON.stringify({ reporte_generado }),
        }
      );
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return res.status(200).json({ success: true, reporte: data[0] });
      return res.status(404).json({ error: 'Reporte no encontrado' });
    } catch (e) {
      return res.status(500).json({ error: 'Error al actualizar reporte' });
    }
  }

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/reportes?id=eq.${id}&user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: baseHeaders,
          body: JSON.stringify({ archivado: true }),
        }
      );
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error al archivar reporte' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
