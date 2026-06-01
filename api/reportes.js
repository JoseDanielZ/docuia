import { verifyBearerUser, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

const PAGE_LIMIT = 20;

function supabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

async function handlePost(req, res, user) {
  const {
    email_docente, nombre_docente, institucion,
    curso, periodo, tipo_reporte, datos_ingresados, reporte_generado,
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
    const r = await fetch(`${supabaseUrl()}/rest/v1/reportes`, {
      method: 'POST',
      headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id:          user.id,
        email_docente:    typeof email_docente  === 'string' ? email_docente.slice(0, 320)  : (user.email || ''),
        nombre_docente:   typeof nombre_docente === 'string' ? nombre_docente.slice(0, 320) : (user.user_metadata?.name || ''),
        institucion:      typeof institucion    === 'string' ? institucion.slice(0, 320)    : '',
        curso:            typeof curso          === 'string' ? curso.slice(0, 320)          : '',
        periodo:          typeof periodo        === 'string' ? periodo.slice(0, 320)        : '',
        tipo_reporte:     tipo_reporte.slice(0, 64),
        datos_ingresados: datos_ingresados && typeof datos_ingresados === 'object' ? datos_ingresados : {},
        reporte_generado,
        archivado:        false,
      }),
    });
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(201).json({ success: true, reporte: data[0] });
    logger.warn('reportes POST: no row returned', { userId: user.id });
    return res.status(400).json({ error: 'No se pudo guardar el reporte' });
  } catch (error_) {
    logger.error('reportes POST', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handleGetOne(req, res, user, id) {
  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/reportes?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=*`,
      { headers: serviceRestHeaders() }
    );
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(200).json({ reporte: data[0] });
    return res.status(404).json({ error: 'Reporte no encontrado' });
  } catch (error_) {
    logger.error('reportes GET single', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al obtener reporte' });
  }
}

async function handleGetList(req, res, user) {
  const limit  = Math.min(Number.parseInt(req.query.limit  ?? PAGE_LIMIT, 10) || PAGE_LIMIT, 100);
  const offset = Math.max(Number.parseInt(req.query.offset ?? 0,          10) || 0, 0);

  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/reportes` +
      `?user_id=eq.${user.id}&archivado=eq.false` +
      `&order=created_at.desc` +
      `&limit=${limit + 1}&offset=${offset}` +
      `&select=id,created_at,nombre_docente,curso,periodo,tipo_reporte,institucion,fue_copiado`,
      { headers: serviceRestHeaders() }
    );
    const rows    = await r.json();
    const list    = Array.isArray(rows) ? rows : [];
    const hasMore = list.length > limit;
    return res.status(200).json({ reportes: hasMore ? list.slice(0, limit) : list, hasMore, offset, limit });
  } catch (error_) {
    logger.error('reportes GET list', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al listar reportes' });
  }
}

async function handlePatch(req, res, user, id) {
  const { reporte_generado, feedback, feedback_nota } = req.body || {};

  const updateFields = {};

  if (reporte_generado !== undefined) {
    if (typeof reporte_generado !== 'string')
      return res.status(400).json({ error: 'reporte_generado debe ser string' });
    if (reporte_generado.length > 500_000)
      return res.status(413).json({ error: 'El reporte es demasiado largo' });
    updateFields.reporte_generado = reporte_generado;
  }

  if (feedback !== undefined) {
    if (feedback !== 1 && feedback !== -1 && feedback !== null)
      return res.status(400).json({ error: 'feedback debe ser 1, -1 o null' });
    updateFields.feedback = feedback;
  }

  if (feedback_nota !== undefined) {
    if (typeof feedback_nota !== 'string' && feedback_nota !== null)
      return res.status(400).json({ error: 'feedback_nota debe ser string o null' });
    updateFields.feedback_nota = feedback_nota;
  }

  if (Object.keys(updateFields).length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/reportes?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify(updateFields),
      }
    );
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(200).json({ success: true, reporte: data[0] });
    return res.status(404).json({ error: 'Reporte no encontrado' });
  } catch (error_) {
    logger.error('reportes PATCH', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al actualizar reporte' });
  }
}

async function handleDelete(req, res, user, id) {
  try {
    await fetch(
      `${supabaseUrl()}/rest/v1/reportes?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: serviceRestHeaders(),
        body: JSON.stringify({ archivado: true }),
      }
    );
    return res.status(200).json({ success: true });
  } catch (error_) {
    logger.error('reportes DELETE', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al archivar reporte' });
  }
}

export default async function handler(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  const { id } = req.query;

  if (req.method === 'POST')   return handlePost(req, res, user);
  if (req.method === 'GET' && id) return handleGetOne(req, res, user, id);
  if (req.method === 'GET')    return handleGetList(req, res, user);
  if (req.method === 'PATCH')  {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    return handlePatch(req, res, user, id);
  }
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Falta id' });
    return handleDelete(req, res, user, id);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
