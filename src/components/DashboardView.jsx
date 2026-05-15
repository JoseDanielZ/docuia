import { useRef } from "react";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren } from "../utils/anim.js";
import { magneticHover } from "../utils/anim.js";

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "24px 28px",
      boxShadow: "var(--shadow)",
    }}>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, color: "var(--muted)",
        letterSpacing: ".1em", textTransform: "uppercase",
        margin: "0 0 8px",
      }}>{label}</p>
      <p style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: 42, fontWeight: 400,
        color: "var(--ink)", margin: "0 0 4px",
        lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 12, color: "var(--muted)", margin: 0,
        }}>{sub}</p>
      )}
    </div>
  );
}

export default function DashboardView({ reportes, cursos, goBack, loading }) {
  const headerRef = useRef(null);
  const cardsRef  = useRef(null);
  const goBackHover = magneticHover();

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(cardsRef, { y: 18, delay: 60, duration: 580, deps: [loading, reportes.length] });

  // Métricas calculadas del lado del cliente
  const totalReportes = reportes.length;
  const totalCursos   = cursos.length;
  const totalCopiados = reportes.filter(r => r.fue_copiado).length;

  const porTipo = REPORT_TYPES.map(rt => ({
    id:    rt.id,
    label: rt.label,
    count: reportes.filter(r => r.tipo_reporte === rt.id).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = porTipo[0]?.count || 1;

  const tipoMasUsado = porTipo[0]
    ? `${porTipo[0].label} (${porTipo[0].count})`
    : "—";

  // Reportes del último mes
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
  const recientes = reportes.filter(r => new Date(r.created_at) >= haceUnMes).length;

  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h1 className="cursos-title">Mis métricas</h1>
            <p className="cursos-subtitle">Resumen de tu actividad en DocuIA</p>
          </div>
          <button className="cursos-add-btn" onClick={goBack} {...goBackHover}>
            ← Volver
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14 }}>
            Cargando datos…
          </p>
        ) : (
          <div ref={cardsRef}>
            {/* Stat cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14, marginBottom: 28,
            }}>
              <StatCard
                label="Reportes generados"
                value={totalReportes}
                sub={recientes > 0 ? `${recientes} en el último mes` : "ninguno en el último mes"}
              />
              <StatCard
                label="Cursos registrados"
                value={totalCursos}
                sub={totalCursos === 1 ? "1 curso activo" : `${totalCursos} cursos activos`}
              />
              <StatCard
                label="Reportes copiados"
                value={totalCopiados}
                sub={totalReportes > 0 ? `${Math.round((totalCopiados / totalReportes) * 100)}% del total` : "—"}
              />
              <StatCard
                label="Tipo más usado"
                value={porTipo[0]?.count ?? 0}
                sub={porTipo[0]?.label ?? "Sin datos aún"}
              />
            </div>

            {/* Desglose por tipo */}
            {porTipo.length > 0 && (
              <div style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "24px 28px",
                boxShadow: "var(--shadow)",
              }}>
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, color: "var(--muted)",
                  letterSpacing: ".1em", textTransform: "uppercase",
                  margin: "0 0 20px",
                }}>Desglose por tipo de reporte</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {porTipo.map(({ id, label, count }) => (
                    <div key={id}>
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: 13, color: "var(--ink)", marginBottom: 6,
                      }}>
                        <span>{label}</span>
                        <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                          {count} {count === 1 ? "reporte" : "reportes"}
                        </span>
                      </div>
                      <div style={{
                        height: 6, borderRadius: 4,
                        background: "var(--line)",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${(count / maxCount) * 100}%`,
                          background: "var(--accent)",
                          borderRadius: 4,
                          transition: "width .6s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalReportes === 0 && (
              <div style={{
                textAlign: "center", padding: "48px 0",
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: "var(--muted)", fontSize: 14,
              }}>
                Aún no tienes reportes generados. Crea tu primer reporte para ver estadísticas.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
