export default function LoadingView({ loadMsg }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "80vh", background: "var(--paper)",
    }}>
      <div style={{ textAlign: "center", animation: "fadeIn .4s ease" }}>
        {/* Spinner */}
        <div style={{
          width: 40, height: 40, margin: "0 auto 32px",
          border: "1.5px solid var(--line)",
          borderTopColor: "var(--ink)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />

        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 26,
          color: "var(--ink)", margin: "0 0 12px",
          letterSpacing: "-.02em",
        }}>
          Generando su reporte
        </h2>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13, color: "var(--accent)",
          animation: "pulse 2s ease-in-out infinite",
          margin: "0 0 20px",
        }}>
          {loadMsg}
        </p>

        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)",
          letterSpacing: ".04em",
        }}>
          Esto puede tomar entre 15 y 30 segundos
        </p>
      </div>
    </div>
  );
}
