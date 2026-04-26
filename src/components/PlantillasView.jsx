import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";

export default function PlantillasView({ plantillas, deletePlantilla, loadTemplate, goBack }) {
  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div className="cursos-header">
          <div>
            <h2 className="cursos-title">Mis plantillas</h2>
            <p className="cursos-subtitle">
              Plantillas guardadas con datos pre-llenados para acelerar la creación de reportes.
            </p>
          </div>
          <button className="cursos-add-btn" onClick={goBack}>
            ← Volver al formulario
          </button>
        </div>

        {plantillas.length === 0 && (
          <div className="cursos-empty">
            Aún no tienes plantillas. Llena un formulario y pulsa <b>Guardar como plantilla</b>.
          </div>
        )}

        <div className="cursos-grid">
          {plantillas.map(p => {
            const tipo = REPORT_TYPES.find(r => r.id === p.tipo_reporte)?.label || p.tipo_reporte;
            const numCampos = p.datos ? Object.keys(p.datos).filter(k => p.datos[k]).length : 0;
            return (
              <div key={p.id} className="curso-card">
                <div className="curso-card-header">
                  <div className="curso-card-name">{p.nombre}</div>
                  <button
                    className="curso-card-delete"
                    onClick={() => deletePlantilla(p.id)}
                    title="Eliminar plantilla"
                  >&times;</button>
                </div>
                <div className="curso-card-meta">{tipo}</div>
                <div className="curso-card-details">
                  {numCampos} campos guardados · {new Date(p.created_at).toLocaleDateString()}
                </div>
                <button
                  className="cursos-add-btn"
                  style={{ marginTop: 12, width: "100%" }}
                  onClick={() => loadTemplate(p)}
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
