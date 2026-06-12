import { useState, useMemo } from 'react';
import './metrics.css';
import MetricCard from './MetricCard.jsx';
import MetricBarChart from './MetricBarChart.jsx';
import MetricRecentList from './MetricRecentList.jsx';
import MetricEmpty from './MetricEmpty.jsx';

const TIPO_LABELS = {
  informe_tutor:   'Informe Tutor/a',
  contingencia:    'Plan Contingencia',
  microcurricular: 'Planif. Micro',
  calificaciones:  'Calificaciones',
  asistencia:      'Asistencia',
};

function tipoMasUsado(porTipo) {
  if (!porTipo || !Object.keys(porTipo).length) return null;
  return Object.entries(porTipo).sort((a, b) => b[1] - a[1])[0][0];
}

function filterReportesByPeriodo(reportes, periodo) {
  if (!periodo || periodo === 'todo') return reportes;
  const now = Date.now();
  const limitMs = periodo === 'mes' ? 30 : periodo === 'tres_meses' ? 90 : 365;
  return reportes.filter(r => (now - new Date(r.created_at)) / 86400000 <= limitMs);
}

function filterReportesByTrimestre(reportes, trimestre) {
  if (!trimestre || trimestre === 'todo') return reportes;
  return reportes.filter(r => r.periodo?.includes(trimestre));
}

export default function MetricsView({ metricas, reportes = [], loading, onGenerar, onVerHistorial, onCursosClick }) {
  const [trimestre, setTrimestre] = useState('todo');
  const [periodo, setPeriodo] = useState('todo');

  const filteredReportes = useMemo(() => {
    let r = filterReportesByTrimestre(reportes, trimestre);
    r = filterReportesByPeriodo(r, periodo);
    return r;
  }, [reportes, trimestre, periodo]);

  const filteredMetricas = useMemo(() => {
    if (!filteredReportes.length) return null;
    const porTipo = {};
    let ultimo_mes = 0;
    const haceUnMes = Date.now() - 30 * 86400000;
    for (const r of filteredReportes) {
      if (r.tipo_reporte) porTipo[r.tipo_reporte] = (porTipo[r.tipo_reporte] || 0) + 1;
      if (new Date(r.created_at) >= haceUnMes) ultimo_mes++;
    }
    return {
      total_reportes: filteredReportes.length,
      ultimo_mes,
      por_tipo: porTipo,
      cursos_activos: metricas?.cursos_activos ?? 0,
      minutos_ahorrados: filteredReportes.length * 45,
    };
  }, [filteredReportes, metricas]);

  const isFiltered = trimestre !== 'todo' || periodo !== 'todo';
  const activeMetricas = isFiltered ? filteredMetricas : metricas;

  if (loading) {
    return (
      <div className="metrics-page">
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '64px 0' }}>
          Cargando métricas…
        </div>
      </div>
    );
  }

  const isEmpty = !activeMetricas || activeMetricas.total_reportes === 0;
  const topTipo = tipoMasUsado(activeMetricas?.por_tipo);
  const topTipoLabel = topTipo ? (TIPO_LABELS[topTipo] || topTipo) : '—';
  const horasAhorradas = activeMetricas ? Math.round(activeMetricas.minutos_ahorrados / 60) : 0;

  return (
    <div className="metrics-page">
      <div className="metrics-header">
        <div className="metrics-header__titles">
          <h2>Mis métricas</h2>
          <p>Resumen de tu actividad en DocuIA</p>
        </div>
        <div className="metrics-filters">
          <select value={trimestre} onChange={e => setTrimestre(e.target.value)}>
            <option value="todo">Todos los trimestres</option>
            <option value="I">I Trimestre</option>
            <option value="II">II Trimestre</option>
            <option value="III">III Trimestre</option>
          </select>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}>
            <option value="todo">Todo el tiempo</option>
            <option value="mes">Este mes</option>
            <option value="tres_meses">Últimos 3 meses</option>
            <option value="anio">Este año</option>
          </select>
        </div>
      </div>

      {isEmpty ? (
        <MetricEmpty onGenerar={onGenerar} />
      ) : (
        <>
          <div className="metrics-grid">
            <MetricCard
              icon="📋"
              value={activeMetricas.total_reportes}
              label="Reportes generados"
              sublabel={`${activeMetricas.ultimo_mes} en el último mes`}
              cta="Generar otro"
              onCta={onGenerar}
            />
            <MetricCard
              icon="🏫"
              value={activeMetricas.cursos_activos}
              label="Cursos registrados"
              sublabel="activos en la plataforma"
              cta="Ver mis cursos"
              onCta={onCursosClick}
            />
            <MetricCard
              icon="⭐"
              value={topTipoLabel}
              label="Tipo más usado"
              sublabel={`de ${activeMetricas.total_reportes} reportes totales`}
              cta="Generar uno"
              onCta={onGenerar}
            />
            <MetricCard
              icon="⏱️"
              value={`${horasAhorradas}h`}
              label="Tiempo ahorrado"
              sublabel="estimado vs redacción manual"
            />
          </div>

          <div className="metric-section">
            <span className="metric-section__title">Actividad por tipo de reporte</span>
            <MetricBarChart porTipo={activeMetricas.por_tipo} />
          </div>

          <MetricRecentList reportes={filteredReportes} onVerHistorial={onVerHistorial} />
        </>
      )}
    </div>
  );
}
