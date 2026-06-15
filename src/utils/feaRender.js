import { renderAsync } from 'docx-preview';
import { fillTemplate } from './docxExporter.js';

/** Renderiza un .docx llenado en un contenedor DOM */
export async function renderDocxBlob(container, styleContainer, blob) {
  if (!container) return;
  container.innerHTML = '';
  if (styleContainer) styleContainer.innerHTML = '';
  await renderAsync(blob, container, styleContainer, {
    className: 'docx-preview-content',
    inWrapper: true,
    ignoreWidth: false,
    renderHeaders: true,
    renderFooters: true,
  });
}

export async function renderFeAReport(container, styleContainer, type, data, form) {
  const blob = await fillTemplate(type, data, form);
  await renderDocxBlob(container, styleContainer, blob);
  return blob;
}
