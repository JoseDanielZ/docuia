import { useRef } from "react";
import PropTypes from "prop-types";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren } from "../utils/anim.js";
import { magneticHover } from "../utils/anim.js";

function MetricCard({ label, value, sub }) {
  return (
    <div className="metric-card" style={{ willChange: "transform" }}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub:   PropTypes.string,
};

function DashboardView({ reportes, cursos, metricas, goBack, loading }) {
  const headerRef = useRef(null);
  const cardsRef  = useRef(null);
  const goBackHover = magneticHover();

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(cardsRef, { y: 18, delay: 60, duration: 580, deps: [loading, reportes.length] });

  // Usar métricas server-side si están disponibles; si no, calcular localmente como fallback
  const totalReportes = metricas ? metricas.total_reportes : reportes.length;
  const totalCursos   = metricas ? metricas.cursos_activos : cursos.length;
  const totalCopiados = metricas ? metricas.total_copiados : reportes.filter(r => r.fue_copiado).length;
  const recientes     = metricas ? metricas.ultimo_mes     : (() => {
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    return reportes.filter(r => new Date(r.created_at) >= haceUnMes).length;
  })();

  const porTipo = REPORT_TYPES.map(rt => ({
    id:    rt.id,
    label: rt.label,
    count: metricas ? (metricas.por_tipo?.[rt.id] || 0) : reportes.filter(r => r.tipo_reporte === rt.id).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = porTipo[0]?.count || 1;

  const TIPO_BAR_COLORS = {
    semanal:        "var(--jade-500)",
    calificaciones: "var(--amber-500)",
    asistencia:     "#4A90E2",
    dece:           "#a78bfa",
    planificacion:  "#34d399",
  };

  return (
    <section className="cursos-section">
      <div className="cursos-container">

        {/* Header */}
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Mis métricas</h2>
            <p className="cursos-subtitle">Resumen de tu actividad en DocuIA</p>
          </div>
          <button className="cursos-add-btn" onClick={goBack} {...goBackHover}>
            ← Volver
          </button>
        </div>

        {loading ? (
          <div className="cursos-empty">
            <span style={{ fontSize: "1.8rem", animation: "emptyFloat 2s ease-in-out infinite" }}>⏳</span>
            <p>Cargando datos…</p>
          </div>
        ) : (
          <div ref={cardsRef}>

            {/* Stat cards */}
            <div className="dashboard-grid">
              <MetricCard
                label="Reportes generados"
                value={totalReportes}
                sub={recientes > 0 ? `${recientes} en el último mes` : "ninguno en el último mes"}
              />
              <MetricCard
                label="Cursos registrados"
                value={totalCursos}
                sub={totalCursos === 1 ? "1 curso activo" : `${totalCursos} cursos activos`}
              />
              <MetricCard
                label="Reportes copiados"
                value={totalCopiados}
                sub={totalReportes > 0 ? `${Math.round((totalCopiados / totalReportes) * 100)}% del total` : "—"}
              />
              <MetricCard
                label="Tipo más usado"
                value={porTipo[0]?.count ?? 0}
                sub={porTipo[0]?.label ?? "Sin datos aún"}
              />
            </div>

            {/* Desglose por tipo */}
            {porTipo.length > 0 && (
              <div className="breakdown-section">
                <p className="breakdown-title">Desglose por tipo de reporte</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {porTipo.map(({ id, label, count }) => (
                    <div key={id} className="breakdown-bar-row">
                      <span className="breakdown-bar-label">{label}</span>
                      <div className="breakdown-bar-track">
                        <div
                          className="breakdown-bar-fill"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            background: TIPO_BAR_COLORS[id] || "var(--grad-jade)",
                          }}
                        />
                      </div>
                      <span className="breakdown-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {totalReportes === 0 && (
              <div className="cursos-empty" style={{ paddingTop: 40 }}>
                <span style={{ fontSize: "2rem" }}>📊</span>
                <p>Aún no tienes reportes generados. Crea tu primer reporte para ver estadísticas.</p>
              </div>
            )}

          </div>
        )}
      </div>
    </section>
  );
}

DashboardView.propTypes = {
  reportes: PropTypes.arrayOf(PropTypes.object).isRequired,
  cursos:   PropTypes.arrayOf(PropTypes.object).isRequired,
  metricas: PropTypes.object,
  goBack:   PropTypes.func.isRequired,
  loading:  PropTypes.bool.isRequired,
};

export default DashboardView;
