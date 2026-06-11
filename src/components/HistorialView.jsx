import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { animate } from "animejs";
import "./CursosView.css";
import { REPORT_TYPES } from "../config.js";
import { useEnter, useStaggerChildren, magneticHover, pop } from "../utils/anim.js";

const TIPO_ICONS = {
  // tipos actuales
  contingencia:    "📋",
  calificaciones:  "📊",
  asistencia:      "📅",
  informe_tutor:   "🧑‍🏫",
  microcurricular: "📐",
  // backward compat — reportes anteriores a la migración SQL
  semanal:         "📋",
  dece:            "🧠",
  planificacion:   "📐",
};

const TIPO_CSS_CLASS = {
  // tipos actuales
  contingencia:    "tipo-semanal",
  calificaciones:  "tipo-calificaciones",
  asistencia:      "tipo-asistencia",
  informe_tutor:   "tipo-dece",
  microcurricular: "tipo-planificacion",
  // backward compat
  semanal:         "tipo-semanal",
  dece:            "tipo-dece",
  planificacion:   "tipo-planificacion",
};

export default function HistorialView({
  reportes, openReport, deleteReport, goBack,
  loading, hasMore, onLoadMore,
}) {
  const headerRef  = useRef(null);
  const listRef    = useRef(null);
  const goBackHover = magneticHover();

  const [filtros, setFiltros] = useState({ tipo: '', desde: '', hasta: '' });

  const reportesFiltrados = reportes.filter(r => {
    const matchTipo  = !filtros.tipo || r.tipo_reporte === filtros.tipo;
    const fecha      = new Date(r.created_at);
    const matchDesde = !filtros.desde || fecha >= new Date(filtros.desde);
    const matchHasta = !filtros.hasta || fecha <= new Date(filtros.hasta + 'T23:59:59');
    return matchTipo && matchDesde && matchHasta;
  });
  const hayFiltros = filtros.tipo || filtros.desde || filtros.hasta;

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(listRef, {
    y: 16, delay: 50, duration: 550,
    deps: [reportesFiltrados.length, loading, filtros],
  });

  const handleArchive = (id, el) => {
    if (!el) return deleteReport(id);
    animate(el, {
      opacity: [1, 0], scale: [1, 0.94], translateX: [0, 24],
      duration: 260, ease: "outQuad",
      onComplete: () => deleteReport(id),
    });
  };

  return (
    <section className="cursos-section">
      <div className="cursos-container">

        {/* Header */}
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Historial de reportes</h2>
            <p className="cursos-subtitle">Reportes generados. Puedes verlos, editarlos y descargarlos otra vez.</p>
          </div>
          <button className="cursos-add-btn" {...goBackHover} onClick={goBack}>
            ← Volver al formulario
          </button>
        </div>

        {/* Filtros */}
        {reportes.length > 0 && (
          <div className="historial-filters">
            <select
              value={filtros.tipo}
              onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
              className="filter-select"
              aria-label="Filtrar por tipo de reporte"
              style={{ minWidth: 160 }}
            >
              <option value="">Todos los tipos</option>
              {REPORT_TYPES.map(rt => <option key={rt.id} value={rt.id}>{rt.label}</option>)}
            </select>

            <input
              type="date" value={filtros.desde}
              onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))}
              className="filter-input" aria-label="Desde"
            />
            <input
              type="date" value={filtros.hasta}
              onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))}
              className="filter-input" aria-label="Hasta"
            />

            {hayFiltros && (
              <button
                className="cursos-add-btn"
                onClick={() => setFiltros({ tipo: '', desde: '', hasta: '' })}
                style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-default)", boxShadow: "none" }}
              >
                Limpiar
              </button>
            )}

            {hayFiltros && (
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: "auto" }}>
                {reportesFiltrados.length} de {reportes.length}
              </span>
            )}
          </div>
        )}

        {/* Estado: cargando */}
        {loading && reportes.length === 0 && (
          <div className="cursos-empty" aria-live="polite">
            <span style={{ fontSize: "1.8rem", animation: "emptyFloat 2s ease-in-out infinite" }}>⏳</span>
            <p>Cargando historial…</p>
          </div>
        )}

        {/* Estado: vacío */}
        {!loading && reportes.length === 0 && (
          <div className="cursos-empty">
            <span style={{ fontSize: "2.2rem" }}>📄</span>
            <p>Todavía no has generado reportes.</p>
            <button className="cursos-add-btn" onClick={goBack}>Generar mi primer reporte</button>
          </div>
        )}

        {/* Sin resultados con filtros */}
        {!loading && reportes.length > 0 && reportesFiltrados.length === 0 && (
          <div className="cursos-empty">
            <span style={{ fontSize: "1.8rem" }}>🔍</span>
            <p>No hay reportes con los filtros seleccionados.</p>
          </div>
        )}

        {/* Lista */}
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 10 }} role="list">
          {reportesFiltrados.map(r => {
            const tipoLabel = REPORT_TYPES.find(rt => rt.id === r.tipo_reporte)?.label || r.tipo_reporte;
            const icono     = TIPO_ICONS[r.tipo_reporte] || "📄";
            const tipoCls   = TIPO_CSS_CLASS[r.tipo_reporte] || "";
            return (
              <article
                key={r.id}
                role="listitem"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto",
                  gap: 14,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "border-color 200ms, background 200ms, transform 200ms",
                  willChange: "transform",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.background = "var(--bg-elevated)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.background = "var(--bg-surface)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {/* Indicador de tipo */}
                <div className={`historial-tipo-indicator ${tipoCls}`}>{icono}</div>

                {/* Información */}
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14, marginBottom: 3, fontFamily: "var(--font-body)" }}>
                    {tipoLabel} — {r.curso || "Sin curso"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 10, flexWrap: "wrap", fontFamily: "var(--font-mono)" }}>
                    <span>{r.periodo || "Sin período"}</span>
                    <span>·</span>
                    <span>{new Date(r.created_at).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {r.fue_copiado && <span style={{ color: "var(--jade-500)" }}>· Copiado</span>}
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <button
                    className="cursos-add-btn"
                    style={{ padding: "7px 14px", fontSize: 12, willChange: "transform" }}
                    onClick={(e) => { pop(e.currentTarget, { scale: 1.04 }); openReport(r.id); }}
                  >
                    Ver
                  </button>
                  <button
                    className="curso-card-delete"
                    onClick={(e) => handleArchive(r.id, e.currentTarget.closest("article"))}
                    aria-label={`Archivar reporte de ${tipoLabel}`}
                    title="Archivar"
                  >×</button>
                </div>
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
              style={{ minWidth: 200, padding: "11px 24px" }}
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
