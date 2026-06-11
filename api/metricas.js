import { verifyBearerUser, getSupabaseEnv, serviceRestHeaders } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });

  const { url } = getSupabaseEnv();

  try {
    const [reportesRes, cursosRes] = await Promise.all([
      fetch(
        `${url}/rest/v1/reportes?user_id=eq.${user.id}&archivado=eq.false&select=id,created_at,tipo_reporte,fue_copiado`,
        { headers: serviceRestHeaders() }
      ),
      fetch(
        `${url}/rest/v1/cursos?user_id=eq.${user.id}&activo=eq.true&select=id`,
        { headers: serviceRestHeaders() }
      ),
    ]);

    const reportes = await reportesRes.json();
    const cursos   = await cursosRes.json();

    if (!Array.isArray(reportes) || !Array.isArray(cursos)) {
      return res.status(500).json({ error: 'Error al obtener métricas' });
    }

    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    const haceUnMesISO = haceUnMes.toISOString();

    const por_tipo = {};
    let ultimo_mes    = 0;
    let total_copiados = 0;

    for (const r of reportes) {
      if (r.tipo_reporte) por_tipo[r.tipo_reporte] = (por_tipo[r.tipo_reporte] || 0) + 1;
      if (r.fue_copiado) total_copiados++;
      if (r.created_at >= haceUnMesISO) ultimo_mes++;
    }

    return res.status(200).json({
      total_reportes: reportes.length,
      ultimo_mes,
      total_copiados,
      por_tipo,
      cursos_activos: cursos.length,
    });
  } catch (error_) {
    logger.error('metricas GET', { userId: user.id, err: error_.message });
    return res.status(500).json({ error: 'Error al calcular métricas' });
  }
}
