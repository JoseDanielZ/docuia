export const FAQ_CATEGORIES = [
  {
    id: 'inicio',
    label: '¿Por dónde empiezo?',
    icon: '🚀',
    questions: [
      {
        id: 'q_inicio_1',
        question: '¿Qué es DocuIA?',
        answer: 'DocuIA es tu asistente para generar documentos oficiales de Fe y Alegría con inteligencia artificial. En lugar de escribir desde cero, tú llenas un formulario y la IA genera el documento completo listo para entregar.'
      },
      {
        id: 'q_inicio_2',
        question: '¿Cómo genero mi primer documento?',
        answer: 'Es simple: 1) Haz clic en "Nuevo Reporte" en el menú. 2) Elige el tipo de documento que necesitas. 3) Llena el formulario con tus datos reales. 4) Haz clic en "Generar" y espera unos segundos. 5) Revisa, edita si necesitas, y descarga en Word.'
      },
      {
        id: 'q_inicio_3',
        question: '¿Necesito saber de tecnología para usar esto?',
        answer: 'No. Si sabes usar WhatsApp, puedes usar DocuIA. Solo llena formularios como si fuera papel, pero en la pantalla.'
      }
    ]
  },
  {
    id: 'documentos',
    label: 'Tipos de documentos',
    icon: '📄',
    questions: [
      {
        id: 'q_doc_1',
        question: '¿Qué documentos puedo generar?',
        answer: 'Actualmente puedes generar: 1) Informe Académico y Comportamental del Docente Tutor/a. 2) Plan de Contingencia para Estudiantes. 3) Planificación Microcurricular — Bachillerato Técnico. También puedes ver tu Reporte de Calificaciones y Asistencia.'
      },
      {
        id: 'q_doc_2',
        question: '¿Qué es el Informe Docente Tutor/a?',
        answer: 'Es el informe trimestral donde reportas el estado académico y comportamental de tu curso. Incluye datos de matrícula, asignaturas con estudiantes en riesgo, situaciones de convivencia, casos de vulnerabilidad y sugerencias a los diferentes estamentos.'
      },
      {
        id: 'q_doc_3',
        question: '¿Qué es el Plan de Contingencia?',
        answer: 'Es el plan de actividades para estudiantes que no pueden asistir normalmente a clases. Incluye el tema, objetivos, instrucciones claras para el estudiante, actividades y material de apoyo.'
      },
      {
        id: 'q_doc_4',
        question: '¿Qué es la Planificación Microcurricular?',
        answer: 'Es la planificación detallada por semanas de tu módulo en Bachillerato Técnico. Incluye contenidos procedimentales, conceptuales y actitudinales, recursos, criterios de evaluación, adaptaciones curriculares y estrategias metodológicas.'
      }
    ]
  },
  {
    id: 'formulario',
    label: 'Cómo llenar el formulario',
    icon: '✏️',
    questions: [
      {
        id: 'q_form_1',
        question: '¿Qué pasa si dejo un campo vacío?',
        answer: 'Si dejas un campo vacío, la IA escribirá "Sin novedad" o "No aplica" en esa sección del documento. Es mejor llenarlo aunque sea brevemente para que el documento refleje la realidad de tu curso.'
      },
      {
        id: 'q_form_2',
        question: '¿Cómo ingreso los nombres de estudiantes?',
        answer: 'Escribe un nombre por línea, así:\nJuan Pérez\nMaría López\nCarlos Torres\nNo uses comas ni puntos. Solo nombre y apellido en cada línea.'
      },
      {
        id: 'q_form_3',
        question: '¿Puedo generar el mismo documento varias veces?',
        answer: 'Sí. Puedes generar, revisar, y si no quedó bien, ajustar los datos del formulario y generar nuevamente. Cada generación queda guardada en tu historial.'
      },
      {
        id: 'q_form_4',
        question: '¿Cuántos estudiantes puedo ingresar máximo?',
        answer: 'Puedes ingresar hasta 40 estudiantes por documento. Si tienes más, divide en dos generaciones separadas.'
      }
    ]
  },
  {
    id: 'historial',
    label: 'Historial y edición',
    icon: '📋',
    questions: [
      {
        id: 'q_hist_1',
        question: '¿Dónde están mis documentos guardados?',
        answer: 'En el menú lateral, haz clic en "Historial". Ahí aparecen todos los documentos que has generado, ordenados del más reciente al más antiguo.'
      },
      {
        id: 'q_hist_2',
        question: '¿Puedo editar un documento después de generarlo?',
        answer: 'Sí. Abre el documento desde el historial y haz clic en el botón de edición. Puedes modificar el texto directamente. Los cambios quedan guardados automáticamente.'
      },
      {
        id: 'q_hist_3',
        question: '¿Puedo recuperar una versión anterior de un documento?',
        answer: 'Sí. En la vista del documento busca el botón "Ver versiones anteriores". Ahí puedes ver todos los cambios y restaurar cualquier versión previa.'
      },
      {
        id: 'q_hist_4',
        question: '¿Cómo busco un documento específico?',
        answer: 'En el historial puedes filtrar por tipo de documento, fecha o trimestre. Usa los filtros en la parte superior de la pantalla.'
      }
    ]
  },
  {
    id: 'descarga',
    label: 'Descargar documentos',
    icon: '⬇️',
    questions: [
      {
        id: 'q_desc_1',
        question: '¿En qué formato descargo los documentos?',
        answer: 'Los documentos se descargan en formato Word (.docx), el mismo que usan todos en la institución. Puedes abrirlo con Microsoft Word, Google Docs o LibreOffice.'
      },
      {
        id: 'q_desc_2',
        question: '¿El documento descargado tiene el formato oficial de Fe y Alegría?',
        answer: 'Sí. El documento usa exactamente el formato y estructura oficial de la institución, incluyendo el encabezado "Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa — Ser más para servir mejor".'
      },
      {
        id: 'q_desc_3',
        question: '¿Puedo imprimir directamente?',
        answer: 'Sí. Descarga el documento y ábrelo en Word o Google Docs. Desde ahí puedes imprimir normalmente con Ctrl+P.'
      }
    ]
  },
  {
    id: 'plantillas',
    label: 'Plantillas',
    icon: '⭐',
    questions: [
      {
        id: 'q_plant_1',
        question: '¿Qué son las plantillas?',
        answer: 'Las plantillas son formularios pre-llenados que tú guardas. Por ejemplo, si siempre trabajas con el mismo grado y paralelo, puedes guardar esos datos como plantilla y no tener que escribirlos cada vez.'
      },
      {
        id: 'q_plant_2',
        question: '¿Cómo guardo una plantilla?',
        answer: 'Después de llenar un formulario, antes de generar, busca el botón "Guardar como plantilla". Ponle un nombre y guárdala. La próxima vez aparecerá en tu lista de plantillas.'
      }
    ]
  },
  {
    id: 'problemas',
    label: 'Algo no funciona',
    icon: '🔧',
    questions: [
      {
        id: 'q_prob_1',
        question: 'El documento generado tiene errores o inventó información',
        answer: 'Revisa que llenaste todos los campos del formulario correctamente. La IA usa exactamente lo que tú escribes — si un dato falta, lo omite o pone "Sin novedad". Vuelve al formulario, corrige los datos y genera nuevamente.'
      },
      {
        id: 'q_prob_2',
        question: 'La generación tarda mucho o no termina',
        answer: 'Espera hasta 30 segundos — es normal para documentos largos como la Planificación Microcurricular. Si pasa de 1 minuto, recarga la página e intenta de nuevo. Si el problema persiste, avisa al coordinador.'
      },
      {
        id: 'q_prob_3',
        question: 'No puedo iniciar sesión',
        answer: 'Verifica que estás usando el correo y contraseña exactos que te asignaron. Si no recuerdas tu contraseña, usa el enlace "¿Olvidé mi contraseña?" en la pantalla de inicio. Si el problema continúa, contacta al administrador del sistema.'
      },
      {
        id: 'q_prob_4',
        question: 'El botón de descargar no funciona',
        answer: 'Verifica que tu navegador no esté bloqueando descargas. En Chrome, mira si aparece un aviso en la barra de dirección. Haz clic en "Permitir" y vuelve a intentar la descarga.'
      }
    ]
  }
];

export function searchFAQ(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const item of cat.questions) {
      if (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      ) {
        results.push({ ...item, categoryLabel: cat.label });
      }
    }
  }
  return results.slice(0, 5);
}
