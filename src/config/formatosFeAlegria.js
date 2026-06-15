/** Mapeo tipo de reporte Fe y Alegría → .docx oficial en /public/formatos/ */
export const FORMATOS_FE_ALEGRIA = {
  contingencia:    { path: '/formatos/plan-contingencia.docx',           label: 'Plan de Contingencia' },
  informe_tutor:   { path: '/formatos/informe-docente-tutor.docx',       label: 'Informe Docente Tutor/a' },
  microcurricular: { path: '/formatos/planificacion-microcurricular.docx', label: 'Planificación Microcurricular' },
};

export const FE_ALEGRIA_TYPE_IDS = Object.keys(FORMATOS_FE_ALEGRIA);

export function isFeAlegriaType(type) {
  return type in FORMATOS_FE_ALEGRIA;
}

export function getFormatoDocxPath(type) {
  return FORMATOS_FE_ALEGRIA[type]?.path ?? null;
}
