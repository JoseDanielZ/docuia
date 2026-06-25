/**
 * Valida que las plantillas .template.docx rendericen sin error.
 * Ejecutar: node scripts/validate-fea-templates.mjs
 */
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';
import { FE_ALEGRIA_TYPES, getDummyTemplateData, normalizeSemanas, prepareTemplateData } from '../src/config/feAlegriaSchemas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FORMATOS = path.join(__dirname, '..', 'public', 'formatos');

const TEMPLATE_FILES = {
  contingencia: 'plan-contingencia.template.docx',
  informe_tutor: 'informe-docente-tutor.template.docx',
  microcurricular: 'planificacion-microcurricular.template.docx',
};

/**
 * Valores que DEBEN aparecer en el .docx renderizado con los datos dummy.
 * Cubren el contenido dinámico crítico (loops/bloques) de cada formato, para
 * detectar plantillas que renderizan "en blanco" aunque no lancen error.
 */
const EXPECTED_VALUES = {
  contingencia: ['Fracciones', 'Texto MINEDUC', 'Completar hoja'],
  informe_tutor: ['Matemáticas', '90% cumple uniforme', 'Sr. Pérez'],
  microcurricular: ['Ing. Gómez', 'P1', 'C1', 'A1', 'Act1', 'R1', 'Cr1', 'T1', 'J.P.', 'Tiempo extra', 'Comp1', 'Est1'],
};

/** Texto plano del .docx (concatena los <w:t>). */
function docxText(buffer) {
  const xml = new PizZip(buffer).file('word/document.xml').asText();
  return [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m => m[1]).join('');
}

let failed = 0;

for (const type of FE_ALEGRIA_TYPES) {
  const file = path.join(FORMATOS, TEMPLATE_FILES[type]);
  let data = prepareTemplateData(type, getDummyTemplateData(type));
  if (type === 'microcurricular') data = normalizeSemanas(data, 2);

  try {
    const buf = fs.readFileSync(file);
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });
    doc.render(data);
    const out = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(path.join(FORMATOS, `_test-${type}.docx`), out);

    const text = docxText(out);
    const missing = (EXPECTED_VALUES[type] || []).filter(v => !text.includes(v));
    if (missing.length) {
      failed++;
      console.error(`✗ ${type}: render OK pero faltan datos en el documento → ${missing.join(', ')}`);
    } else {
      console.log(`✓ ${type}: render OK + datos presentes (${out.length} bytes)`);
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${type}:`, err.message);
    if (err.properties?.errors) {
      err.properties.errors.slice(0, 5).forEach(e => console.error('  -', e));
    }
  }
}

process.exit(failed ? 1 : 0);
