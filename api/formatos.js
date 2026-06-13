import { verifyBearerUser, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

function supabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

const FORMAT_SELECT =
  'id,created_at,nombre_archivo,tipo_reporte,tipo_archivo,num_campos_detectados,compartido,institucion,user_id,contenido_extraido';

function errMsg(error_) {
  return error_ instanceof Error ? error_.message : String(error_);
}

async function fetchMios(base, userId) {
  const r = await fetch(
    `${supabaseUrl()}/rest/v1/formatos_institucionales` +
    `?user_id=eq.${userId}&activo=eq.true&order=created_at.desc&select=${FORMAT_SELECT}`,
    { headers: base }
  );
  return (await r.json()) || [];
}

async function fetchInstitucion(base, userId) {
  const r = await fetch(
    `${supabaseUrl()}/rest/v1/profiles?id=eq.${userId}&select=institucion`,
    { headers: base }
  );
  const rows = await r.json();
  return rows?.[0]?.institucion || '';
}

async function fetchCompartidos(base, institucion, userId) {
  if (!institucion) return [];
  const r = await fetch(
    `${supabaseUrl()}/rest/v1/formatos_institucionales` +
    `?compartido=eq.true&institucion=eq.${encodeURIComponent(institucion)}` +
    `&user_id=neq.${userId}&activo=eq.true&order=created_at.desc&select=${FORMAT_SELECT}`,
    { headers: base }
  );
  return (await r.json()) || [];
}

async function handleGet(req, res, user) {
  try {
    const base        = serviceRestHeaders();
    const mios        = await fetchMios(base, user.id);
    const institucion = await fetchInstitucion(base, user.id);
    const compartidos = await fetchCompartidos(base, institucion, user.id);
    return res.status(200).json({ mios, compartidos, institucion });
  } catch (error_) {
    logger.error('formatos GET', { userId: user.id, err: errMsg(error_) });
    return res.status(500).json({ error: 'Error al listar formatos' });
  }
}

async function handlePatch(req, res, user, id) {
  const { compartido } = req.body || {};
  if (typeof compartido !== 'boolean') {
    return res.status(400).json({ error: 'compartido debe ser boolean' });
  }
  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/formatos_institucionales?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({ compartido }),
      }
    );
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(200).json({ success: true, formato: data[0] });
    return res.status(404).json({ error: 'Formato no encontrado' });
  } catch (error_) {
    logger.error('formatos PATCH', { userId: user.id, err: errMsg(error_) });
    return res.status(500).json({ error: 'Error al actualizar formato' });
  }
}

async function handleDelete(req, res, user, id) {
  try {
    await fetch(
      `${supabaseUrl()}/rest/v1/formatos_institucionales?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
      { method: 'PATCH', headers: serviceRestHeaders(), body: JSON.stringify({ activo: false }) }
    );
    return res.status(200).json({ success: true });
  } catch (error_) {
    logger.error('formatos DELETE', { userId: user.id, err: errMsg(error_) });
    return res.status(500).json({ error: 'Error al eliminar formato' });
  }
}

export default async function handler(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  const { id } = req.query;

  if (req.method === 'GET') return handleGet(req, res, user);
  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    return handlePatch(req, res, user, id);
  }
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    return handleDelete(req, res, user, id);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
