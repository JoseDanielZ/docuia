import { useState } from "react";

const PASOS = [
  {
    icono: "📚",
    titulo: "Agrega tu curso",
    descripcion: "Guarda los datos de tu curso una vez y se rellenarán automáticamente en cada reporte.",
  },
  {
    icono: "📄",
    titulo: "Elige el tipo de reporte",
    descripcion: "Selecciona qué tipo de informe necesitas: semanal, calificaciones, asistencia, DECE o planificación.",
  },
  {
    icono: "✨",
    titulo: "Genera con IA",
    descripcion: "Completa los campos y en segundos tendrás un reporte listo para revisar, editar y descargar.",
  },
];

export default function OnboardingModal({ onClose }) {
  const [paso, setPaso] = useState(0);

  const handleClose = () => {
    try { localStorage.setItem('docuia_onboarding_done', '1'); } catch { /* ignorar */ }
    onClose?.();
  };

  const esUltimo = paso === PASOS.length - 1;
  const { icono, titulo, descripcion } = PASOS[paso];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,.5)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label="Bienvenida a DocuIA"
    >
      <div
        style={{
          background: "var(--paper)", borderRadius: 16,
          padding: "40px 36px 32px", maxWidth: 420, width: "100%",
          boxShadow: "0 12px 48px rgba(0,0,0,.22)",
          fontFamily: "'IBM Plex Sans', sans-serif",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          onClick={handleClose}
          aria-label="Saltar onboarding"
          style={{
            position: "absolute", top: 16, right: 16,
            all: "unset", cursor: "pointer",
            fontSize: 18, color: "var(--muted)",
            lineHeight: 1, padding: "4px 8px",
          }}
        >×</button>

        {/* Paso */}
        <p style={{
          margin: "0 0 20px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)",
          letterSpacing: ".08em", textTransform: "uppercase",
        }}>
          Paso {paso + 1} de {PASOS.length}
        </p>

        {/* Contenido */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: "3rem", lineHeight: 1, display: "block", marginBottom: 16 }}>{icono}</span>
          <h2 style={{
            margin: "0 0 10px",
            fontSize: 20, fontWeight: 600, color: "var(--ink)",
            letterSpacing: "-.02em",
          }}>{titulo}</h2>
          <p style={{
            margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--muted)",
          }}>{descripcion}</p>
        </div>

        {/* Indicadores */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {PASOS.map((_, i) => (
            <span key={i} style={{
              width: i === paso ? 20 : 8, height: 8,
              borderRadius: 4, transition: "width .25s ease",
              background: i === paso ? "var(--accent)" : "var(--line)",
            }} />
          ))}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 8 }}>
          {paso > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => setPaso(p => p - 1)}
              style={{ flex: 1, padding: "11px 0", fontSize: 14 }}
            >
              Anterior
            </button>
          )}
          <button
            className="btn"
            onClick={() => esUltimo ? handleClose() : setPaso(p => p + 1)}
            style={{
              flex: 2, padding: "11px 0", fontSize: 14,
              background: "var(--ink)", color: "var(--paper)", borderRadius: 10,
            }}
          >
            {esUltimo ? 'Comenzar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
