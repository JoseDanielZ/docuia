import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { renderAsync } from 'docx-preview';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType,
} from 'docx';
import { getTemplatePath, prepareTemplateData, normalizeSemanas } from '../config/feAlegriaSchemas.js';
import { stripPicBullets } from './docxSanitize.js';

/* ── Plantilla Fe y Alegría (docxtemplater) ─────────────────────────────── */

export async function fillTemplate(type, data, form = {}) {
  let payload = { ...data };
  if (type === 'microcurricular' && form?.num_semanas) {
    payload = normalizeSemanas(payload, form.num_semanas);
  }
  payload = prepareTemplateData(type, payload);

  const path = getTemplatePath(type);
  if (!path) throw new Error('Tipo de plantilla no soportado');

  const resp = await fetch(path);
  if (!resp.ok) throw new Error('No se pudo cargar la plantilla institucional');

  const buf = await resp.arrayBuffer();
  const zip = new PizZip(buf);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  });
  doc.render(payload);
  return doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

export function downloadDocxBlob(blob, fileName) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.docx`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function printDocxBlob(blob, title = 'DocuIA') {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff';
  document.body.appendChild(host);
  const styleHost = document.createElement('div');
  try {
    const safeBlob = await stripPicBullets(blob);
    await renderAsync(safeBlob, host, styleHost, {
      className: 'docx-preview-content',
      inWrapper: true,
      ignoreWidth: false,
      renderHeaders: true,
      renderFooters: true,
    });
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>@media print{@page{margin:1.5cm}} body{margin:0;background:#fff} .docx-wrapper{background:#fff;padding:0}</style></head><body></body></html>`);
    w.document.body.innerHTML = host.innerHTML;
    if (styleHost.innerHTML) {
      const st = w.document.createElement('style');
      st.textContent = styleHost.textContent || styleHost.innerHTML;
      w.document.head.appendChild(st);
    }
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 600);
  } finally {
    document.body.removeChild(host);
  }
}

/* ── Markdown legacy (tipos no Fe y Alegría) ──────────────────────────── */

function parseInlineRuns(text) {
  const runs = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[2]) runs.push(new TextRun({ text: m[2], bold: true }));
    else if (m[3]) runs.push(new TextRun({ text: m[3], italics: true }));
    else if (m[4]) runs.push(new TextRun({ text: m[4] }));
  }
  if (!runs.length) runs.push(new TextRun({ text }));
  return runs;
}

function markdownToDocxChildren(markdown) {
  const children = [];
  for (const line of markdown.split('\n')) {
    const t = line.trim();
    if (!t || t === '---') continue;
    if (t.startsWith('# ')) children.push(new Paragraph({ text: t.slice(2), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
    else if (t.startsWith('## ') || /^\d+\.\s/.test(t)) children.push(new Paragraph({ text: t.replace(/^#+\s*/, ''), heading: HeadingLevel.HEADING_2 }));
    else children.push(new Paragraph({ children: parseInlineRuns(t), alignment: AlignmentType.JUSTIFIED }));
  }
  return children;
}

export async function exportMarkdownToDocx(reportMarkdown, fileName) {
  const doc = new Document({ sections: [{ children: markdownToDocxChildren(reportMarkdown) }] });
  const blob = await Packer.toBlob(doc);
  downloadDocxBlob(blob, fileName);
}

/** @deprecated use fillTemplate + downloadDocxBlob for Fe y Alegría */
export async function exportToDocx(reportMarkdown, fileName) {
  return exportMarkdownToDocx(reportMarkdown, fileName);
}
