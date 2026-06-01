function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toHtml(text) {
  return text.split("\n").map(line => {
    const t = line.trim();
    if (!t) return "";
    if (t.startsWith("# ") || t.match(/^FE Y ALEGRÍA/i)) return `<h1>${escapeHtml(t.replace(/^#+\s*/, ""))}</h1>`;
    if (t.startsWith("## ") || t.match(/^\d+\.\s+[A-ZÁÉÍÓÚ]/)) return `<h2>${escapeHtml(t.replace(/^#+\s*/, ""))}</h2>`;
    if (t.startsWith("**") && t.endsWith("**")) return `<h2>${escapeHtml(t.replaceAll('**', ""))}</h2>`;
    return `<p>${escapeHtml(t).replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>")}</p>`;
  }).filter(Boolean).join("\n");
}

export function downloadWord(text, filename) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 1.5cm 2.5cm 2.5cm 2.5cm; color: #1a1a1a; }
  h1   { font-size: 16pt; font-weight: bold; text-align: center; margin-top: 0; margin-bottom: 12pt; }
  h2   { font-size: 14pt; font-weight: bold; margin-top: 12pt; border-bottom: 1pt solid #1E3A5F; padding-bottom: 4pt; }
  h1:first-child, h2:first-child { margin-top: 0; }
  p    { margin: 6pt 0; text-align: justify; }
</style></head><body>${toHtml(text)}</body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function downloadPDF(text, filename) {
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(filename)}</title><style>
    @media print { @page { margin: 2cm; } }
    body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.6; max-width: 21cm; margin: 2cm auto; color: #1a1a1a; }
    h1   { font-size: 16pt; font-weight: bold; text-align: center; border-bottom: 2px solid #1E3A5F; padding-bottom: 8px; }
    h2   { font-size: 13pt; font-weight: bold; margin-top: 16px; color: #2D3561; }
    p    { margin: 6px 0; text-align: justify; }
  </style></head><body>${toHtml(text)}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export function downloadExcel(text, filename) {
  const rows = text.split("\n").filter(l => l.trim());
  let csv = "﻿";
  rows.forEach(r => { csv += `"${r.replaceAll('"', '""')}"\n`; });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function printReport(text) {
  downloadPDF(text, "DocuIA_Reporte");
}
