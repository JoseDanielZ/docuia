import { Component } from "react";
import "./ErrorBoundary.css";

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
      <div className="error-boundary">
        <div className="error-boundary__title">Algo salió mal</div>
        <p className="error-boundary__desc">
          Ocurrió un error inesperado. Recarga la página para continuar.
        </p>
        <button className="error-boundary__btn" onClick={() => window.location.reload()}>
          Recargar página
        </button>
        {this.state.error && (
          <details className="error-boundary__details">
            <summary className="error-boundary__summary">Detalles técnicos</summary>
            <pre className="error-boundary__trace">{this.state.error.message}</pre>
          </details>
        )}
      </div>
    );
  }
}
