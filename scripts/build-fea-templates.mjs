/**
 * Genera copias .template.docx tageadas para docxtemplater.
 * Ejecutar: node scripts/build-fea-templates.mjs
 */
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FORMATOS = path.join(ROOT, 'public', 'formatos');

const RUN = '<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:lang w:val="es-EC"/></w:rPr><w:t>{{TAG}}</w:t></w:r>';

function injectTagInEmptyCellAfterLabel(xml, label, tag) {
  const labelIdx = xml.indexOf(`<w:t>${label}</w:t>`);
  if (labelIdx === -1) {
    const alt = xml.indexOf(`<w:t xml:space="preserve">${label}</w:t>`);
    if (alt === -1) throw new Error(`Label not found: ${label}`);
    return injectAfterLabelAt(xml, alt, tag);
  }
  return injectAfterLabelAt(xml, labelIdx, tag);
}

function injectAfterLabelAt(xml, labelIdx, tag) {
  const afterLabel = xml.slice(labelIdx);
  const tcEnd = afterLabel.indexOf('</w:tc>');
  const nextTc = afterLabel.indexOf('<w:tc>', tcEnd);
  if (nextTc === -1) throw new Error(`No value cell after label near ${tag}`);
  const slice = afterLabel.slice(nextTc);
  const emptyP = slice.match(/<w:p[^>]*><w:pPr>[\s\S]*?<\/w:pPr><\/w:p>/);
  if (!emptyP) throw new Error(`Empty paragraph not found for ${tag}`);
  const run = RUN.replace('{{TAG}}', tag);
  const filled = emptyP[0].replace('</w:p>', `${run}</w:p>`);
  const absStart = labelIdx + nextTc + slice.indexOf(emptyP[0]);
  return xml.slice(0, absStart) + filled + xml.slice(absStart + emptyP[0].length);
}

function replaceText(xml, from, to) {
  if (!xml.includes(from)) {
    console.warn(`  warn: "${from.slice(0, 40)}" not found`);
    return xml;
  }
  return xml.split(from).join(to);
}

function insertAfterParagraphContaining(xml, needle, insertRun) {
  const i = xml.indexOf(needle);
  if (i === -1) return xml;
  const pEnd = xml.indexOf('</w:p>', i);
  if (pEnd === -1) return xml;
  return xml.slice(0, pEnd) + insertRun + xml.slice(pEnd);
}

function buildContingenciaTemplate() {
  const src = path.join(FORMATOS, 'plan-contingencia.docx');
  const zip = new PizZip(fs.readFileSync(src));
  let xml = zip.file('word/document.xml').asText();

  const pairs = [
    ['FECHA:', '{{fecha}}'],
    ['TRIMESTRE', '{{trimestre}}'],
    ['ASIGNATURA:', '{{asignatura}}'],
    ['DOCENTE:', '{{nombre_docente}}'],
    ['GRADO/CURSO:', '{{grado_curso}}'],
    ['ESTUDIANTE/S', '{{nombres_estudiantes}}'],
    ['TEMA DE LA CLASE:', '{{tema_clase}}'],
    ['OBJETIVO DE CLASE:', '{{objetivo_clase}}'],
    ['INSTRUCCIONES:', '{{instrucciones}}'],
    [' A REALIZAR', '{{actividades}}'],
    ['FECHA DE ENTREGA', '{{fecha_entrega}}'],
    ['OBSERVACIÓN: ', '{{observacion}}'],
  ];

  for (const [label, tag] of pairs) {
    try {
      xml = injectTagInEmptyCellAfterLabel(xml, label, tag);
    } catch (e) {
      console.warn(`  contingencia ${label}: ${e.message}`);
    }
  }

  xml = replaceText(xml, 'JAVIER CASTILLO ', '{{nombre_docente_firma}}');
  xml = insertAfterParagraphContaining(
    xml,
    'MATERIAL DE APOYO.',
    RUN.replace('{{TAG}}', '{{material_apoyo}}')
  );
  try {
    xml = injectTagInEmptyCellAfterLabel(xml, 'VICERRECTOR', '{{nombre_vicerrector}}');
  } catch { /* firma cell */ }

  zip.file('word/document.xml', xml);
  fs.writeFileSync(path.join(FORMATOS, 'plan-contingencia.template.docx'), zip.generate({ type: 'nodebuffer' }));
  console.log('✓ plan-contingencia.template.docx');
}

/** Texto plano de una fila (concatena todos los <w:t>), normalizado. */
function rowText(row) {
  return [...row.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
    .map(m => m[1]).join('').replace(/\s+/g, ' ').trim();
}

/** Vacía la celda banner (1 celda) y deja un único run con el tag, conservando el formato del párrafo. */
function setBannerCell(row, tag) {
  const out = row.replace(/<w:r\b[\s\S]*?<\/w:r>/g, '');
  return out.replace('</w:p>', `${RUN.replace('{{TAG}}', tag)}</w:p>`);
}

/** Inyecta un run-tag en el primer párrafo vacío de cada <w:tc>, en orden. */
function fillCells(row, tags) {
  let ci = 0;
  return row.replace(/<w:tc>[\s\S]*?<\/w:tc>/g, (tc) => {
    if (ci >= tags.length) return tc;
    const tag = tags[ci++];
    if (!tag) return tc;
    let done = false;
    return tc.replace(/(<w:p\b[^>]*>(?:<w:pPr>[\s\S]*?<\/w:pPr>)?)(<\/w:p>)/, (m, open, close) => {
      if (done) return m;
      done = true;
      return `${open}${RUN.replace('{{TAG}}', tag)}${close}`;
    });
  });
}

/** Inserta un run-tag justo después del run cuyo texto es `runText` (para firmas en celda compartida). */
function appendTagAfterRunText(xml, runText, tag) {
  const tIdx = xml.indexOf(`>${runText}</w:t>`);
  if (tIdx === -1) { console.warn(`  micro firma "${runText}": run no encontrado`); return xml; }
  const rEnd = xml.indexOf('</w:r>', tIdx);
  if (rEnd === -1) return xml;
  const at = rEnd + '</w:r>'.length;
  return xml.slice(0, at) + RUN.replace('{{TAG}}', tag) + xml.slice(at);
}

/**
 * Tabla microcurricular = 1 tabla, filas tipo "banner + contenido":
 *  - Semanas:   fila banner "Semana N:" (1 celda) + fila contenido (7 celdas) → loop {{#semanas}}
 *  - Adaptaciones: 1 fila contenido (2 celdas) tras el encabezado → loop {{#adaptaciones}}
 *  - Estrategias: fila banner "SEMANA N:" (1 celda) + fila contenido (2 celdas) → loop {{#estrategias}}
 * Se procesa fila por fila con una máquina de estados; se eliminan las filas 2..N de cada bloque.
 */
function injectMicrocurricularLoops(xml) {
  const WEEK = ['{{proc}}', '{{conc}}', '{{act}}', '{{actividades}}', '{{recursos}}', '{{criterios}}', '{{tecnicas}}{{/semanas}}'];
  const ESTR = ['{{competencia}}', '{{estrategia}}{{/estrategias}}'];
  const ADAPT = ['{{#adaptaciones}}{{iniciales}}', '{{necesidad}}{{/adaptaciones}}'];
  const seen = { semanas: false, estrategias: false, adaptaciones: false };
  let pending = null; // week-fill | week-drop | estr-fill | estr-drop | adapt-fill

  const out = xml.replace(/<w:tr\b[\s\S]*?<\/w:tr>/g, (row) => {
    const t = rowText(row);

    // 1) consumir la fila de contenido que sigue a un banner/encabezado
    if (pending === 'week-fill')  { pending = null; return fillCells(row, WEEK); }
    if (pending === 'week-drop')  { pending = null; return ''; }
    if (pending === 'estr-fill')  { pending = null; return fillCells(row, ESTR); }
    if (pending === 'estr-drop')  { pending = null; return ''; }
    if (pending === 'adapt-fill') { pending = null; seen.adaptaciones = true; return fillCells(row, ADAPT); }

    // 2) banners semanales
    if (/^Semana 1:/.test(t))                  { pending = 'week-fill'; seen.semanas = true; return setBannerCell(row, '{{#semanas}}{{semana_label}}'); }
    if (/^Semana (?:[2-9]|1[0-4]):/.test(t))   { pending = 'week-drop'; return ''; }

    // 3) banners de estrategias
    if (/^SEMANA 1:/.test(t))                  { pending = 'estr-fill'; seen.estrategias = true; return setBannerCell(row, '{{#estrategias}}{{semana_label}}'); }
    if (/^SEMANA (?:[2-9]|1[0-2]):/.test(t))   { pending = 'estr-drop'; return ''; }

    // 4) encabezado de adaptaciones → la siguiente fila es la fila de contenido
    if (/^Estudiante: solo poner iniciales/.test(t)) { pending = 'adapt-fill'; return row; }

    return row;
  });

  for (const k of Object.keys(seen)) {
    if (!seen[k]) console.warn(`  micro loop "${k}": fila ancla no encontrada`);
  }
  return out;
}

function buildMicrocurricularTemplate() {
  const src = path.join(FORMATOS, 'planificacion-microcurricular.docx');
  const zip = new PizZip(fs.readFileSync(src));
  let xml = zip.file('word/document.xml').asText();

  // 1) Escalares: DATOS DE REFERENCIA + trimestre + fechas
  const scalars = [
    ['FIGURA PROFESIONAL', '{{figura_profesional}}'],
    ['NOMBRE DEL DOCENTE', '{{nombre_docente}}'],
    ['ÁREA ', '{{area}}'],
    ['CURSO', '{{curso}}'],
    ['AÑO LECTIVO ', '{{año_lectivo}}'],
    ['NOMBRE DEL MÓDULO FORMATIVO', '{{nombre_modulo}}'],
    ['N° DE HORAS', '{{num_horas}}'],
    ['OBJETIVO DE', '{{objetivo_modulo}}'],
    ['N° Y NOMBRE DE LA UNIDAD DE TRABAJO', '{{nombre_unidad_trabajo}}'],
    ['OBJETIVO DE LA UNIDAD DE TRABAJO', '{{objetivo_unidad_trabajo}}'],
    ['EJES TRANSVERSALES ', '{{ejes_transversales}}'],
    ['TRIMEMESTRE N', '{{numero_trimestre}}'],
    ['FECHA DE INICIO ', '{{fecha_inicio}}'],
    ['FECHA DE FINALIZACIÓN ', '{{fecha_fin}}'],
  ];
  for (const [label, tag] of scalars) {
    try { xml = injectTagInEmptyCellAfterLabel(xml, label, tag); }
    catch (e) { console.warn(`  micro scalar "${label}": ${e.message}`); }
  }

  // 2) Loops: semanas, adaptaciones, estrategias (fila por fila)
  xml = injectMicrocurricularLoops(xml);

  // 3) Observaciones de la unidad
  xml = insertAfterParagraphContaining(xml, 'OBSERVACIONES DE LA UNIDAD', RUN.replace('{{TAG}}', '{{observaciones_unidad}}'));

  // 4) Firmas (nombres dinámicos)
  xml = replaceText(xml, 'LIC. MARCO SALAZAR', '{{nombre_coordinador}}');
  xml = replaceText(xml, 'MSC. JAVIER CASTILLO', '{{nombre_vicerrector}}');
  xml = appendTagAfterRunText(xml, 'Docente: ', '{{nombre_docente}}');
  xml = appendTagAfterRunText(xml, 'DECE: ', '{{nombre_dece}}');

  zip.file('word/document.xml', xml);
  fs.writeFileSync(path.join(FORMATOS, 'planificacion-microcurricular.template.docx'), zip.generate({ type: 'nodebuffer' }));
  console.log('✓ planificacion-microcurricular.template.docx');
}

function buildInformeTutorTemplate() {
  const src = path.join(FORMATOS, 'informe-docente-tutor.docx');
  const zip = new PizZip(fs.readFileSync(src));
  let xml = zip.file('word/document.xml').asText();

  const datos = [
    ['Tutor/a:', '{{nombre_docente}}'],
    ['Trimestre:', '{{trimestre}}'],
    ['Fecha:', '{{fecha}}'],
    ['Grado/Curso:', '{{grado_curso}}'],
    ['Paralelo:', '{{paralelo}}'],
    ['Nº. de estudiantes matriculados:', '{{num_matriculados}}'],
    ['Nº. de estudiantes que asisten', '{{num_asisten}}'],
    ['Nº. de estudiantes re', '{{num_retirados}}'],
    ['Motivos de la deserción estudiantil:', '{{motivos_desercion}}'],
  ];
  for (const [label, tag] of datos) {
    try { xml = injectTagInEmptyCellAfterLabel(xml, label, tag); } catch { /* merged */ }
  }

  // Bloques de contenido (la IA genera arrays; fillTemplate los convierte a texto)
  const blockReplacements = [
    ['Informe de Inglés', '{{asignaturas_bloque}}'],
    ['convivencia adecuada', '{{convivencia_general}}'],
    ['ASPECTOS COMPORTAMENTALES', '{{normas_institucionales}}'],
  ];
  for (const [from, tag] of blockReplacements) {
    if (xml.includes(from)) xml = replaceText(xml, from, tag);
  }

  xml = replaceText(xml, 'Retorno a su país natal ', '{{motivos_desercion}}');
  xml = replaceText(xml, '20 de marzo DE 2026', '{{fecha}}');

  // Seguimiento, casos, sugerencias — tags escalares en párrafos vacíos tras títulos
  const scalarInserts = [
    ['JÓVENES EN MOVIMIENTO', '{{temas_jovenes_movimiento}}'],
    ['temas sugeridos', '{{temas_sugeridos}}'],
    ['Sugerencias para el DECE', '{{sugerencias_dece}}'],
    ['Sugerencias para Inspección', '{{sugerencias_inspeccion}}'],
    ['Sugerencias para Vicerrectorado', '{{sugerencias_vicerrectorado}}'],
    ['Sugerencias para Rectorado', '{{sugerencias_rectorado}}'],
    ['Sugerencias para docentes', '{{sugerencias_docentes}}'],
    ['seguimiento tutorial', '{{seguimiento_bloque}}'],
    ['vulnerabilidad', '{{casos_vulnerabilidad_bloque}}'],
    ['padres de familia', '{{problemas_padres_bloque}}'],
  ];
  for (const [needle, tag] of scalarInserts) {
    xml = insertAfterParagraphContaining(xml, needle, RUN.replace('{{TAG}}', tag));
  }

  zip.file('word/document.xml', xml);
  fs.writeFileSync(path.join(FORMATOS, 'informe-docente-tutor.template.docx'), zip.generate({ type: 'nodebuffer' }));
  console.log('✓ informe-docente-tutor.template.docx');
}

console.log('Building Fe y Alegría template docx files…');
buildContingenciaTemplate();
buildMicrocurricularTemplate();
buildInformeTutorTemplate();
console.log('Done.');
