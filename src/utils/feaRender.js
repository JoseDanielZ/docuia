import { renderAsync } from 'docx-preview';
import { fillTemplate } from './docxExporter.js';
import { stripPicBullets } from './docxSanitize.js';

const RENDER_OPTS = {
  className: 'docx-preview-content',
  inWrapper: true,
  ignoreWidth: false,
  renderHeaders: true,
  renderFooters: true,
};

/** Renderiza un .docx en pantalla (sanitizado para docx-preview). */
export async function renderDocxBlob(container, styleContainer, blob) {
  if (!container) return;
  container.innerHTML = '';
  if (styleContainer) styleContainer.innerHTML = '';
  const safeBlob = await stripPicBullets(blob);
  await renderAsync(safeBlob, container, styleContainer, RENDER_OPTS);
}

export async function renderFeAReport(container, styleContainer, type, data, form) {
  const blob = await fillTemplate(type, data, form);
  await renderDocxBlob(container, styleContainer, blob);
  return blob;
}
