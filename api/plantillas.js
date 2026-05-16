import { verifyBearerUser, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

function supabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

async function handleGet(res, user) {
  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/plantillas?user_id=eq.${user.id}&activo=eq.true&order=created_at.desc`,
      { headers: serviceRestHeaders() }
    );
    const plantillas = await r.json();
    return res.status(200).json({ plantillas: Array.isArray(plantillas) ? plantillas : [] });
  } catch (error_) {
    logger.error('plantillas GET', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al listar plantillas' });
  }
}

async function handlePost(req, res, user) {
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
    const r = await fetch(`${supabaseUrl()}/rest/v1/plantillas`, {
      method: 'POST',
      headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id:     user.id,
        nombre:      String(nombre).slice(0, 200),
        tipo_reporte: String(tipo_reporte).slice(0, 64),
        datos:       datosObj,
        activo:      true,
      }),
    });
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(201).json({ success: true, plantilla: data[0] });
    return res.status(400).json({ error: 'Error al crear plantilla' });
  } catch (error_) {
    logger.error('plantillas POST', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleDelete(req, res, user) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Falta id' });
  try {
    await fetch(
      `${supabaseUrl()}/rest/v1/plantillas?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
      { method: 'PATCH', headers: serviceRestHeaders(), body: JSON.stringify({ activo: false }) }
    );
    return res.status(200).json({ success: true });
  } catch (error_) {
    logger.error('plantillas DELETE', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al eliminar plantilla' });
  }
}

export default async function handler(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  if (req.method === 'GET')    return handleGet(res, user);
  if (req.method === 'POST')   return handlePost(req, res, user);
  if (req.method === 'DELETE') return handleDelete(req, res, user);

  return res.status(405).json({ error: 'Método no permitido' });
}
