export default function MetricCard({ icon, value, label, sublabel, cta, onCta }) {
  return (
    <div className="metric-card">
      {icon && <div className="metric-card__icon">{icon}</div>}
      <div className="metric-card__value">{value}</div>
      <div className="metric-card__label">{label}</div>
      {sublabel && <div className="metric-card__sublabel">{sublabel}</div>}
      {cta && (
        <button className="metric-card__cta" onClick={onCta}>
          {cta} →
        </button>
      )}
    </div>
  );
}
