import { useRef } from "react";
import { animate } from "animejs";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren, magneticHover, pop } from "../utils/anim.js";

export default function PlantillasView({ plantillas, deletePlantilla, loadTemplate, goBack }) {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const goBackHover = magneticHover();

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(gridRef, { y: 22, delay: 70, duration: 600, deps: [plantillas.length] });

  const handleDelete = (id, el) => {
    if (!el) return deletePlantilla(id);
    animate(el, {
      opacity: [1, 0],
      scale: [1, 0.92],
      translateX: [0, 30],
      duration: 280,
      ease: "outQuad",
      onComplete: () => deletePlantilla(id),
    });
  };

  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Mis plantillas</h2>
            <p className="cursos-subtitle">
              Plantillas guardadas con datos pre-llenados para acelerar la creación de reportes.
            </p>
          </div>
          <button className="cursos-add-btn" {...goBackHover} onClick={goBack}>
            ← Volver al formulario
          </button>
        </div>

        {plantillas.length === 0 && (
          <div className="cursos-empty">
            Aún no tienes plantillas. Llena un formulario y pulsa <b>Guardar como plantilla</b>.
          </div>
        )}

        <div ref={gridRef} className="cursos-grid">
          {plantillas.map(p => {
            const tipo = REPORT_TYPES.find(r => r.id === p.tipo_reporte)?.label || p.tipo_reporte;
            const numCampos = p.datos ? Object.keys(p.datos).filter(k => p.datos[k]).length : 0;
            return (
              <div key={p.id} className="curso-card" style={{ willChange: "transform, opacity" }}>
                <div className="curso-card-header">
                  <div className="curso-card-name">{p.nombre}</div>
                  <button
                    className="curso-card-delete"
                    onClick={(e) => handleDelete(p.id, e.currentTarget.closest(".curso-card"))}
                    title="Eliminar plantilla"
                  >&times;</button>
                </div>
                <div className="curso-card-meta">{tipo}</div>
                <div className="curso-card-details">
                  {numCampos} campos guardados · {new Date(p.created_at).toLocaleDateString()}
                </div>
                <button
                  className="cursos-add-btn"
                  style={{ marginTop: 12, width: "100%", willChange: "transform" }}
                  onClick={(e) => { pop(e.currentTarget, { scale: 1.04 }); loadTemplate(p); }}
                >
                  Usar plantilla
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
