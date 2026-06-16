import PizZip from 'pizzip';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function sanitizeNumberingXml(xml) {
  if (!xml.includes('numPicBullet') && !xml.includes('lvlPicBulletId')) {
    return xml;
  }

  let out = xml.replace(/<w:numPicBullet[\s\S]*?<\/w:numPicBullet>/g, '');
  out = out.replace(/<w:lvlPicBulletId\b[^>]*\/>/g, '');

  // Niveles que quedaron sin marcador tras quitar picture bullet
  out = out.replace(/<w:lvl\b([^>]*)>([\s\S]*?)<\/w:lvl>/g, (full, attrs, inner) => {
    if (inner.includes('lvlPicBulletId') || inner.includes('numPicBullet')) return full;
    if (inner.includes('<w:numFmt') && inner.includes('<w:lvlText')) return full;
    const bullet = '<w:numFmt w:val="bullet"/><w:lvlText w:val="•"/>';
    return `<w:lvl${attrs}>${bullet}${inner}</w:lvl>`;
  });

  return out;
}

async function toArrayBuffer(input) {
  if (input instanceof ArrayBuffer) return input;
  if (input instanceof Blob) return input.arrayBuffer();
  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  throw new TypeError('stripPicBullets espera Blob o ArrayBuffer');
}

/**
 * Quita picture bullets de numbering.xml para que docx-preview no renderice
 * imágenes 400×400 como viñetas. Solo usar antes de render en pantalla/PDF.
 */
export async function stripPicBullets(blobOrBuffer) {
  const buffer = await toArrayBuffer(blobOrBuffer);
  const zip = new PizZip(buffer);
  const entry = zip.file('word/numbering.xml');

  if (!entry) {
    return blobOrBuffer instanceof Blob ? blobOrBuffer : new Blob([buffer], { type: DOCX_MIME });
  }

  const original = entry.asText();
  const sanitized = sanitizeNumberingXml(original);

  if (sanitized === original) {
    return blobOrBuffer instanceof Blob ? blobOrBuffer : new Blob([buffer], { type: DOCX_MIME });
  }

  zip.file('word/numbering.xml', sanitized);
  return new Blob([zip.generate({ type: 'arraybuffer' })], { type: DOCX_MIME });
}
