import { verifyBearerUser, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

function supabaseUrl() {
  return process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
}

async function handleGet(res, user) {
  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/cursos?user_id=eq.${user.id}&activo=eq.true&order=created_at.desc&limit=50`,
      { headers: serviceRestHeaders() }
    );
    const cursos = await r.json();
    return res.status(200).json({ cursos: Array.isArray(cursos) ? cursos : [] });
  } catch (error_) {
    logger.error('cursos GET', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al obtener cursos' });
  }
}

async function handlePost(req, res, user) {
  const { nombre, grado, paralelo, asignatura, num_estudiantes, jornada, año_lectivo, periodo_actual, nombres_estudiantes, observaciones } = req.body || {};

  if (!nombre || !grado || !asignatura) {
    return res.status(400).json({ error: 'Nombre, grado y asignatura son obligatorios' });
  }
  if (typeof nombre !== 'string' || nombre.length > 200) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }

  try {
    const r = await fetch(`${supabaseUrl()}/rest/v1/cursos`, {
      method: 'POST',
      headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id:             user.id,
        nombre:              String(nombre).slice(0, 200),
        grado:               String(grado).slice(0, 100),
        paralelo:            paralelo    ? String(paralelo).slice(0, 20)    : '',
        asignatura:          String(asignatura).slice(0, 200),
        num_estudiantes:     Number.parseInt(num_estudiantes, 10) || 0,
        jornada:             jornada     ? String(jornada).slice(0, 50)     : '',
        año_lectivo:         año_lectivo ? String(año_lectivo).slice(0, 20) : '',
        periodo_actual:      periodo_actual ? String(periodo_actual).slice(0, 100) : '',
        nombres_estudiantes: Array.isArray(nombres_estudiantes) ? nombres_estudiantes : [],
        observaciones:       observaciones ? String(observaciones).slice(0, 2000) : '',
        activo: true,
      }),
    });
    const curso = await r.json();
    if (Array.isArray(curso) && curso[0]) return res.status(201).json({ success: true, curso: curso[0] });
    return res.status(400).json({ error: 'Error al crear curso' });
  } catch (error_) {
    logger.error('cursos POST', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

async function handlePatch(req, res, user) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID del curso es requerido' });

  const { nombre, grado, paralelo, asignatura, num_estudiantes, jornada, año_lectivo, periodo_actual, observaciones } = req.body || {};

  if (!nombre || !grado || !asignatura) {
    return res.status(400).json({ error: 'Nombre, grado y asignatura son obligatorios' });
  }

  try {
    const r = await fetch(
      `${supabaseUrl()}/rest/v1/cursos?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&activo=eq.true`,
      {
        method: 'PATCH',
        headers: { ...serviceRestHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({
          nombre:          String(nombre).slice(0, 200),
          grado:           String(grado).slice(0, 100),
          paralelo:        paralelo       ? String(paralelo).slice(0, 20)        : '',
          asignatura:      String(asignatura).slice(0, 200),
          num_estudiantes: Number.parseInt(num_estudiantes, 10) || 0,
          jornada:         jornada        ? String(jornada).slice(0, 50)         : '',
          año_lectivo:     año_lectivo    ? String(año_lectivo).slice(0, 20)     : '',
          periodo_actual:  periodo_actual ? String(periodo_actual).slice(0, 100) : '',
          observaciones:   observaciones  ? String(observaciones).slice(0, 2000) : '',
        }),
      }
    );
    const data = await r.json();
    if (Array.isArray(data) && data[0]) return res.status(200).json({ success: true, curso: data[0] });
    return res.status(404).json({ error: 'Curso no encontrado' });
  } catch (error_) {
    logger.error('cursos PATCH', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al actualizar curso' });
  }
}

async function handleDelete(req, res, user) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID del curso es requerido' });

  try {
    await fetch(`${supabaseUrl()}/rest/v1/cursos?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`, {
      method: 'PATCH',
      headers: serviceRestHeaders(),
      body: JSON.stringify({ activo: false }),
    });
    return res.status(200).json({ success: true });
  } catch (error_) {
    logger.error('cursos DELETE', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al eliminar curso' });
  }
}

export default async function handler(req, res) {
  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  if (req.method === 'GET')    return handleGet(res, user);
  if (req.method === 'POST')   return handlePost(req, res, user);
  if (req.method === 'PATCH')  return handlePatch(req, res, user);
  if (req.method === 'DELETE') return handleDelete(req, res, user);

  return res.status(405).json({ error: 'Método no permitido' });
}
