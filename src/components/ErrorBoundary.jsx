import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "80vh", padding: "40px 24px", textAlign: "center",
        background: "var(--paper)",
      }}>
        <div style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 22, color: "var(--ink)", marginBottom: 12, fontWeight: 400,
        }}>
          Algo salió mal
        </div>
        <p style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 14, color: "var(--muted)", marginBottom: 24,
          maxWidth: 400, lineHeight: 1.6,
        }}>
          Ocurrió un error inesperado. Recarga la página para continuar.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px", borderRadius: 8,
            background: "var(--ink)", color: "var(--paper)",
            border: "none", cursor: "pointer",
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 14, fontWeight: 500,
          }}
        >
          Recargar página
        </button>
        {this.state.error && (
          <details style={{ marginTop: 24, maxWidth: 480, textAlign: "left" }}>
            <summary style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: "var(--muted)", cursor: "pointer",
            }}>
              Detalles técnicos
            </summary>
            <pre style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: "var(--danger)",
              whiteSpace: "pre-wrap", marginTop: 8,
              background: "var(--paper-2)", padding: "12px",
              borderRadius: 6, overflow: "auto",
            }}>
              {this.state.error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
