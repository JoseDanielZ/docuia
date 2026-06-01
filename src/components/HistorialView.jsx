import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { animate } from "animejs";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren, magneticHover, pop } from "../utils/anim.js";

export default function HistorialView({
  reportes, openReport, deleteReport, goBack,
  loading, hasMore, onLoadMore,
}) {
  const headerRef  = useRef(null);
  const gridRef    = useRef(null);
  const goBackHover = magneticHover();

  const [filtros, setFiltros] = useState({ tipo: '', desde: '', hasta: '' });

  const reportesFiltrados = reportes.filter(r => {
    const matchTipo = !filtros.tipo || r.tipo_reporte === filtros.tipo;
    const fecha = new Date(r.created_at);
    const matchDesde = !filtros.desde || fecha >= new Date(filtros.desde);
    const matchHasta = !filtros.hasta || fecha <= new Date(filtros.hasta + 'T23:59:59');
    return matchTipo && matchDesde && matchHasta;
  });
  const hayFiltros = filtros.tipo || filtros.desde || filtros.hasta;

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(gridRef, {
    y: 22, delay: 70, duration: 600,
    deps: [reportesFiltrados.length, loading, filtros],
  });

  const handleArchive = (id, el) => {
    if (!el) return deleteReport(id);
    animate(el, {
      opacity: [1, 0], scale: [1, 0.92], translateX: [0, 30],
      duration: 280, ease: "outQuad",
      onComplete: () => deleteReport(id),
    });
  };

  const inputStyle = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 13, padding: "8px 10px",
    border: "1px solid var(--line)", borderRadius: 8,
    background: "var(--paper)", color: "var(--ink)",
    outline: "none",
  };

  return (
    <section className="cursos-section">
      <div className="cursos-container">

        {/* Header */}
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Historial de reportes</h2>
            <p className="cursos-subtitle">
              Reportes generados. Puedes verlos, editarlos y descargarlos otra vez.
            </p>
          </div>
          <button className="cursos-add-btn" {...goBackHover} onClick={goBack}>
            ← Volver al formulario
          </button>
        </div>

        {/* Barra de filtros */}
        {reportes.length > 0 && (
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
            marginBottom: 20, padding: "14px 16px",
            background: "var(--paper-2)", border: "1px solid var(--line)",
            borderRadius: 10,
          }}>
            <select
              value={filtros.tipo}
              onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
              style={{ ...inputStyle, minWidth: 160 }}
              aria-label="Filtrar por tipo de reporte"
            >
              <option value="">Todos los tipos</option>
              {REPORT_TYPES.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={filtros.desde}
              onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))}
              style={inputStyle}
              aria-label="Desde fecha"
              title="Desde"
            />
            <input
              type="date"
              value={filtros.hasta}
              onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))}
              style={inputStyle}
              aria-label="Hasta fecha"
              title="Hasta"
            />

            {hayFiltros && (
              <button
                className="btn btn-ghost"
                onClick={() => setFiltros({ tipo: '', desde: '', hasta: '' })}
                style={{ fontSize: 12, padding: "8px 14px" }}
              >
                Limpiar filtros
              </button>
            )}

            {hayFiltros && (
              <span style={{
                fontSize: 12, color: "var(--muted)",
                fontFamily: "'IBM Plex Mono', monospace",
                marginLeft: "auto",
              }}>
                {reportesFiltrados.length} de {reportes.length} cargados
              </span>
            )}
          </div>
        )}

        {/* Estados */}
        {loading && reportes.length === 0 && (
          <div className="cursos-empty" aria-live="polite">Cargando historial…</div>
        )}

        {!loading && reportes.length === 0 && (
          <div className="cursos-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: "2rem" }}>📄</span>
            <p style={{ margin: 0 }}>Todavía no has generado reportes.</p>
            <button className="cursos-add-btn" onClick={goBack}>Generar mi primer reporte</button>
          </div>
        )}

        {!loading && reportes.length > 0 && reportesFiltrados.length === 0 && (
          <div className="cursos-empty">
            No hay reportes que coincidan con los filtros seleccionados.
          </div>
        )}

        {/* Grid */}
        <div ref={gridRef} className="cursos-grid" role="list">
          {reportesFiltrados.map(r => {
            const tipo = REPORT_TYPES.find(rt => rt.id === r.tipo_reporte)?.label || r.tipo_reporte;
            return (
              <article
                key={r.id}
                className="curso-card"
                role="listitem"
                style={{ willChange: "transform, opacity" }}
              >
                <div className="curso-card-header">
                  <div className="curso-card-name">{tipo}</div>
                  <button
                    className="curso-card-delete"
                    onClick={(e) => handleArchive(r.id, e.currentTarget.closest("article"))}
                    aria-label={`Archivar reporte de ${tipo}`}
                    title="Archivar reporte"
                  >×</button>
                </div>
                <div className="curso-card-meta">
                  {r.curso || "Sin curso"} · {r.periodo || "Sin período"}
                </div>
                <div className="curso-card-details">
                  {new Date(r.created_at).toLocaleString('es-EC', {
                    dateStyle: 'short', timeStyle: 'short',
                  })}
                </div>
                <button
                  className="cursos-add-btn"
                  style={{ marginTop: 12, width: "100%", willChange: "transform" }}
                  onClick={(e) => { pop(e.currentTarget, { scale: 1.04 }); openReport(r.id); }}
                >
                  Ver / editar
                </button>
              </article>
            );
          })}
        </div>

        {/* Cargar más */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button
              className="btn btn-ghost"
              onClick={onLoadMore}
              disabled={loading}
              style={{ minWidth: 180, padding: "11px 24px" }}
            >
              {loading ? "Cargando…" : "Cargar más reportes"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

HistorialView.propTypes = {
  reportes:     PropTypes.arrayOf(PropTypes.object).isRequired,
  openReport:   PropTypes.func.isRequired,
  deleteReport: PropTypes.func.isRequired,
  goBack:       PropTypes.func.isRequired,
  loading:      PropTypes.bool.isRequired,
  hasMore:      PropTypes.bool.isRequired,
  onLoadMore:   PropTypes.func.isRequired,
};
