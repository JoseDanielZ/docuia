export const CONTEXT_HINTS = {
  dashboard: {
    message: '¡Hola! 👋 Soy Lucía. ¿Es tu primera vez aquí? Puedo ayudarte a crear tu primer documento en menos de 5 minutos.',
    cta: 'Muéstrame cómo',
    faqId: 'q_inicio_2',
    delay: 4000,
    showOnlyOnce: true
  },
  nuevo_reporte: {
    message: '📝 Para generar un buen documento, llena todos los campos aunque sea brevemente. Los campos vacíos quedan como "Sin novedad".',
    cta: '¿Qué documentos puedo generar?',
    faqId: 'q_doc_1',
    delay: 3000,
    showOnlyOnce: false
  },
  historial: {
    message: '📋 Aquí están todos tus documentos. Puedes editar cualquiera o descargarlo nuevamente cuando quieras.',
    cta: '¿Cómo edito un documento?',
    faqId: 'q_hist_2',
    delay: 2000,
    showOnlyOnce: true
  },
  informe_tutor: {
    message: '🧠 Para el Informe Tutor, recuerda ingresar los nombres de los estudiantes reincidentes uno por línea. La IA los organiza automáticamente.',
    cta: '¿Cómo ingreso los nombres?',
    faqId: 'q_form_2',
    delay: 3000,
    showOnlyOnce: false
  },
  contingencia: {
    message: '📋 El Plan de Contingencia debe tener instrucciones claras para que el estudiante pueda trabajar solo en casa. Sé específico en las actividades.',
    cta: '¿Qué es el Plan de Contingencia?',
    faqId: 'q_doc_3',
    delay: 3000,
    showOnlyOnce: false
  },
  microcurricular: {
    message: '📄 Para la Planificación Microcurricular, puedes describir el contenido semanal en texto libre. La IA construirá la tabla por ti.',
    cta: '¿Qué es la Planificación Microcurricular?',
    faqId: 'q_doc_4',
    delay: 3000,
    showOnlyOnce: false
  },
  plantillas: {
    message: '⭐ Las plantillas te ahorran tiempo. Guarda los datos de tu grado y paralelo una sola vez y úsalos en futuros documentos.',
    cta: '¿Cómo uso las plantillas?',
    faqId: 'q_plant_1',
    delay: 2000,
    showOnlyOnce: true
  }
};

export const IDLE_HINTS = [
  { message: '¿Necesitas ayuda? Estoy aquí para guiarte 😊', cta: 'Sí, ayúdame' },
  { message: '¿Tienes dudas sobre cómo llenar el formulario?', cta: 'Ver consejos' },
  { message: '¿No sabes qué documento generar? Te explico cada uno.', cta: 'Ver documentos' }
];
