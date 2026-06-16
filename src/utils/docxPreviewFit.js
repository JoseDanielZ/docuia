/**
 * Calcula el zoom para que el docx (incluida la tabla que sobresale de la hoja)
 * entre completo en el contenedor. Mide reseteando el zoom a 1 en el momento,
 * de modo que no depende de ningun zoom previo (evita medir con un valor stale).
 * Devuelve null cuando aun no hay nada renderizado que medir.
 */
export function fitDocxToWidth(scaleWrap, scrollContainer, { padding = 28, min = 0.2, max = 1 } = {}) {
  if (!scaleWrap || !scrollContainer) return null;
  if (!scaleWrap.querySelector('.docx-wrapper')) return null;
  const prev = scaleWrap.style.zoom;
  scaleWrap.style.zoom = '1';
  const natural = scaleWrap.scrollWidth;
  scaleWrap.style.zoom = prev;
  if (!natural) return null;
  const avail = scrollContainer.clientWidth - padding;
  return Math.min(max, Math.max(min, avail / natural));
}
