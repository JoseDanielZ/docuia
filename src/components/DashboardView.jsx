import MetricsView from './metrics/MetricsView.jsx';

export default function DashboardView({ reportes, metricas, loading, scrollToForm, onCursosClick, onVerHistorial }) {
  return (
    <MetricsView
      metricas={metricas}
      reportes={reportes}
      loading={loading}
      onGenerar={scrollToForm}
      onCursosClick={onCursosClick}
      onVerHistorial={onVerHistorial}
    />
  );
}
