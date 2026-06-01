import { useState } from "react";
import "./OnboardingModal.css";

const PASOS = [
  {
    icono: "📚",
    titulo: "Agrega tu curso",
    descripcion: "Guarda los datos de tu curso una sola vez y se rellenarán automáticamente en cada reporte.",
  },
  {
    icono: "📄",
    titulo: "Elige el tipo de reporte",
    descripcion: "Semanal, calificaciones, asistencia, DECE o planificación. Cada tipo tiene su formulario especializado.",
  },
  {
    icono: "✨",
    titulo: "Genera con IA",
    descripcion: "Completa los campos y en segundos tendrás un reporte institucional listo para revisar y descargar.",
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
      className="onboarding-overlay"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label="Bienvenida a DocuIA"
    >
      <div className="onboarding-card" onClick={e => e.stopPropagation()}>
        <button className="onboarding-close" onClick={handleClose} aria-label="Saltar">
          ×
        </button>

        <p className="onboarding-counter">Paso {paso + 1} de {PASOS.length}</p>

        <div className="onboarding-content">
          <div className="onboarding-icon">{icono}</div>
          <h2 className="onboarding-title">{titulo}</h2>
          <p className="onboarding-desc">{descripcion}</p>
        </div>

        {/* Dots — width es dinámico según el paso activo */}
        <div className="onboarding-dots">
          {PASOS.map((_, i) => (
            <span
              key={i}
              className="onboarding-dot"
              style={{
                width: i === paso ? 22 : 8,
                background: i === paso ? "var(--jade-500)" : "var(--border-default)",
              }}
            />
          ))}
        </div>

        <div className="onboarding-actions">
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
            className="btn btn-primary"
            onClick={() => esUltimo ? handleClose() : setPaso(p => p + 1)}
            style={{ flex: 2, padding: "11px 0", fontSize: 14 }}
          >
            {esUltimo ? 'Comenzar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
