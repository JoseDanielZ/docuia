import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";

export default function HistorialView({ reportes, openReport, deleteReport, goBack, loading }) {
  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div className="cursos-header">
          <div>
            <h2 className="cursos-title">Historial de reportes</h2>
            <p className="cursos-subtitle">
              Reportes que has generado. Puedes verlos, editarlos y descargarlos otra vez.
            </p>
          </div>
          <button className="cursos-add-btn" onClick={goBack}>
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

        <div className="cursos-grid">
          {reportes.map(r => {
            const tipo = REPORT_TYPES.find(rt => rt.id === r.tipo_reporte)?.label || r.tipo_reporte;
            return (
              <div key={r.id} className="curso-card">
                <div className="curso-card-header">
                  <div className="curso-card-name">{tipo}</div>
                  <button
                    className="curso-card-delete"
                    onClick={() => deleteReport(r.id)}
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
                  style={{ marginTop: 12, width: "100%" }}
                  onClick={() => openReport(r.id)}
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
