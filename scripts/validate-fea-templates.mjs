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
    console.log(`✓ ${type}: render OK (${out.length} bytes)`);
  } catch (err) {
    failed++;
    console.error(`✗ ${type}:`, err.message);
    if (err.properties?.errors) {
      err.properties.errors.slice(0, 5).forEach(e => console.error('  -', e));
    }
  }
}

process.exit(failed ? 1 : 0);
