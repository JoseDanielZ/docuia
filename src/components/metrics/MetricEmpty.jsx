export default function MetricEmpty({ onGenerar }) {
  return (
    <div className="metric-empty">
      <div className="metric-empty__icon">📄</div>
      <h3>Aún no has generado reportes</h3>
      <p>
        Cuando generes tu primer documento, aquí verás un resumen de tu actividad
        y el tiempo que has ahorrado.
      </p>
      <button className="metric-empty__cta" onClick={onGenerar}>
        Generar mi primer reporte →
      </button>
    </div>
  );
}
