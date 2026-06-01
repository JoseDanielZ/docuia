import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { REPORT_TYPES } from "../config.js";
import { downloadWord, downloadPDF, downloadExcel, printReport } from "../utils/download.js";
import { pop, magneticHover } from "../utils/anim.js";
import { useToast } from "./Toast.jsx";
import { authFetch } from "../utils/auth.js";

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

function FormatToolbar({ onFormat }) {
  const tools = [
    { label: "N", title: "Negrita",          style: { fontWeight: 700 }, action: "bold"    },
    { label: "I", title: "Cursiva",           style: { fontStyle: "italic" }, action: "italic" },
    { label: "T", title: "Título de sección", style: { fontSize: 13 },    action: "heading" },
    { label: "—", title: "Línea separadora",  style: {},                  action: "divider" },
  ];

  return (
    <div style={{
      display: "flex", gap: 4, alignItems: "center",
      padding: "8px 12px",
      background: "var(--paper-2)",
      borderBottom: "1px solid var(--line)",
      borderRadius: "10px 10px 0 0",
    }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, color: "var(--muted)",
        letterSpacing: ".06em", textTransform: "uppercase",
        marginRight: 8,
      }}>Formato</span>

      {tools.map(t => (
        <button
          key={t.action}
          title={t.title}
          aria-label={t.title}
          onClick={(e) => { onFormat(t.action); pop(e.currentTarget, { scale: 1.12, duration: 320 }); }}
          style={{
            all: "unset", cursor: "pointer",
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--line)", borderRadius: 6,
            background: "var(--paper)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12, color: "var(--ink)",
            transition: "background .15s, border-color .15s",
            willChange: "transform",
            ...t.style,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--paper-3)"; e.currentTarget.style.borderColor = "var(--ink)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--paper)";   e.currentTarget.style.borderColor = "var(--line)"; }}
        >
          {t.label}
        </button>
      ))}

      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10, color: "var(--muted)", marginLeft: 8,
      }}>
        Selecciona texto y aplica formato
      </span>
    </div>
  );
}

export default function ReportView({
  report: initialReport, streaming, reportType, form,
  fileName, reset, copyReport, copied, onSaveEdits, onReferralShare,
  reporteId, feedbackInicial,
}) {
  const toast   = useToast();
  const [report,   setReport]   = useState(initialReport);
  const [saving,   setSaving]   = useState(false);
  const [savedAt,  setSavedAt]  = useState(null);
  const [hayInconsistencia,       setHayInconsistencia]       = useState(false);
  const [inconsistenciaDismissed, setInconsistenciaDismissed]  = useState(false);
  const [feedback,       setFeedback]       = useState(feedbackInicial ?? null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(feedbackInicial !== null && feedbackInicial !== undefined);
  const [mostrarNota,    setMostrarNota]    = useState(false);
  const [notaTexto,      setNotaTexto]      = useState('');
  const [seccionSeleccionada,     setSeccionSeleccionada]     = useState(null);
  const [instruccionRegeneracion, setInstruccionRegeneracion] = useState('');
  const [mostrarModalRegen,       setMostrarModalRegen]       = useState(false);
  const [regenerandoSeccion,      setRegenerandoSeccion]      = useState(false);
  const typeLabel = REPORT_TYPES.find(r => r.id === reportType)?.label;

  const rootRef    = useRef(null);
  const headerRef  = useRef(null);
  const dlBarRef   = useRef(null);
  const warnRef    = useRef(null);
  const editorRef  = useRef(null);
  const actionsRef = useRef(null);
  const shareRef   = useRef(null);
  const copyBtnRef = useRef(null);

  // Sync report text while streaming
  useEffect(() => { setReport(initialReport); }, [initialReport]);

  // Entrada secuenciada (solo cuando no está en streaming)
  useEffect(() => {
    if (streaming) return;
    const blocks = [headerRef, dlBarRef, warnRef, editorRef, actionsRef, shareRef]
      .map(r => r.current).filter(Boolean);
    if (!blocks.length) return;

    const tl = createTimeline({ defaults: { ease: "outExpo", duration: 600 } });
    utils.set(blocks, { opacity: 0, translateY: 20 });
    tl.add(blocks, { opacity: [0, 1], translateY: [20, 0], delay: stagger(90) });

    if (dlBarRef.current) {
      const btns = dlBarRef.current.querySelectorAll(".dl-btn");
      utils.set(btns, { opacity: 0, scale: 0.9 });
      animate(btns, {
        opacity: [0, 1], scale: [0.9, 1],
        duration: 500, delay: stagger(70, { start: 250 }), ease: "outBack(1.6)",
      });
    }
  }, [streaming]);

  useEffect(() => {
    if (streaming || !report) return;
    if (detectarInconsistencia(report, form)) setHayInconsistencia(true);
  }, [streaming]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (copied && copyBtnRef.current) pop(copyBtnRef.current, { scale: 1.04, duration: 460 });
  }, [copied]);

  const handleShare = () => {
    navigator.clipboard.writeText(`DocuIA — Reportes institucionales con IA: ${globalThis.location.href}`);
    onReferralShare?.();
    toast.success("Enlace copiado. Envíalo por WhatsApp o correo.");
  };

  const applyFormat = (action) => {
    const textarea = document.getElementById("report-textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end   = textarea.selectionEnd;
    const sel   = report.slice(start, end);
    const before = report.slice(0, start);
    const after  = report.slice(end);

    let replacement = sel;
    if (action === "bold")    replacement = `**${sel}**`;
    if (action === "italic")  replacement = `*${sel}*`;
    if (action === "heading") replacement = `\n## ${sel}\n`;
    if (action === "divider") replacement = `${sel}\n\n---\n\n`;

    setReport(before + replacement + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd   = start + replacement.length;
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    copyReport();
  };

  const handleSaveEdits = async () => {
    if (!onSaveEdits) return;
    setSaving(true);
    await onSaveEdits(report);
    setSaving(false);
    setSavedAt(new Date());
    toast.success('Cambios guardados correctamente');
  };

  const handleFeedback = async (valor) => {
    setFeedback(valor);
    if (valor === 1) {
      try {
        await authFetch(`/api/reportes?id=${reporteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: 1, feedback_nota: null }),
        });
      } catch { /* silencioso */ }
      setFeedbackEnviado(true);
    } else {
      setMostrarNota(true);
    }
  };

  const handleEnviarNota = async () => {
    try {
      await authFetch(`/api/reportes?id=${reporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: -1, feedback_nota: notaTexto || null }),
      });
    } catch { /* silencioso */ }
    setFeedbackEnviado(true);
    setMostrarNota(false);
  };

  const handleRegenerarSeccion = async () => {
    if (!seccionSeleccionada) return;
    const contenidoPrevio = seccionSeleccionada.contenido;
    setMostrarModalRegen(false);
    setRegenerandoSeccion(true);

    const promptRegen = `Contexto del reporte completo:\n${report}\n\nSección a regenerar: ${seccionSeleccionada.titulo}\nContenido actual:\n${contenidoPrevio}\n\nInstrucción adicional: ${instruccionRegeneracion || 'Mejora esta sección manteniendo el mismo estilo y datos.'}\n\nGenera SOLO el contenido de esta sección. No incluyas otras secciones.`;

    try {
      const res = await authFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptRegen }),
      });
      if (!res.ok) { toast.error('No se pudo regenerar la sección.'); return; }
      const data = await res.json();
      if (data.text) {
        const idx = report.indexOf(contenidoPrevio);
        if (idx !== -1) {
          const nuevoTexto = report.slice(0, idx) + data.text.trim() + report.slice(idx + contenidoPrevio.length);
          setReport(nuevoTexto);
          toast.success('Sección regenerada. Usa "Guardar cambios" para conservarla.');
        }
      }
    } catch {
      toast.error('Error al regenerar la sección.');
    } finally {
      setRegenerandoSeccion(false);
      setInstruccionRegeneracion('');
      setSeccionSeleccionada(null);
    }
  };

  const dlHover = (e) => animate(e.currentTarget, { translateY: -2, duration: 260, ease: "outQuart" });
  const dlLeave = (e) => animate(e.currentTarget, { translateY: 0,  duration: 320, ease: "outQuart" });

  return (
    <div ref={rootRef} style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>

      {/* Header */}
      <div ref={headerRef} style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 28, paddingBottom: 20,
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap", gap: 12,
        willChange: "transform, opacity",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 400, fontSize: 26,
            color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-.02em",
          }}>
            {streaming ? (
              <span>Generando reporte<span className="streaming-cursor" aria-hidden="true" /></span>
            ) : 'Reporte generado'}
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12, color: "var(--muted)", margin: 0,
          }}>
            {typeLabel} — {form.curso} — {form.periodo}
          </p>
        </div>
        <button
          onClick={reset}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: "9px 18px" }}
          disabled={streaming}
        >
          Nuevo reporte
        </button>
      </div>

      {/* Descargas */}
      <div ref={dlBarRef} style={{
        background: "var(--ink)", borderRadius: 12,
        padding: "20px 24px", marginBottom: 20,
        willChange: "transform, opacity",
        opacity: streaming ? 0.4 : 1,
        pointerEvents: streaming ? "none" : "auto",
        transition: "opacity .3s",
      }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: "rgba(245,241,232,.4)",
          letterSpacing: ".1em", textTransform: "uppercase", margin: "0 0 12px",
        }}>Descargar reporte</p>
        <div className="dl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "Word (.doc)", action: () => downloadWord(report, fileName),  bg: "rgba(255,255,255,.08)" },
            { label: "PDF",         action: () => downloadPDF(report, fileName),   bg: "rgba(255,255,255,.08)" },
            { label: "Excel (.csv)",action: () => downloadExcel(report, fileName), bg: "rgba(255,255,255,.08)" },
            { label: "Imprimir",    action: () => printReport(report),             bg: "var(--paper)", color: "var(--ink)" },
          ].map(({ label, action, bg, color }) => (
            <button
              key={label}
              className="dl-btn"
              onClick={(e) => { action(); pop(e.currentTarget, { scale: 1.06, duration: 380 }); }}
              onMouseEnter={dlHover}
              onMouseLeave={dlLeave}
              style={{
                padding: "11px 8px", background: bg,
                color: color || "var(--paper)",
                fontSize: 12, fontWeight: 500,
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8, willChange: "transform",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner de inconsistencia de datos */}
      {hayInconsistencia && !inconsistenciaDismissed && (
        <div style={{
          padding: "14px 18px", marginBottom: 12,
          background: "var(--warn-bg)", border: "1px solid var(--warn-border)",
          borderRadius: 10, fontSize: 13, color: "var(--warn-text)",
          lineHeight: 1.55, display: "flex", justifyContent: "space-between",
          alignItems: "center", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <span>
            <strong>Posible inconsistencia detectada:</strong> el reporte puede contener un grado diferente al del formulario. Revisa los datos antes de usar este documento.
          </span>
          <button
            onClick={() => setInconsistenciaDismissed(true)}
            style={{
              all: "unset", cursor: "pointer", marginLeft: 16,
              color: "var(--warn-text)", fontWeight: 600, fontSize: 13,
              flexShrink: 0,
            }}
            aria-label="Descartar aviso"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Aviso */}
      <div ref={warnRef} style={{
        padding: "14px 18px",
        background: "var(--warn-bg)", border: "1px solid var(--warn-border)",
        borderRadius: 10, fontSize: 13, color: "var(--warn-text)",
        marginBottom: 20, lineHeight: 1.55,
        fontFamily: "'IBM Plex Sans', sans-serif",
        willChange: "transform, opacity",
      }}>
        <strong>Nota importante:</strong> Revise el informe antes de enviarlo. Puede editar el texto directamente abajo. No confíe en la IA al 100%.
      </div>

      {/* Modal de regeneración de sección */}
      {mostrarModalRegen && seccionSeleccionada && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,.45)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: 24,
        }} onClick={() => setMostrarModalRegen(false)}>
          <div style={{
            background: "var(--paper)", borderRadius: 14, padding: "28px 32px",
            maxWidth: 480, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,.18)",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              margin: "0 0 16px", fontSize: 16, fontWeight: 600,
              color: "var(--ink)", fontFamily: "'IBM Plex Sans', sans-serif",
            }}>Regenerar: {seccionSeleccionada.titulo}</h3>
            <label style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Instrucción adicional (opcional)
            </label>
            <textarea
              value={instruccionRegeneracion}
              onChange={e => setInstruccionRegeneracion(e.target.value)}
              placeholder="Ej: Agrega más detalle sobre los estudiantes en riesgo..."
              rows={3}
              style={{
                display: "block", width: "100%", marginTop: 8,
                padding: "10px 12px", border: "1px solid var(--line)",
                borderRadius: 8, background: "var(--paper-2)", color: "var(--ink)",
                fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                className="btn"
                onClick={handleRegenerarSeccion}
                style={{ fontSize: 13, padding: "10px 20px", background: "var(--ink)", color: "var(--paper)", borderRadius: 8 }}
              >
                Regenerar
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => { setMostrarModalRegen(false); setInstruccionRegeneracion(''); }}
                style={{ fontSize: 13, padding: "10px 20px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div ref={editorRef} style={{
        border: "1px solid var(--line)", borderRadius: 12,
        overflow: "hidden", willChange: "transform, opacity",
      }}>
        <FormatToolbar onFormat={applyFormat} />
        {!streaming && (() => {
          const secciones = parsearSecciones(report);
          return secciones.length > 1 ? (
            <div style={{
              display: "flex", gap: 8, alignItems: "center", padding: "8px 12px",
              background: "var(--paper-2)", borderBottom: "1px solid var(--line)",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Regenerar sección
              </span>
              <select
                value={seccionSeleccionada?.id ?? ''}
                onChange={e => {
                  const idx = Number(e.target.value);
                  setSeccionSeleccionada(secciones.find(s => s.id === idx) || null);
                }}
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12,
                  padding: "5px 8px", border: "1px solid var(--line)",
                  borderRadius: 6, background: "var(--paper)", color: "var(--ink)",
                  outline: "none", flex: 1, minWidth: 140,
                }}
                aria-label="Seleccionar sección a regenerar"
              >
                <option value="">— Selecciona sección —</option>
                {secciones.map(s => (
                  <option key={s.id} value={s.id}>{s.titulo}</option>
                ))}
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
          value={report}
          onChange={e => setReport(e.target.value)}
          disabled={streaming}
          aria-label="Texto del reporte generado"
          aria-busy={streaming}
          style={{
            display: "block", width: "100%",
            minHeight: 480, padding: "24px 28px",
            background: "var(--paper)", border: "none", outline: "none",
            resize: "vertical",
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14, color: "var(--text)", lineHeight: 1.8,
            boxSizing: "border-box",
            opacity: streaming ? 0.7 : 1,
          }}
        />
      </div>

      {/* Acciones */}
      <div ref={actionsRef} style={{
        display: "flex", gap: 10, marginTop: 14,
        flexWrap: "wrap", willChange: "transform, opacity",
      }}>
        <button
          ref={copyBtnRef}
          className="btn"
          onClick={handleCopy}
          disabled={streaming}
          aria-label="Copiar reporte al portapapeles"
          style={{
            flex: 1, minWidth: 200, padding: "13px 0",
            background: copied ? "var(--ok)" : "var(--ink)",
            color: "var(--paper)", fontSize: 14, fontWeight: 500,
            borderRadius: 10, fontFamily: "'IBM Plex Sans', sans-serif",
            transition: "background .25s ease", willChange: "transform",
          }}
        >
          {copied ? "Copiado al portapapeles" : "Copiar texto completo"}
        </button>

        {onSaveEdits && (
          <button
            data-save-btn
            className="btn btn-ghost"
            onClick={handleSaveEdits}
            disabled={saving || streaming}
            style={{
              minWidth: 180, padding: "13px 18px",
              background: "var(--paper)", color: "var(--ink)",
              fontSize: 13, fontWeight: 500, borderRadius: 10,
              border: "1px solid var(--line)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              willChange: "transform",
            }}
          >
            {saving ? "Guardando..." : savedAt ? "Cambios guardados" : "Guardar cambios"}
          </button>
        )}
      </div>

      {/* Feedback 👍👎 */}
      {reporteId && !streaming && (
        <div style={{
          marginTop: 16, padding: "18px 22px",
          background: "var(--paper-2)", border: "1px solid var(--line)",
          borderRadius: 12, fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {feedbackEnviado ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
              Valoración: {feedback === 1 ? '👍 Útil' : '👎 Mejorable'} — ¡Gracias por tu opinión!
            </p>
          ) : mostrarNota ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                ¿Qué mejorarías? <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span>
              </p>
              <textarea
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                placeholder="Describe qué salió mal o qué podrías mejorar..."
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1px solid var(--line)", borderRadius: 8,
                  background: "var(--paper)", color: "var(--ink)",
                  fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={handleEnviarNota}
                  style={{ fontSize: 13, padding: "9px 18px", background: "var(--ink)", color: "var(--paper)", borderRadius: 8 }}>
                  Enviar
                </button>
                <button className="btn btn-ghost" onClick={() => { setMostrarNota(false); handleEnviarNota(); }}
                  style={{ fontSize: 13, padding: "9px 18px" }}>
                  Omitir
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>¿Este reporte fue útil?</span>
              <button
                onClick={() => handleFeedback(1)}
                style={{ all: "unset", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
                aria-label="Reporte útil"
                title="Útil"
              >👍</button>
              <button
                onClick={() => handleFeedback(-1)}
                style={{ all: "unset", cursor: "pointer", fontSize: 22, lineHeight: 1 }}
                aria-label="Reporte mejorable"
                title="Mejorable"
              >👎</button>
            </div>
          )}
        </div>
      )}

      {/* Compartir */}
      <div ref={shareRef} style={{
        marginTop: 24, padding: "20px 24px",
        background: "var(--paper-2)", border: "1px solid var(--line)",
        borderRadius: 12, textAlign: "center",
        willChange: "transform, opacity",
      }}>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14, fontWeight: 500, color: "var(--ink)", margin: "0 0 10px",
        }}>
          ¿Le fue útil? Comparta DocuIA con un colega.
        </p>
        <button
          className="btn btn-ghost"
          onClick={handleShare}
          style={{ fontSize: 13 }}
          {...magneticHover()}
        >
          Compartir enlace
        </button>
      </div>
    </div>
  );
}
