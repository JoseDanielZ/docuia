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

function buildMicrocurricularTemplate() {
  const src = path.join(FORMATOS, 'planificacion-microcurricular.docx');
  const zip = new PizZip(fs.readFileSync(src));
  let xml = zip.file('word/document.xml').asText();

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
  ];

  for (const [label, tag] of scalars) {
    try { xml = injectTagInEmptyCellAfterLabel(xml, label, tag); } catch { /* some merged cells */ }
  }

  try {
    xml = injectTagInEmptyCellAfterLabel(xml, 'FECHA DE INICIO ', '{{fecha_inicio}}');
    xml = injectTagInEmptyCellAfterLabel(xml, 'FECHA DE FINALIZACIÓN ', '{{fecha_fin}}');
  } catch { /* ignore */ }

  // Loop row: first "Semana" data row in desarrollo table — tag with semanas loop
  const loopRowStart = xml.indexOf('Semana ');
  if (loopRowStart !== -1) {
    const trStart = xml.lastIndexOf('<w:tr', loopRowStart);
    const trEnd = xml.indexOf('</w:tr>', loopRowStart) + 7;
    if (trStart !== -1 && trEnd > trStart) {
      const row = xml.slice(trStart, trEnd);
      let loopRow = row
        .replace(/Semana[\s\S]*?del 202[\s\S]*?<\/w:p>/, RUN.replace('{{TAG}}', '{{#semanas}}{{semana_label}}'))
        .replace(/<\/w:tr>$/, '');
      const cells = ['{{proc}}', '{{conc}}', '{{act}}', '{{actividades}}', '{{recursos}}', '{{criterios}}', '{{tecnicas}}'];
      let ci = 0;
      loopRow = loopRow.replace(/<w:pPr>[\s\S]*?<\/w:pPr><\/w:p>/g, (m) => {
        if (ci >= cells.length) return m;
        const t = cells[ci++];
        return m.replace('</w:p>', `${RUN.replace('{{TAG}}', t)}</w:p>`);
      });
      loopRow += `${RUN.replace('{{TAG}}', '{{/semanas}}')}</w:tr>`;
      xml = xml.slice(0, trStart) + loopRow + xml.slice(trEnd);
      // Remove duplicate Semana 2..12 rows (rough: rows containing "Semana 2:" etc.)
      xml = xml.replace(/<w:tr[^>]*>[\s\S]*?Semana [2-9][\s\S]*?<\/w:tr>/g, '');
      xml = xml.replace(/<w:tr[^>]*>[\s\S]*?Semana 1[0-2][\s\S]*?<\/w:tr>/g, '');
    }
  }

  // Estrategias loop row
  xml = xml.replace(
    /<w:tr[^>]*>[\s\S]*?\*\*Semana 1\*\*[\s\S]*?<\/w:tr>/,
    (row) => row.replace('**Semana 1**', '{{#estrategias}}{{semana_label}}')
  ).replace(/Semana 2[\s\S]*?estrategia_sem2[\s\S]*?<\/w:tr>/, '{{/estrategias}}');

  // Simpler estrategias: replace first estrategia row pattern
  const estIdx = xml.indexOf('ESTRATEGIAS METODOLÓGICAS');
  if (estIdx !== -1) {
    const sub = xml.slice(estIdx);
    const tr1 = sub.match(/<w:tr[^>]*>[\s\S]*?Semana[\s\S]*?<\/w:tr>/);
    if (tr1) {
      let lr = tr1[0]
        .replace(/Semana[^<]*/, '{{#estrategias}}{{semana_label}}')
        .replace(/<w:pPr>[\s\S]*?<\/w:pPr><\/w:p>/g, (m, offset) => {
          if (m.includes('{{#estrategias}}')) return m;
          return m.replace('</w:p>', `${RUN.replace('{{TAG}}', '{{competencia}}')}</w:p>`);
        });
      lr = lr.replace(/<\/w:tr>$/, `${RUN.replace('{{TAG}}', '{{estrategia}}')}${RUN.replace('{{TAG}}', '{{/estrategias}}')}</w:tr>`);
      xml = xml.slice(0, estIdx + sub.indexOf(tr1[0])) + lr + xml.slice(estIdx + sub.indexOf(tr1[0]) + tr1[0].length);
    }
  }

  xml = insertAfterParagraphContaining(xml, 'OBSERVACIONES DE LA UNIDAD', RUN.replace('{{TAG}}', '{{observaciones_unidad}}'));

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
