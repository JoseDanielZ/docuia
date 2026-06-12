import { fechaRelativa } from '../../utils/fechaRelativa.js';

const TIPO_LABELS = {
  informe_tutor:   'Tutor',
  contingencia:    'Contingencia',
  microcurricular: 'Planificación',
  calificaciones:  'Notas',
  asistencia:      'Asistencia',
};

const BADGE_CLASS = {
  informe_tutor:   'hist-badge--tutor',
  contingencia:    'hist-badge--contingencia',
  microcurricular: 'hist-badge--planificacion',
  calificaciones:  'hist-badge--notas',
  asistencia:      'hist-badge--asistencia',
};

export default function MetricRecentList({ reportes = [], onVerHistorial }) {
  const recent = [...reportes]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="metric-section">
      <div className="metric-recent-header">
        <span className="metric-section__title">Últimos reportes generados</span>
        <button className="metric-recent-link" onClick={onVerHistorial}>
          Ver historial →
        </button>
      </div>
      <div className="metric-recent-list">
        {recent.map(r => (
          <div key={r.id} className="metric-recent-item">
            <span className={`hist-badge ${BADGE_CLASS[r.tipo_reporte] || 'hist-badge--notas'}`}>
              {TIPO_LABELS[r.tipo_reporte] || r.tipo_reporte}
            </span>
            <div className="metric-recent-item__info">
              <div className="metric-recent-item__title">
                {TIPO_LABELS[r.tipo_reporte] || r.tipo_reporte}
                {r.curso ? ` · ${r.curso}` : ''}
              </div>
              <div className="metric-recent-item__date">{fechaRelativa(r.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
