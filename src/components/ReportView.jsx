import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { REPORT_TYPES } from "../config.js";
import { downloadPDF, downloadExcel, printReport } from "../utils/download.js";
import { exportToDocx } from "../utils/docxExporter.js";
import { pop, magneticHover } from "../utils/anim.js";
import { useToast } from "./Toast.jsx";
import { authFetch } from "../utils/auth.js";
import TooltipHelper from "./assistant/TooltipHelper.jsx";
import FormatoPreviewModal from "./FormatoPreviewModal.jsx";
import "./ReportView.css";

/* ── Utilidades puras ──────────────────────────────────────────────────── */

function parsearSecciones(texto) {
  const regex = /(?=\n(?:#{1,3}|\d+\.)\s)/;
  return texto.split(regex)
    .map((contenido, index) => ({
      id: index,
      contenido: contenido.trim(),
      titulo: contenido.match(/^(?:#{1,3}|\d+\.)\s+(.+)/m)?.[1]?.trim() || `Sección ${index + 1}`,
    }))
    .filter(s => s.contenido.length > 0);
}

function detectarInconsistencia(reporteTexto, datosFormulario) {
  const gradoEsperado = datosFormulario.curso?.toLowerCase() || '';
  const gradosEncontrados = reporteTexto.match(/\b(\d+vo|\d+mo|\d+ro|\d+to)\b/gi) || [];
  return gradosEncontrados.some(g => !gradoEsperado.includes(g.toLowerCase()));
}

/* ── Toolbar de formato ────────────────────────────────────────────────── */

function FormatToolbar({ onFormat }) {
  const tools = [
    { label: "N",  title: "Negrita",          style: { fontWeight: 700 }, action: "bold"    },
    { label: "I",  title: "Cursiva",           style: { fontStyle: "italic" }, action: "italic"  },
    { label: "T",  title: "Título de sección", style: { fontSize: 13 },    action: "heading" },
    { label: "—",  title: "Línea separadora",  style: {},                  action: "divider" },
  ];

  return (
    <div className="format-toolbar">
      <span className="format-toolbar__label">Formato</span>
      {tools.map(t => (
        <button
          key={t.action}
          className="format-toolbar__btn"
          title={t.title}
          aria-label={t.title}
          onClick={(e) => { onFormat(t.action); pop(e.currentTarget, { scale: 1.12, duration: 300 }); }}
          style={{ ...t.style, willChange: "transform" }}
        >
          {t.label}
        </button>
      ))}
      <span className="format-toolbar__hint">Selecciona y aplica</span>
    </div>
  );
}

/* ── Componente principal ──────────────────────────────────────────────── */

export default function ReportView({
  report: initialReport, streaming, reportType, form,
  fileName, reset, copyReport, copied, onSaveEdits, onReferralShare,
  reporteId, feedbackInicial,
}) {
  const toast = useToast();
  const [report,   setReport]   = useState(initialReport);
  const [saving,   setSaving]   = useState(false);
  const [savedAt,  setSavedAt]  = useState(null);
  const [hayInconsistencia,       setHayInconsistencia]       = useState(false);
  const [inconsistenciaDismissed, setInconsistenciaDismissed] = useState(false);
  const [feedback,        setFeedback]        = useState(feedbackInicial ?? null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(feedbackInicial !== null && feedbackInicial !== undefined);
  const [mostrarNota,     setMostrarNota]     = useState(false);
  const [notaTexto,       setNotaTexto]       = useState('');
  const [seccionSeleccionada,     setSeccionSeleccionada]     = useState(null);
  const [instruccionRegeneracion, setInstruccionRegeneracion] = useState('');
  const [mostrarModalRegen,       setMostrarModalRegen]       = useState(false);
  const [regenerandoSeccion,      setRegenerandoSeccion]      = useState(false);
  const [showFormatoPreview,      setShowFormatoPreview]      = useState(false);
  const [exportingDocx,           setExportingDocx]           = useState(false);

  const typeLabel = REPORT_TYPES.find(r => r.id === reportType)?.label;

  const rootRef    = useRef(null);
  const headerRef  = useRef(null);
  const actionsRef = useRef(null);
  const warnRef    = useRef(null);
  const editorRef  = useRef(null);
  const bottomRef  = useRef(null);
  const shareRef   = useRef(null);
  const copyBtnRef = useRef(null);

  useEffect(() => { setReport(initialReport); }, [initialReport]);

  useEffect(() => {
    if (streaming) return;
    const blocks = [headerRef, actionsRef, warnRef, editorRef, bottomRef, shareRef]
      .map(r => r.current).filter(Boolean);
    if (!blocks.length) return;
    const tl = createTimeline({ defaults: { ease: "outExpo", duration: 560 } });
    utils.set(blocks, { opacity: 0, translateY: 18 });
    tl.add(blocks, { opacity: [0, 1], translateY: [18, 0], delay: stagger(80) });
  }, [streaming]);

  useEffect(() => {
    if (copied && copyBtnRef.current) pop(copyBtnRef.current, { scale: 1.04, duration: 440 });
  }, [copied]);

  useEffect(() => {
    if (streaming || !report) return;
    if (detectarInconsistencia(report, form)) setHayInconsistencia(true);
  }, [streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Formato inline */
  const applyFormat = (action) => {
    const ta = document.getElementById("report-textarea");
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = report.slice(start, end);
    const before = report.slice(0, start), after = report.slice(end);
    let rep = sel;
    if (action === "bold")    rep = `**${sel}**`;
    if (action === "italic")  rep = `*${sel}*`;
    if (action === "heading") rep = `\n## ${sel}\n`;
    if (action === "divider") rep = `${sel}\n\n---\n\n`;
    setReport(before + rep + after);
    setTimeout(() => { ta.focus(); ta.selectionStart = start; ta.selectionEnd = start + rep.length; }, 0);
  };

  const handleCopy = () => { navigator.clipboard.writeText(report); copyReport(); };

  const handleSaveEdits = async () => {
    if (!onSaveEdits) return;
    setSaving(true);
    await onSaveEdits(report);
    setSaving(false);
    setSavedAt(new Date());
    toast.success('Cambios guardados');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`DocuIA — Reportes institucionales con IA: ${globalThis.location.href}`);
    onReferralShare?.();
    toast.success("Enlace copiado. Envíalo por WhatsApp o correo.");
  };

  /* Feedback */
  const handleFeedback = async (valor) => {
    setFeedback(valor);
    if (valor === 1) {
      try {
        await authFetch(`/api/reportes?id=${reporteId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: 1, feedback_nota: null }),
        });
      } catch { /* silencioso */ }
      setFeedbackEnviado(true);
    } else { setMostrarNota(true); }
  };

  const handleEnviarNota = async () => {
    try {
      await authFetch(`/api/reportes?id=${reporteId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: -1, feedback_nota: notaTexto || null }),
      });
    } catch { /* silencioso */ }
    setFeedbackEnviado(true);
    setMostrarNota(false);
  };

  /* Regeneración parcial */
  const handleRegenerarSeccion = async () => {
    if (!seccionSeleccionada) return;
    const contenidoPrevio = seccionSeleccionada.contenido;
    setMostrarModalRegen(false);
    setRegenerandoSeccion(true);
    const promptRegen = `Contexto del reporte completo:\n${report}\n\nSección a regenerar: ${seccionSeleccionada.titulo}\nContenido actual:\n${contenidoPrevio}\n\nInstrucción adicional: ${instruccionRegeneracion || 'Mejora esta sección manteniendo el mismo estilo y datos.'}\n\nGenera SOLO el contenido de esta sección, conservando EXACTAMENTE el mismo formato (si es una tabla markdown, devuelve una tabla markdown; si es lista, devuelve lista). No incluyas otras secciones ni encabezados de otras secciones.`;
    try {
      const res = await authFetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptRegen, type: reportType }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'No se pudo regenerar la sección.');
        return;
      }
      const data = await res.json();
      if (data.text) {
        const idx = report.indexOf(contenidoPrevio);
        if (idx !== -1) {
          setReport(report.slice(0, idx) + data.text.trim() + report.slice(idx + contenidoPrevio.length));
          toast.success('Sección regenerada. Usa "Guardar cambios" para conservarla.');
        }
      }
    } catch { toast.error('Error al regenerar la sección.'); }
    finally {
      setRegenerandoSeccion(false);
      setInstruccionRegeneracion('');
      setSeccionSeleccionada(null);
    }
  };

  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      await exportToDocx(report, fileName);
    } catch {
      toast.error('No se pudo exportar el documento Word.');
    } finally {
      setExportingDocx(false);
    }
  };

  const dlHover = (e) => animate(e.currentTarget, { translateY: -2, duration: 240, ease: "outQuart" });
  const dlLeave = (e) => animate(e.currentTarget, { translateY: 0,  duration: 300, ease: "outQuart" });
  const primaryHover = magneticHover();

  /* Colores de badge según tipo */
  const tipoBg     = { semanal: "rgba(47,134,201,0.12)", calificaciones: "rgba(224,169,75,0.12)", asistencia: "rgba(47,134,201,0.12)", dece: "rgba(201,44,60,0.12)", planificacion: "rgba(47,134,201,0.10)" };
  const tipoBorder = { semanal: "rgba(47,134,201,0.28)", calificaciones: "rgba(224,169,75,0.28)", asistencia: "rgba(47,134,201,0.28)", dece: "rgba(201,44,60,0.28)", planificacion: "rgba(47,134,201,0.22)" };

  return (
    <div ref={rootRef} className="report-view">

      {/* Modal de regeneración */}
      {mostrarModalRegen && seccionSeleccionada && (
        <div className="regen-overlay" onClick={() => setMostrarModalRegen(false)}>
          <div className="regen-card" onClick={e => e.stopPropagation()}>
            <div className="regen-card__bar" />
            <h3 className="regen-card__title">Regenerar: {seccionSeleccionada.titulo}</h3>
            <label className="regen-card__label">Instrucción adicional (opcional)</label>
            <textarea
              className="regen-card__textarea"
              value={instruccionRegeneracion}
              onChange={e => setInstruccionRegeneracion(e.target.value)}
              placeholder="Ej: Agrega más detalle sobre los estudiantes en riesgo…"
              rows={3}
            />
            <div className="regen-card__actions">
              <button className="btn btn-primary" onClick={handleRegenerarSeccion} style={{ fontSize: 13, padding: "10px 20px" }}>Regenerar</button>
              <button className="btn btn-ghost" onClick={() => { setMostrarModalRegen(false); setInstruccionRegeneracion(''); }} style={{ fontSize: 13, padding: "10px 20px" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <FormatoPreviewModal
        open={showFormatoPreview}
        onClose={() => setShowFormatoPreview(false)}
        initialType={reportType}
      />

      {/* Header */}
      <div ref={headerRef} className="report-header" style={{ willChange: "transform, opacity" }}>
        <div>
          <div
            className="report-type-badge"
            style={{ background: tipoBg[reportType] || "rgba(0,212,168,0.08)", border: `1px solid ${tipoBorder[reportType] || "rgba(0,212,168,0.2)"}` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--jade-500)", flexShrink: 0 }} />
            {typeLabel || reportType}
          </div>
          <h2 className="report-title">
            {streaming
              ? <span>Generando reporte<span className="streaming-cursor" aria-hidden="true" /></span>
              : 'Reporte generado'}
          </h2>
          <p className="report-meta">{form.curso} · {form.periodo}</p>
        </div>
        <div className="report-header__actions">
          {!streaming && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowFormatoPreview(true)}
              style={{ fontSize: 13, padding: "9px 18px" }}
            >
              👁 Ver formato Fe y Alegría
            </button>
          )}
          <button className="btn btn-ghost" onClick={reset} disabled={streaming} style={{ fontSize: 13, padding: "9px 18px" }}>
            Nuevo reporte
          </button>
        </div>
      </div>

      {/* Descargas */}
      <div
        ref={actionsRef}
        className={`report-dl-bar${streaming ? " report-dl-bar--streaming" : ""}`}
        style={{ willChange: "transform, opacity" }}
      >
        <p className="report-dl-bar__label">Descargar reporte</p>
        <div className="dl-grid">
          {[
            { label: exportingDocx ? "Exportando…" : "Word (.docx)", action: handleExportDocx, tip: "Descarga el documento Word con encabezado institucional Fe y Alegría", disabled: exportingDocx },
            { label: "PDF",          action: () => downloadPDF(report, fileName),    tip: "Descarga el documento en formato PDF listo para imprimir" },
            { label: "Excel (.csv)", action: () => downloadExcel(report, fileName),  tip: null },
            { label: "Imprimir",     action: () => printReport(report),              tip: null },
          ].map(({ label, action, tip, disabled }) => (
            <TooltipHelper key={label} text={tip} position="top">
              <button
                className="dl-btn"
                disabled={disabled}
                onClick={(e) => { action(); pop(e.currentTarget, { scale: 1.06, duration: 360 }); }}
                onMouseEnter={dlHover}
                onMouseLeave={dlLeave}
              >
                {label}
              </button>
            </TooltipHelper>
          ))}
        </div>
      </div>

      {/* Banner inconsistencia */}
      {hayInconsistencia && !inconsistenciaDismissed && (
        <div className="report-inconsistency-banner">
          <span className="report-inconsistency-banner__icon">⚠️</span>
          <span className="report-inconsistency-banner__text">
            <strong>Posible inconsistencia:</strong> el reporte puede contener un grado diferente al del formulario. Revisa antes de enviar.
          </span>
          <button className="report-inconsistency-banner__close" onClick={() => setInconsistenciaDismissed(true)} aria-label="Descartar">×</button>
        </div>
      )}

      {/* Aviso */}
      <div ref={warnRef} className="report-note" style={{ willChange: "transform, opacity" }}>
        <strong style={{ color: "var(--jade-500)" }}>Nota:</strong> Revisa el reporte antes de enviarlo. Puedes editar el texto directamente abajo.
      </div>

      {/* Editor */}
      <div ref={editorRef} className="report-editor" style={{ willChange: "transform, opacity" }}>
        <FormatToolbar onFormat={applyFormat} />

        {/* Toolbar regeneración */}
        {!streaming && (() => {
          const secciones = parsearSecciones(report);
          return secciones.length > 1 ? (
            <div className="regen-toolbar">
              <span className="regen-toolbar__label">Regenerar sección</span>
              <select
                className="regen-toolbar__select"
                value={seccionSeleccionada?.id ?? ''}
                onChange={e => { const idx = Number(e.target.value); setSeccionSeleccionada(secciones.find(s => s.id === idx) || null); }}
                aria-label="Sección a regenerar"
              >
                <option value="">— Selecciona sección —</option>
                {secciones.map(s => <option key={s.id} value={s.id}>{s.titulo}</option>)}
              </select>
              <button
                className="btn btn-ghost"
                onClick={() => { if (seccionSeleccionada) setMostrarModalRegen(true); }}
                disabled={!seccionSeleccionada || regenerandoSeccion}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                {regenerandoSeccion ? 'Regenerando…' : '↺ Regenerar'}
              </button>
            </div>
          ) : null;
        })()}

        <textarea
          id="report-textarea"
          className={`report-textarea${streaming ? " report-textarea--streaming" : ""}`}
          value={report}
          onChange={e => setReport(e.target.value)}
          disabled={streaming}
          aria-label="Texto del reporte generado"
          aria-busy={streaming}
        />
      </div>

      {/* Copiar / Guardar */}
      <div ref={bottomRef} className="report-bottom" style={{ willChange: "transform, opacity" }}>
        <button
          ref={copyBtnRef}
          className="btn btn-primary"
          onClick={handleCopy}
          disabled={streaming}
          aria-label="Copiar reporte al portapapeles"
          style={{
            flex: 1, minWidth: 180, padding: "13px 0",
            background: copied ? "var(--ok)" : "var(--grad-jade)",
            fontSize: 14, fontWeight: 600,
            borderRadius: "var(--radius-lg)", willChange: "transform",
          }}
          {...primaryHover}
        >
          {copied ? "¡Copiado!" : "Copiar texto completo"}
        </button>
        {onSaveEdits && (
          <button
            className="btn btn-ghost"
            onClick={handleSaveEdits}
            disabled={saving || streaming}
            style={{ minWidth: 160, padding: "13px 18px", fontSize: 13, borderRadius: "var(--radius-lg)", willChange: "transform" }}
          >
            {saving ? "Guardando…" : savedAt ? "Cambios guardados ✓" : "Guardar cambios"}
          </button>
        )}
      </div>

      {/* Feedback 👍👎 */}
      {reporteId && !streaming && (
        <div className="report-feedback">
          {feedbackEnviado ? (
            <p className="report-feedback__sent">
              Valoración: {feedback === 1 ? '👍 Útil' : '👎 Mejorable'} — ¡Gracias por tu opinión!
            </p>
          ) : mostrarNota ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                ¿Qué mejorarías? <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(opcional)</span>
              </p>
              <textarea
                className="report-feedback__textarea"
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                placeholder="Describe qué salió mal o cómo mejorar…"
                rows={3}
              />
              <div className="report-feedback__note-actions">
                <button className="btn btn-primary" onClick={handleEnviarNota} style={{ fontSize: 13, padding: "9px 18px" }}>Enviar</button>
                <button className="btn btn-ghost" onClick={() => { setMostrarNota(false); handleEnviarNota(); }} style={{ fontSize: 13, padding: "9px 18px" }}>Omitir</button>
              </div>
            </div>
          ) : (
            <div className="report-feedback__row">
              <span className="report-feedback__label">¿Este reporte fue útil?</span>
              <button className="report-feedback__emoji" onClick={() => handleFeedback(1)} aria-label="Útil">👍</button>
              <button className="report-feedback__emoji" onClick={() => handleFeedback(-1)} aria-label="Mejorable">👎</button>
            </div>
          )}
        </div>
      )}

      {/* Compartir */}
      <div ref={shareRef} className="report-share" style={{ willChange: "transform, opacity" }}>
        <p className="report-share__text">¿Le fue útil? Comparte DocuIA con un colega.</p>
        <button className="btn btn-ghost" onClick={handleShare} style={{ fontSize: 13 }} {...magneticHover()}>
          Compartir enlace
        </button>
      </div>
    </div>
  );
}
