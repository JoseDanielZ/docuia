export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  // Get user from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  // Verify token and get user
  let user;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ error: 'Token inválido' });
    user = userData;
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // GET - List user's courses
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cursos?user_id=eq.${user.id}&activo=eq.true&order=created_at.desc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const cursos = await response.json();
      return res.status(200).json({ cursos });
    } catch (e) {
      return res.status(500).json({ error: 'Error al obtener cursos' });
    }
  }

  // POST - Create new course
  if (req.method === 'POST') {
    const { nombre, grado, paralelo, asignatura, num_estudiantes, jornada, año_lectivo, periodo_actual, nombres_estudiantes, observaciones } = req.body;
    
    if (!nombre || !grado || !asignatura) {
      return res.status(400).json({ error: 'Nombre, grado y asignatura son obligatorios' });
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cursos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: user.id,
          nombre,
          grado,
          paralelo: paralelo || '',
          asignatura,
          num_estudiantes: parseInt(num_estudiantes) || 0,
          jornada: jornada || '',
          año_lectivo: año_lectivo || '',
          periodo_actual: periodo_actual || '',
          nombres_estudiantes: nombres_estudiantes || [],
          observaciones: observaciones || '',
          activo: true
        })
      });

      const curso = await response.json();
      if (Array.isArray(curso) && curso[0]) {
        return res.status(201).json({ success: true, curso: curso[0] });
      }
      return res.status(400).json({ error: 'Error al crear curso' });
    } catch (e) {
      return res.status(500).json({ error: 'Error del servidor', details: e.message });
    }
  }

  // DELETE - Soft delete course (mark as inactive)
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID del curso es requerido' });

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/cursos?id=eq.${id}&user_id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ activo: false })
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error al eliminar curso' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}