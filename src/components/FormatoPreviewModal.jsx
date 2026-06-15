import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { FORMATOS_FE_ALEGRIA, FE_ALEGRIA_TYPE_IDS, isFeAlegriaType } from "../config/formatosFeAlegria.js";
import "./FormatoPreviewModal.css";

export default function FormatoPreviewModal({ open, onClose, initialType }) {
  const bodyRef = useRef(null);
  const scaleWrapRef = useRef(null);
  const styleRef = useRef(null);
  const [selectedType, setSelectedType] = useState(FE_ALEGRIA_TYPE_IDS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(0.85);

  useEffect(() => {
    if (!open) return;
    setSelectedType(isFeAlegriaType(initialType) ? initialType : FE_ALEGRIA_TYPE_IDS[0]);
    setError("");
    setZoom(0.85);
  }, [open, initialType]);

  useEffect(() => {
    if (!open || !selectedType) return;

    let cancelled = false;
    const container = scaleWrapRef.current;
    const styleContainer = styleRef.current;

    (async () => {
      setLoading(true);
      setError("");

      const info = FORMATOS_FE_ALEGRIA[selectedType];
      if (!info) {
        setError("Formato no disponible");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch(info.previewPath);
        if (!resp.ok) throw new Error("No se pudo cargar el archivo de formato");
        const blob = await resp.blob();

        if (cancelled || !container) return;
        container.innerHTML = "";
        if (styleContainer) styleContainer.innerHTML = "";

        await renderAsync(blob, container, styleContainer, {
          className: "docx-preview-content",
          inWrapper: true,
          ignoreWidth: false,
          renderHeaders: true,
          renderFooters: true,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al renderizar el formato");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, selectedType]);

  if (!open) return null;

  return (
    <div className="regen-overlay formato-preview-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Vista previa del formato Fe y Alegría">
      <div className="regen-card formato-preview-card" onClick={(e) => e.stopPropagation()}>
        <div className="regen-card__bar" />
        <div className="formato-preview-header">
          <h3 className="regen-card__title">Formato oficial Fe y Alegría</h3>
          <button type="button" className="formato-preview-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="formato-preview-toolbar">
          <p className="formato-preview-hint">
            Referencia del formato oficial. La descarga usa la misma plantilla con tus datos.
          </p>
          <select
            id="formato-preview-select"
            className="formato-preview-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Tipo de formato"
          >
            {FE_ALEGRIA_TYPE_IDS.map((id) => (
              <option key={id} value={id}>{FORMATOS_FE_ALEGRIA[id].label}</option>
            ))}
          </select>
          <div className="formato-preview-zoom">
            <button type="button" className="formato-preview-zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} aria-label="Reducir zoom">−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" className="formato-preview-zoom-btn" onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} aria-label="Aumentar zoom">+</button>
          </div>
        </div>
        {loading && <p className="formato-preview-status">Cargando formato…</p>}
        {error && <p className="formato-preview-error">{error}</p>}
        <div ref={styleRef} className="formato-preview-styles" />
        <div ref={bodyRef} className="formato-preview-body">
          <div ref={scaleWrapRef} className="formato-preview-scale-wrap" style={{ transform: `scale(${zoom})` }} />
        </div>
      </div>
    </div>
  );
}
