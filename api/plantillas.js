// API de plantillas de reporte (privadas por usuario)
// GET    /api/plantillas              -> lista mis plantillas activas
// POST   /api/plantillas              -> crea una plantilla { nombre, tipo_reporte, datos }
// DELETE /api/plantillas?id=...       -> borrado lógico

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

  if (req.method === 'GET') {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/plantillas?user_id=eq.${user.id}&activo=eq.true&order=created_at.desc`,
        { headers: baseHeaders }
      );
      const plantillas = await r.json();
      return res.status(200).json({ plantillas: Array.isArray(plantillas) ? plantillas : [] });
    } catch (e) {
      return res.status(500).json({ error: 'Error al listar plantillas' });
    }
  }

  if (req.method === 'POST') {
    const { nombre, tipo_reporte, datos } = req.body || {};
    if (!nombre || !tipo_reporte) {
      return res.status(400).json({ error: 'nombre y tipo_reporte son obligatorios' });
    }
    const datosObj = datos && typeof datos === 'object' ? datos : {};
    let datosJson;
    try {
      datosJson = JSON.stringify(datosObj);
    } catch {
      return res.status(400).json({ error: 'datos no válidos' });
    }
    if (datosJson.length > 200_000) {
      return res.status(413).json({ error: 'Los datos de la plantilla son demasiado grandes' });
    }
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/plantillas`, {
        method: 'POST',
        headers: { ...baseHeaders, Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: user.id,
          nombre: String(nombre).slice(0, 200),
          tipo_reporte: String(tipo_reporte).slice(0, 64),
          datos: datosObj,
          activo: true,
        }),
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) return res.status(201).json({ success: true, plantilla: data[0] });
      return res.status(400).json({ error: 'Error al crear plantilla', details: data });
    } catch (e) {
      return res.status(500).json({ error: 'Error del servidor', details: e.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Falta id' });
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/plantillas?id=eq.${id}&user_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: baseHeaders,
        body: JSON.stringify({ activo: false }),
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error al eliminar plantilla' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
