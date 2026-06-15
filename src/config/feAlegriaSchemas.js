/**
 * Esquema único: tags plantilla Word, claves JSON, mapeo formulario, prompts IA.
 */
export const FEA_FORMAT_VERSION = 'fea_v2';

export const FE_ALEGRIA_TYPES = ['contingencia', 'informe_tutor', 'microcurricular'];

export function isFeAlegriaType(type) {
  return FE_ALEGRIA_TYPES.includes(type);
}

/** preview = sin tags (referencia); template = con {{tags}} para docxtemplater */
export const FORMATOS_FE_ALEGRIA = {
  contingencia: {
    label: 'Plan de Contingencia',
    previewPath: '/formatos/plan-contingencia.docx',
    templatePath: '/formatos/plan-contingencia.template.docx',
  },
  informe_tutor: {
    label: 'Informe Docente Tutor/a',
    previewPath: '/formatos/informe-docente-tutor.docx',
    templatePath: '/formatos/informe-docente-tutor.template.docx',
  },
  microcurricular: {
    label: 'Planificación Microcurricular',
    previewPath: '/formatos/planificacion-microcurricular.docx',
    templatePath: '/formatos/planificacion-microcurricular.template.docx',
  },
};

export function getTemplatePath(type) {
  return FORMATOS_FE_ALEGRIA[type]?.templatePath ?? null;
}

export function getPreviewPath(type) {
  return FORMATOS_FE_ALEGRIA[type]?.previewPath ?? null;
}

/** Campos escalares: templateKey, formKey opcional, ai (si la IA debe desarrollar el valor) */
const SCALAR = (templateKey, opts = {}) => ({
  kind: 'scalar',
  key: templateKey,
  formKey: opts.formKey ?? templateKey,
  label: opts.label ?? templateKey,
  ai: opts.ai ?? false,
});

const ARRAY = (key, itemFields, opts = {}) => ({
  kind: 'array',
  key,
  label: opts.label ?? key,
  itemFields,
  ai: opts.ai ?? true,
});

export const FEA_SCHEMAS = {
  contingencia: {
    scalars: [
      SCALAR('fecha', { formKey: 'fecha', label: 'Fecha' }),
      SCALAR('trimestre', { formKey: 'trimestre', label: 'Trimestre' }),
      SCALAR('asignatura', { formKey: 'asignatura', label: 'Asignatura' }),
      SCALAR('nombre_docente', { formKey: 'docente', label: 'Docente' }),
      SCALAR('grado_curso', { formKey: 'grado_curso', label: 'Grado/Curso' }),
      SCALAR('nombres_estudiantes', { formKey: 'nombres_estudiantes', label: 'Estudiante(s)' }),
      SCALAR('tema_clase', { formKey: 'tema_clase', label: 'Tema de la clase' }),
      SCALAR('objetivo_clase', { formKey: 'objetivo_clase', label: 'Objetivo de clase', ai: true }),
      SCALAR('instrucciones', { formKey: 'instrucciones', label: 'Instrucciones', ai: true }),
      SCALAR('actividades', { formKey: 'actividades', label: 'Actividades', ai: true }),
      SCALAR('fecha_entrega', { formKey: 'fecha_entrega', label: 'Fecha de entrega' }),
      SCALAR('observacion', { formKey: 'observacion', label: 'Observación', ai: true }),
      SCALAR('material_apoyo', { formKey: 'material_apoyo', label: 'Material de apoyo', ai: true }),
      SCALAR('nombre_vicerrector', { formKey: 'nombre_vicerrector', label: 'Vicerrector/a' }),
    ],
    arrays: [],
  },

  informe_tutor: {
    scalars: [
      SCALAR('año_lectivo', { formKey: 'año_lectivo', label: 'Año lectivo' }),
      SCALAR('nombre_docente', { formKey: 'docente', label: 'Tutor/a' }),
      SCALAR('trimestre', { formKey: 'trimestre', label: 'Trimestre' }),
      SCALAR('fecha', { formKey: 'fecha', label: 'Fecha' }),
      SCALAR('grado_curso', { formKey: 'grado_curso', label: 'Grado/Curso' }),
      SCALAR('paralelo', { formKey: 'paralelo', label: 'Paralelo' }),
      SCALAR('num_matriculados', { formKey: 'num_matriculados', label: 'N° matriculados' }),
      SCALAR('num_asisten', { formKey: 'num_asisten', label: 'N° que asisten' }),
      SCALAR('num_retirados', { formKey: 'num_retirados', label: 'N° retirados' }),
      SCALAR('motivos_desercion', { formKey: 'motivos_desercion', label: 'Motivos de deserción', ai: true }),
      SCALAR('convivencia_general', { formKey: 'convivencia_general', label: 'Convivencia general', ai: true }),
      SCALAR('normas_institucionales', { formKey: 'normas_institucionales', label: 'Normas institucionales', ai: true }),
      SCALAR('temas_jovenes_movimiento', { formKey: 'temas_trabajados', label: 'Temas Jóvenes en Movimiento', ai: true }),
      SCALAR('temas_sugeridos', { formKey: 'temas_sugeridos', label: 'Temas sugeridos', ai: true }),
      SCALAR('sugerencias_dece', { formKey: 'sugerencias_dece', label: 'Sugerencias DECE', ai: true }),
      SCALAR('sugerencias_inspeccion', { formKey: 'sugerencias_inspeccion', label: 'Sugerencias Inspección', ai: true }),
      SCALAR('sugerencias_vicerrectorado', { formKey: 'sugerencias_vicerrectorado', label: 'Sugerencias Vicerrectorado', ai: true }),
      SCALAR('sugerencias_rectorado', { formKey: 'sugerencias_rectorado', label: 'Sugerencias Rectorado', ai: true }),
      SCALAR('sugerencias_docentes', { formKey: 'sugerencias_docentes', label: 'Sugerencias docentes', ai: true }),
      SCALAR('nombre_rector', { formKey: 'nombre_rector', label: 'Rector/a' }),
    ],
    arrays: [
      ARRAY('asignaturas', [
        { key: 'asignatura', label: 'Asignatura' },
        { key: 'docente', label: 'Docente' },
        { key: 'num_riesgo', label: 'N° en riesgo' },
        { key: 'compromiso_docente', label: 'Compromisos docente', ai: true },
        { key: 'compromiso_estudiante', label: 'Compromisos estudiantes', ai: true },
        { key: 'reincidentes', label: 'Reincidentes', ai: true },
      ], { label: 'Asignaturas' }),
      ARRAY('seguimiento', [
        { key: 'estudiante', label: 'Estudiante' },
        { key: 'razon', label: 'Razón', ai: true },
      ], { label: 'Seguimiento tutorial' }),
      ARRAY('casos_vulnerabilidad', [
        { key: 'caso', label: 'Caso' },
        { key: 'descripcion', label: 'Descripción', ai: true },
      ], { label: 'Casos vulnerabilidad' }),
      ARRAY('problemas_padres', [
        { key: 'representante', label: 'Representante' },
        { key: 'dificultad', label: 'Dificultad', ai: true },
      ], { label: 'Problemas con padres' }),
    ],
  },

  microcurricular: {
    scalars: [
      SCALAR('figura_profesional', { formKey: 'figura_profesional', label: 'Figura profesional' }),
      SCALAR('nombre_docente', { formKey: 'docente', label: 'Docente' }),
      SCALAR('area', { formKey: 'area', label: 'Área' }),
      SCALAR('curso', { formKey: 'curso_modulo', label: 'Curso' }),
      SCALAR('año_lectivo', { formKey: 'año_lectivo', label: 'Año lectivo' }),
      SCALAR('numero_trimestre', { formKey: 'numero_trimestre', label: 'Trimestre N°' }),
      SCALAR('nombre_modulo', { formKey: 'nombre_modulo', label: 'Módulo formativo' }),
      SCALAR('num_horas', { formKey: 'num_horas', label: 'Horas pedagógicas' }),
      SCALAR('fecha_inicio', { formKey: 'fecha_inicio', label: 'Fecha inicio' }),
      SCALAR('fecha_fin', { formKey: 'fecha_fin', label: 'Fecha fin' }),
      SCALAR('objetivo_modulo', { formKey: 'objetivo_modulo', label: 'Objetivo módulo', ai: true }),
      SCALAR('nombre_unidad_trabajo', { formKey: 'nombre_unidad_trabajo', label: 'Unidad de trabajo' }),
      SCALAR('objetivo_unidad_trabajo', { formKey: 'objetivo_unidad_trabajo', label: 'Objetivo unidad', ai: true }),
      SCALAR('ejes_transversales', { formKey: 'ejes_transversales', label: 'Ejes transversales', ai: true }),
      SCALAR('observaciones_unidad', { formKey: 'observaciones_unidad', label: 'Observaciones', ai: true }),
      SCALAR('nombre_coordinador', { formKey: 'nombre_coordinador', label: 'Coordinador/a' }),
      SCALAR('nombre_dece', { formKey: 'nombre_dece', label: 'DECE' }),
      SCALAR('nombre_vicerrector', { formKey: 'nombre_vicerrector', label: 'Vicerrector/a' }),
    ],
    arrays: [
      ARRAY('semanas', [
        { key: 'semana_label', label: 'Semana' },
        { key: 'proc', label: 'Procedimentales', ai: true },
        { key: 'conc', label: 'Conceptuales', ai: true },
        { key: 'act', label: 'Actitudinales', ai: true },
        { key: 'actividades', label: 'Actividades', ai: true },
        { key: 'recursos', label: 'Recursos', ai: true },
        { key: 'criterios', label: 'Criterios', ai: true },
        { key: 'tecnicas', label: 'Técnicas', ai: true },
      ], { label: 'Desarrollo semanal' }),
      ARRAY('adaptaciones', [
        { key: 'iniciales', label: 'Iniciales' },
        { key: 'necesidad', label: 'Necesidad educativa', ai: true },
      ], { label: 'Adaptaciones NEE' }),
      ARRAY('estrategias', [
        { key: 'semana_label', label: 'Semana' },
        { key: 'competencia', label: 'Competencia', ai: true },
        { key: 'estrategia', label: 'Estrategia', ai: true },
      ], { label: 'Estrategias metodológicas' }),
    ],
  },
};

export function getSchema(type) {
  return FEA_SCHEMAS[type] ?? null;
}

/** Claves JSON esperadas para el prompt de IA */
export function getJsonSchemaDescription(type) {
  const schema = getSchema(type);
  if (!schema) return '';
  const lines = schema.scalars.map(s => `  "${s.key}": string${s.ai ? ' (desarrollar con IA si aplica)' : ''}`);
  for (const arr of schema.arrays) {
    const fields = arr.itemFields.map(f => `"${f.key}": string`).join(', ');
    lines.push(`  "${arr.key}": [{ ${fields} }, ...]`);
  }
  return lines.join(',\n');
}

/** Pre-llena escalares desde formulario (datos literales del docente) */
export function mergeFormIntoTemplateData(type, form, aiData = {}) {
  const schema = getSchema(type);
  if (!schema) return { ...aiData };

  const out = { ...aiData };

  for (const s of schema.scalars) {
    const formVal = form[s.formKey]?.trim() ?? '';
    const aiVal = typeof aiData[s.key] === 'string' ? aiData[s.key].trim() : '';
    if (s.ai) {
      out[s.key] = aiVal || formVal;
    } else {
      out[s.key] = formVal || aiVal;
    }
  }

  for (const arr of schema.arrays) {
    if (Array.isArray(aiData[arr.key]) && aiData[arr.key].length) {
      out[arr.key] = aiData[arr.key];
    } else if (!Array.isArray(out[arr.key])) {
      out[arr.key] = [];
    }
  }

  return out;
}

export function parseStoredReport(raw) {
  if (!raw?.trim()) return { format: 'markdown', text: '' };
  try {
    const p = JSON.parse(raw);
    if (p?.format === FEA_FORMAT_VERSION && p?.data) {
      return { format: FEA_FORMAT_VERSION, type: p.type, data: p.data };
    }
  } catch { /* markdown legacy */ }
  return { format: 'markdown', text: raw };
}

export function serializeFeAReport(type, data) {
  return JSON.stringify({ format: FEA_FORMAT_VERSION, type, data });
}

/** Datos dummy para validación de plantillas */
export function getDummyTemplateData(type) {
  const base = {
    contingencia: {
      fecha: '10 de junio de 2026', trimestre: 'II', asignatura: 'Matemáticas',
      nombre_docente: 'Lcda. María Pérez', grado_curso: '8vo EGB B',
      nombres_estudiantes: 'Juan Pérez', tema_clase: 'Fracciones',
      objetivo_clase: 'El estudiante resuelve operaciones con fracciones heterogéneas.',
      instrucciones: '1. Lee el material.\n2. Resuelve los ejercicios.',
      actividades: 'Completar hoja de trabajo y enviar fotos.',
      fecha_entrega: '20 de junio de 2026', observacion: 'Presentar al retorno.',
      material_apoyo: 'Texto MINEDUC págs. 45-52', nombre_vicerrector: 'Mgs. Ana Mora',
    },
    informe_tutor: {
      año_lectivo: '2025-2026', nombre_docente: 'Lcda. Pérez', trimestre: 'II',
      fecha: '10 de junio de 2026', grado_curso: '3° BT', paralelo: 'A',
      num_matriculados: '35', num_asisten: '32', num_retirados: '3',
      motivos_desercion: 'Cambio de domicilio', convivencia_general: 'Convivencia adecuada.',
      normas_institucionales: '90% cumple uniforme.', temas_jovenes_movimiento: 'Proyecto de vida.',
      temas_sugeridos: 'Orientación vocacional.', sugerencias_dece: 'Seguimiento casos.',
      sugerencias_inspeccion: 'Control asistencia.', sugerencias_vicerrectorado: 'Reunión área.',
      sugerencias_rectorado: 'Taller vocacional.', sugerencias_docentes: 'Recuperaciones.',
      nombre_rector: 'Mgs. Andrade',
      asignaturas: [{ asignatura: 'Matemáticas', docente: 'Lcdo. Torres', num_riesgo: '8',
        compromiso_docente: 'Refuerzo martes.', compromiso_estudiante: 'Asistir refuerzo.', reincidentes: 'Ninguno' }],
      seguimiento: [{ estudiante: 'Juan Pérez', razon: 'Ausentismo' }],
      casos_vulnerabilidad: [{ caso: 'Caso 1', descripcion: 'Seguimiento DECE' }],
      problemas_padres: [{ representante: 'Sr. Pérez', dificultad: 'No asiste citaciones' }],
      asignaturas_bloque: 'Asignatura: Matemáticas\nDocente: Lcdo. Torres',
      seguimiento_bloque: 'Juan Pérez — Ausentismo',
      casos_vulnerabilidad_bloque: 'Caso 1: Seguimiento DECE',
      problemas_padres_bloque: 'Sr. Pérez — No asiste citaciones',
    },
    microcurricular: {
      figura_profesional: 'BT Informática', nombre_docente: 'Ing. Gómez', area: 'Informática',
      curso: '3° BT A', año_lectivo: '2025-2026', numero_trimestre: '1',
      nombre_modulo: 'POO', num_horas: '96', fecha_inicio: '5 mayo 2026', fecha_fin: '31 julio 2026',
      objetivo_modulo: 'Desarrollar apps OOP.', nombre_unidad_trabajo: 'Unidad 1 — Clases',
      objetivo_unidad_trabajo: 'Crear clases básicas.', ejes_transversales: 'Trabajo colaborativo.',
      observaciones_unidad: 'Sin novedad.', nombre_coordinador: 'Coord. Área', nombre_dece: 'DECE', nombre_vicerrector: 'Vicerrector',
      semanas: [{ semana_label: 'Semana 1', proc: 'P1', conc: 'C1', act: 'A1', actividades: 'Act1', recursos: 'R1', criterios: 'Cr1', tecnicas: 'T1' }],
      adaptaciones: [{ iniciales: 'J.P.', necesidad: 'Tiempo extra' }],
      estrategias: [{ semana_label: 'Semana 1', competencia: 'Comp1', estrategia: 'Est1' }],
    },
  };
  return base[type] ?? {};
}

function formatAsignaturasBloque(arr) {
  if (!Array.isArray(arr) || !arr.length) return 'Sin novedad';
  return arr.map(a =>
    `Asignatura: ${a.asignatura || ''}\nDocente: ${a.docente || ''}\nEstudiantes en riesgo: ${a.num_riesgo || ''}\nCompromisos docente: ${a.compromiso_docente || ''}\nCompromisos estudiantes: ${a.compromiso_estudiante || ''}\nReincidentes: ${a.reincidentes || 'Ninguno'}`
  ).join('\n\n');
}

function formatSeguimientoBloque(arr) {
  if (!Array.isArray(arr) || !arr.length) return 'Sin novedad';
  return arr.map(s => `${s.estudiante || ''} — ${s.razon || ''}`).join('\n');
}

function formatCasosBloque(arr) {
  if (!Array.isArray(arr) || !arr.length) return 'No se reportan casos';
  return arr.map(c => `${c.caso || ''}: ${c.descripcion || ''}`).join('\n');
}

function formatProblemasPadresBloque(arr) {
  if (!Array.isArray(arr) || !arr.length) return 'Sin novedad';
  return arr.map(p => `${p.representante || ''} — ${p.dificultad || ''}`).join('\n');
}

/** Convierte arrays del JSON a tags de plantilla informe_tutor */
export function prepareTemplateData(type, data) {
  const d = { ...data };
  if (type === 'informe_tutor') {
    d.asignaturas_bloque = d.asignaturas_bloque || formatAsignaturasBloque(d.asignaturas);
    d.seguimiento_bloque = d.seguimiento_bloque || formatSeguimientoBloque(d.seguimiento);
    d.casos_vulnerabilidad_bloque = d.casos_vulnerabilidad_bloque || formatCasosBloque(d.casos_vulnerabilidad);
    d.problemas_padres_bloque = d.problemas_padres_bloque || formatProblemasPadresBloque(d.problemas_padres);
  }
  if (type === 'contingencia') {
    d.nombre_docente_firma = d.nombre_docente_firma || d.nombre_docente || '';
  }
  return d;
}

export function normalizeSemanas(data, numSemanas) {
  const n = Math.max(1, Math.min(12, parseInt(numSemanas, 10) || 1));
  let semanas = Array.isArray(data.semanas) ? [...data.semanas] : [];
  while (semanas.length < n) {
    semanas.push({
      semana_label: `Semana ${semanas.length + 1}`,
      proc: '', conc: '', act: '', actividades: '', recursos: '', criterios: '', tecnicas: '',
    });
  }
  semanas = semanas.slice(0, n);
  let estrategias = Array.isArray(data.estrategias) ? [...data.estrategias] : [];
  while (estrategias.length < n) {
    estrategias.push({ semana_label: `Semana ${estrategias.length + 1}`, competencia: '', estrategia: '' });
  }
  estrategias = estrategias.slice(0, n);
  return { ...data, semanas, estrategias };
}
