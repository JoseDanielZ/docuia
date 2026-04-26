import { useState } from "react";
import { REPORT_TYPES } from "../config.js";
import { downloadWord, downloadPDF, downloadExcel, printReport } from "../utils/download.js";
import { saveToSupabase } from "../utils/supabase.js";

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
          onClick={() => onFormat(t.action)}
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
            ...t.style,
          }}
          onMouseEnter={e => { e.target.style.background = "var(--paper-3)"; e.target.style.borderColor = "var(--ink)"; }}
          onMouseLeave={e => { e.target.style.background = "var(--paper)";   e.target.style.borderColor = "var(--line)"; }}
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

  const handleShare = () => {
    navigator.clipboard.writeText(`DocuIA — Reportes institucionales con IA: ${window.location.href}`);
    saveToSupabase("referrals", { email_from: form.email });
    alert("Enlace copiado. Envíelo por WhatsApp o correo.");
  };

  // Aplica formato al texto seleccionado dentro del textarea
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

    // Restaurar el foco y la posición del cursor
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
  };

  return (
    <div style={{
      maxWidth: 860, margin: "0 auto",
      padding: "48px 32px 80px",
      animation: "fadeIn .4s ease",
    }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 28, paddingBottom: 20,
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap", gap: 12,
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

      {/* Download bar */}
      <div style={{
        background: "var(--ink)", borderRadius: 12,
        padding: "20px 24px", marginBottom: 20,
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
            <button key={label} className="dl-btn" onClick={action} style={{
              padding: "11px 8px",
              background: bg,
              color: color || "var(--paper)",
              fontSize: 12, fontWeight: 500,
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div style={{
        padding: "14px 18px",
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        borderRadius: 10,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13, color: "#78350f",
        marginBottom: 20, lineHeight: 1.55,
      }}>
        <strong>Nota importante:</strong> Revise el informe antes de enviarlo. Puede editar el texto directamente abajo. No confíe en la IA al 100%.
      </div>

      {/* Editable report — Opción A + toolbar Opción B */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
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

      {/* Copy + (opcional) guardar cambios cuando viene del historial */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className="btn" onClick={handleCopy} style={{
          flex: 1, minWidth: 200, padding: "13px 0",
          background: copied ? "var(--ok)" : "var(--ink)",
          color: "var(--paper)",
          fontSize: 14, fontWeight: 500, borderRadius: 10,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {copied ? "Copiado al portapapeles" : "Copiar texto completo"}
        </button>

        {onSaveEdits && (
          <button
            className="btn btn-ghost"
            onClick={handleSaveEdits}
            disabled={saving}
            style={{
              minWidth: 180, padding: "13px 18px",
              background: "var(--paper)", color: "var(--ink)",
              fontSize: 13, fontWeight: 500, borderRadius: 10,
              border: "1px solid var(--line)",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {saving ? "Guardando..." : savedAt ? "Cambios guardados" : "Guardar cambios"}
          </button>
        )}
      </div>

      {/* Share */}
      <div style={{
        marginTop: 24, padding: "20px 24px",
        background: "var(--paper-2)",
        border: "1px solid var(--line)",
        borderRadius: 12, textAlign: "center",
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
