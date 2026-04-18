import { REPORT_TYPES } from "../config.js";
import { downloadWord, downloadPDF, downloadExcel, printReport } from "../utils/download.js";
import { saveToSupabase } from "../utils/supabase.js";

export default function ReportView({ report, reportType, form, fileName, reset, copyReport, copied }) {
  const typeLabel = REPORT_TYPES.find(r => r.id === reportType)?.label;

  const handleShare = () => {
    navigator.clipboard.writeText(`DocuIA — Reportes institucionales con IA: ${window.location.href}`);
    saveToSupabase("referrals", { email_from: form.email });
    alert("Enlace copiado. Envíelo por WhatsApp o correo.");
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
        <strong>Nota importante:</strong> Revise el informe antes de enviarlo. Verifique todos los datos y no confíe en la IA al 100%.
      </div>

      {/* Report content */}
      <div style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 12, padding: "32px 28px",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 14, color: "var(--text)",
        lineHeight: 1.8, whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxHeight: 520, overflowY: "auto",
      }}>
        {report}
      </div>

      {/* Copy */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className="btn" onClick={copyReport} style={{
          flex: 1, minWidth: 200, padding: "13px 0",
          background: copied ? "var(--ok)" : "var(--ink)",
          color: "var(--paper)",
          fontSize: 14, fontWeight: 500, borderRadius: 10,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {copied ? "Copiado al portapapeles" : "Copiar texto completo"}
        </button>
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
