import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { REPORT_TYPES } from "../config.js";
import { downloadWord, downloadPDF, downloadExcel, printReport } from "../utils/download.js";
import { saveToSupabase } from "../utils/supabase.js";
import { pop, magneticHover } from "../utils/anim.js";

// ── Formato toolbar (prototipo B) ─────────────────────────────────────────────
function FormatToolbar({ onFormat }) {
  const tools = [
    { label: "N",    title: "Negrita",          style: { fontWeight: 700 }, action: "bold"      },
    { label: "I",    title: "Cursiva",           style: { fontStyle: "italic" }, action: "italic" },
    { label: "T",    title: "Título de sección", style: { fontSize: 13 },    action: "heading"   },
    { label: "—",    title: "Línea separadora",  style: {},                  action: "divider"   },
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
          onClick={(e) => { onFormat(t.action); pop(e.currentTarget, { scale: 1.12, duration: 320 }); }}
          style={{
            all: "unset",
            cursor: "pointer",
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--line)",
            borderRadius: 6,
            background: "var(--paper)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12,
            color: "var(--ink)",
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
        fontSize: 10, color: "var(--muted)",
        marginLeft: 8,
      }}>
        Selecciona texto y aplica formato
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportView({ report: initialReport, reportType, form, fileName, reset, copyReport, copied, onSaveEdits }) {
  const [report, setReport] = useState(initialReport);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const typeLabel = REPORT_TYPES.find(r => r.id === reportType)?.label;

  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const dlBarRef = useRef(null);
  const warnRef = useRef(null);
  const editorRef = useRef(null);
  const actionsRef = useRef(null);
  const shareRef = useRef(null);
  const copyBtnRef = useRef(null);

  // Entrada secuenciada al montar
  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo", duration: 600 } });
    const blocks = [headerRef, dlBarRef, warnRef, editorRef, actionsRef, shareRef]
      .map(r => r.current).filter(Boolean);
    if (!blocks.length) return;

    utils.set(blocks, { opacity: 0, translateY: 20 });
    tl.add(blocks, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(90),
    });

    // Pop de los download buttons
    if (dlBarRef.current) {
      const btns = dlBarRef.current.querySelectorAll(".dl-btn");
      utils.set(btns, { opacity: 0, scale: 0.9 });
      animate(btns, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        delay: stagger(70, { start: 250 }),
        ease: "outBack(1.6)",
      });
    }
  }, []);

  // Pulse al copiar
  useEffect(() => {
    if (copied && copyBtnRef.current) {
      pop(copyBtnRef.current, { scale: 1.04, duration: 460 });
    }
  }, [copied]);

  const handleShare = () => {
    navigator.clipboard.writeText(`DocuIA — Reportes institucionales con IA: ${window.location.href}`);
    saveToSupabase("referrals", { email_from: form.email });
    alert("Enlace copiado. Envíelo por WhatsApp o correo.");
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
    if (action === "heading")  replacement = `\n## ${sel}\n`;
    if (action === "divider") replacement = `${sel}\n\n---\n\n`;

    const newText = before + replacement + after;
    setReport(newText);

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
    if (copyBtnRef.current?.parentElement) {
      const saveBtn = copyBtnRef.current.parentElement.querySelector("[data-save-btn]");
      if (saveBtn) pop(saveBtn);
    }
  };

  const dlHover = (e) => animate(e.currentTarget, { translateY: -2, duration: 260, ease: "outQuart" });
  const dlLeave = (e) => animate(e.currentTarget, { translateY: 0,  duration: 320, ease: "outQuart" });

  return (
    <div ref={rootRef} style={{
      maxWidth: 860, margin: "0 auto",
      padding: "48px 32px 80px",
    }}>

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
            color: "var(--ink)", margin: "0 0 4px",
            letterSpacing: "-.02em",
          }}>
            Reporte generado
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12, color: "var(--muted)", margin: 0,
          }}>
            {typeLabel} — {form.curso} — {form.periodo}
          </p>
        </div>
        <button onClick={reset} className="btn btn-ghost" style={{ fontSize: 13, padding: "9px 18px" }}>
          Nuevo reporte
        </button>
      </div>

      <div ref={dlBarRef} style={{
        background: "var(--ink)", borderRadius: 12,
        padding: "20px 24px", marginBottom: 20,
        willChange: "transform, opacity",
      }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: "rgba(245,241,232,.4)",
          letterSpacing: ".1em", textTransform: "uppercase",
          margin: "0 0 12px",
        }}>Descargar reporte</p>
        <div className="dl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "Word (.doc)", action: () => downloadWord(report, fileName), bg: "rgba(255,255,255,.08)" },
            { label: "PDF",         action: () => downloadPDF(report, fileName),  bg: "rgba(255,255,255,.08)" },
            { label: "Excel (.csv)",action: () => downloadExcel(report, fileName),bg: "rgba(255,255,255,.08)" },
            { label: "Imprimir",    action: () => printReport(report),            bg: "var(--paper)", color: "var(--ink)" },
          ].map(({ label, action, bg, color }) => (
            <button
              key={label}
              className="dl-btn"
              onClick={(e) => { action(); pop(e.currentTarget, { scale: 1.06, duration: 380 }); }}
              onMouseEnter={dlHover}
              onMouseLeave={dlLeave}
              style={{
                padding: "11px 8px",
                background: bg,
                color: color || "var(--paper)",
                fontSize: 12, fontWeight: 500,
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                willChange: "transform",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={warnRef} style={{
        padding: "14px 18px",
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        borderRadius: 10,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13, color: "#78350f",
        marginBottom: 20, lineHeight: 1.55,
        willChange: "transform, opacity",
      }}>
        <strong>Nota importante:</strong> Revise el informe antes de enviarlo. Puede editar el texto directamente abajo. No confíe en la IA al 100%.
      </div>

      <div ref={editorRef} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", willChange: "transform, opacity" }}>
        <FormatToolbar onFormat={applyFormat} />
        <textarea
          id="report-textarea"
          value={report}
          onChange={e => setReport(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            minHeight: 480,
            padding: "24px 28px",
            background: "var(--paper)",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14, color: "var(--text)",
            lineHeight: 1.8,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div ref={actionsRef} style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", willChange: "transform, opacity" }}>
        <button
          ref={copyBtnRef}
          className="btn"
          onClick={handleCopy}
          style={{
            flex: 1, minWidth: 200, padding: "13px 0",
            background: copied ? "var(--ok)" : "var(--ink)",
            color: "var(--paper)",
            fontSize: 14, fontWeight: 500, borderRadius: 10,
            fontFamily: "'IBM Plex Sans', sans-serif",
            transition: "background .25s ease",
            willChange: "transform",
          }}
        >
          {copied ? "Copiado al portapapeles" : "Copiar texto completo"}
        </button>

        {onSaveEdits && (
          <button
            data-save-btn
            className="btn btn-ghost"
            onClick={handleSaveEdits}
            disabled={saving}
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

      <div ref={shareRef} style={{
        marginTop: 24, padding: "20px 24px",
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        borderRadius: 12, textAlign: "center",
        willChange: "transform, opacity",
      }}>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14, fontWeight: 500,
          color: "var(--ink)", margin: "0 0 10px",
        }}>
          ¿Le fue útil? Comparta DocuIA con un colega.
        </p>
        <button className="btn btn-ghost" onClick={handleShare} style={{ fontSize: 13 }}>
          Compartir enlace
        </button>
      </div>
    </div>
  );
}
