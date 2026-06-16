/** Ancho natural del docx incluyendo tablas que sobresalen de la hoja. */
export function measureDocxContentWidth(scaleWrap, appliedZoom = 1) {
  const wrapper = scaleWrap?.querySelector('.docx-wrapper');
  if (!wrapper) return 0;
  const z = appliedZoom || 1;
  const wrapRect = scaleWrap.getBoundingClientRect();
  let maxRight = wrapRect.left;

  wrapper.querySelectorAll('table, section.docx').forEach((el) => {
    const r = el.getBoundingClientRect();
    maxRight = Math.max(maxRight, r.right);
  });

  const fromElements = (maxRight - wrapRect.left) / z;
  const fromScroll = scaleWrap.scrollWidth / z;
  return Math.max(fromElements, fromScroll, scaleWrap.getBoundingClientRect().width / z);
}

export function computeFitZoom(scaleWrap, scrollContainer, appliedZoom, { padding = 28, min = 0.25, max = 1 } = {}) {
  const contentW = measureDocxContentWidth(scaleWrap, appliedZoom);
  if (!contentW) return appliedZoom;
  const avail = scrollContainer.clientWidth - padding;
  return Math.min(max, Math.max(min, avail / contentW));
}
