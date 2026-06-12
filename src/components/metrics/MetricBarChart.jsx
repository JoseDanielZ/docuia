const TIPO_LABELS = {
  informe_tutor:   'Informe Tutor/a',
  contingencia:    'Plan Contingencia',
  microcurricular: 'Planif. Micro',
  calificaciones:  'Calificaciones',
  asistencia:      'Asistencia',
};

const TIPOS = Object.keys(TIPO_LABELS);

export default function MetricBarChart({ porTipo = {} }) {
  const entries = TIPOS.map(id => ({ id, label: TIPO_LABELS[id], count: porTipo[id] || 0 }))
    .filter(e => e.count > 0);

  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(e => e.count));

  return (
    <div className="metric-bar-list">
      {entries.map(({ id, label, count }) => (
        <div key={id} className="metric-bar-row">
          <div className="metric-bar-row__label">{label}</div>
          <div className="metric-bar-track">
            <div
              className="metric-bar-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <div className="metric-bar-row__count">{count}</div>
        </div>
      ))}
    </div>
  );
}
