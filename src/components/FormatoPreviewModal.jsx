import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  // Mantener el zoom aplicado en un ref para poder "des-escalar" la medición.
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // Ajustar a ancho: calcula el zoom para que la página entre completa sin
  // scroll horizontal. Mide el ancho renderizado y lo divide por el zoom aplicado.
  const computeFit = useCallback(() => {
    const wrap = scaleWrapRef.current;
    const body = bodyRef.current;
    if (!wrap || !body) return;
    const inner = wrap.querySelector(".docx-wrapper") || wrap.firstElementChild;
    if (!inner) return;
    const applied = zoomRef.current || 1;
    const naturalW = inner.getBoundingClientRect().width / applied;
    if (!naturalW) return;
    const avail = body.clientWidth - 28;
    const fit = Math.min(1.1, Math.max(0.35, avail / naturalW));
    setZoom(Number(fit.toFixed(3)));
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedType(isFeAlegriaType(initialType) ? initialType : FE_ALEGRIA_TYPE_IDS[0]);
    setError("");
    setZoom(0.85);
  }, [open, initialType]);

  // Bloquear el scroll de la página de fondo mientras el modal está abierto:
  // evita que su scrollbar vertical se vea como una "tira" en el borde de la pantalla.
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

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

        if (!cancelled) requestAnimationFrame(() => { if (!cancelled) computeFit(); });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al renderizar el formato");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, selectedType, computeFit]);

  // Recalcular el ajuste a ancho cuando cambia el tamaño de la ventana.
  useEffect(() => {
    if (!open) return;
    const onResize = () => computeFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, computeFit]);

  if (!open) return null;

  return createPortal(
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
            <button type="button" className="formato-preview-zoom-btn" onClick={() => setZoom(z => Math.max(0.35, Number((z - 0.1).toFixed(3))))} aria-label="Reducir zoom">−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button type="button" className="formato-preview-zoom-btn" onClick={() => setZoom(z => Math.min(1.5, Number((z + 0.1).toFixed(3))))} aria-label="Aumentar zoom">+</button>
            <button type="button" className="formato-preview-zoom-btn formato-preview-zoom-fit" onClick={computeFit} aria-label="Ajustar a ancho" title="Ajustar a ancho">⤢</button>
          </div>
        </div>
        {loading && <p className="formato-preview-status">Cargando formato…</p>}
        {error && <p className="formato-preview-error">{error}</p>}
        <div ref={styleRef} className="formato-preview-styles" />
        <div ref={bodyRef} className="formato-preview-body">
          <div ref={scaleWrapRef} className="formato-preview-scale-wrap" style={{ zoom }} />
        </div>
      </div>
    </div>,
    document.body
  );
}
