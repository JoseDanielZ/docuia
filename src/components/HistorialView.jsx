import { useRef } from "react";
import { animate } from "animejs";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren, magneticHover, pop } from "../utils/anim.js";

export default function HistorialView({ reportes, openReport, deleteReport, goBack, loading }) {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const goBackHover = magneticHover();

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(gridRef, { y: 22, delay: 70, duration: 600, deps: [reportes.length, loading] });

  const handleArchive = (id, el) => {
    if (!el) return deleteReport(id);
    animate(el, {
      opacity: [1, 0],
      scale: [1, 0.92],
      translateX: [0, 30],
      duration: 280,
      ease: "outQuad",
      onComplete: () => deleteReport(id),
    });
  };

  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Historial de reportes</h2>
            <p className="cursos-subtitle">
              Reportes que has generado. Puedes verlos, editarlos y descargarlos otra vez.
            </p>
          </div>
          <button className="cursos-add-btn" {...goBackHover} onClick={goBack}>
            ← Volver al formulario
          </button>
        </div>

        {loading && (
          <div className="cursos-empty">Cargando historial...</div>
        )}

        {!loading && reportes.length === 0 && (
          <div className="cursos-empty">
            Aún no tienes reportes guardados. Genera uno desde el formulario.
          </div>
        )}

        <div ref={gridRef} className="cursos-grid">
          {reportes.map(r => {
            const tipo = REPORT_TYPES.find(rt => rt.id === r.tipo_reporte)?.label || r.tipo_reporte;
            return (
              <div key={r.id} className="curso-card" style={{ willChange: "transform, opacity" }}>
                <div className="curso-card-header">
                  <div className="curso-card-name">{tipo}</div>
                  <button
                    className="curso-card-delete"
                    onClick={(e) => handleArchive(r.id, e.currentTarget.closest(".curso-card"))}
                    title="Archivar reporte"
                  >&times;</button>
                </div>
                <div className="curso-card-meta">
                  {r.curso || "Sin curso"} · {r.periodo || "Sin período"}
                </div>
                <div className="curso-card-details">
                  {new Date(r.created_at).toLocaleString()}
                </div>
                <button
                  className="cursos-add-btn"
                  style={{ marginTop: 12, width: "100%", willChange: "transform" }}
                  onClick={(e) => { pop(e.currentTarget, { scale: 1.04 }); openReport(r.id); }}
                >
                  Ver / editar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
