// ═══════════════════════════════════════════════════════════════════════════════
// DocuIA — Configuración de Reportes v3
// Prompt institucional, campos por tipo y constructor de prompts.
// El SYSTEM_PROMPT es CONDICIONAL: si el docente subió un formato propio,
// el modelo recibe instrucciones distintas que dan prioridad absoluta a ese
// formato (no impone la estructura por defecto).
// ═══════════════════════════════════════════════════════════════════════════════

// ── Prompt por defecto (no hay formato del usuario) ─────────────────────────
const SYSTEM_PROMPT_DEFAULT = `Eres el motor de redacción institucional de DocuIA, una plataforma para docentes en Ecuador. Tu única función es generar reportes educativos completos, profesionales y listos para enviar a coordinación académica, rectorado o al DECE.

═══ FORMATO POR DEFECTO ═══

ESTRUCTURA:
  - Cada sección principal: ## N. TÍTULO EN MAYÚSCULAS (ej: ## 1. DATOS INFORMATIVOS)
  - Subsecciones: N.1, N.2, N.3 (ej: 1.1, 1.2)
  - Listas de ítems: numeración (1. 2. 3.), nunca guiones
  - Tablas cuando haya datos cuantitativos comparables
  - Cierre obligatorio: ## FIRMA con nombre, cargo, fecha y la nota de generación IA

EXTENSIÓN:
  - Mínimo 600 palabras por reporte
  - Cada sección debe tener al menos 2 párrafos de desarrollo
  - Los análisis no pueden ser de una sola oración

═══ TONO Y ESTILO ═══

  - Español ecuatoriano institucional: formal, directo, sin rodeos
  - Párrafos de máximo 4 líneas
  - Prohibido: "es importante destacar", "cabe mencionar", "es necesario señalar", "en este sentido", frases de relleno
  - Prohibido: adjetivos calificativos simples ("bueno", "malo", "regular") — siempre usar descripciones basadas en hechos observables
  - Las conclusiones deben ser descriptivas: qué hizo el estudiante, qué logró, qué le falta

═══ MANEJO DE DATOS ═══

  - Usa ÚNICAMENTE los datos proporcionados por el docente
  - NUNCA inventes nombres de estudiantes, fechas, calificaciones ni porcentajes que no fueron dados
  - Si un dato no fue proporcionado, omite esa subsección — no la llenes con genéricos
  - Cuando haya datos numéricos: calcula porcentajes, promedios, comparaciones y tendencias
  - Si el docente menciona cifras parciales, haz las operaciones: ej. "22 de 32 aprobados" → calcula 68.75%

═══ RECOMENDACIONES ═══

  - Toda sección de recomendaciones: mínimo 3 puntos
  - Cada recomendación debe ser ACCIONABLE: incluir qué hacer, quién lo hace, y cuándo
  - Ejemplo correcto: "El docente programará 2 sesiones de refuerzo (martes y jueves) para los 8 estudiantes que no alcanzaron el 7.0 en el parcial, durante las dos semanas previas al examen quimestral."
  - Ejemplo incorrecto: "Se recomienda mejorar el rendimiento académico."

═══ CONTEXTO INSTITUCIONAL ═══

  - La escala de calificaciones es sobre 10: Sobresaliente (9-10), Muy Buena (8-8.99), Buena (7-7.99), Regular (5-6.99), Insuficiente (<5)
  - El aprobado es 7/10
  - El currículo nacional del Ecuador organiza los aprendizajes en Destrezas con Criterio de Desempeño (DCD) codificadas
  - Los períodos académicos se dividen en quimestres, parciales y semanas
  - El DECE (Departamento de Consejería Estudiantil) maneja casos según los Protocolos de Actuación del MINEDUC
  - Las planificaciones usan el formato PUD (Planificación de Unidad Didáctica) del MINEDUC`;

// ── Prompt cuando el docente subió SU formato (modo estricto) ───────────────
const SYSTEM_PROMPT_CON_FORMATO = `Eres el motor de redacción institucional de DocuIA, una plataforma para docentes en Ecuador. Tu trabajo es replicar EXACTAMENTE el formato institucional que el docente ha subido, llenándolo con los datos que él proporciona.

═══ REGLA #1 — EL FORMATO DEL DOCENTE MANDA ═══

  - El docente proporciona un FORMATO INSTITUCIONAL DE REFERENCIA al final de este mensaje.
  - Tu trabajo NO es generar un reporte con tu estructura por defecto. Tu trabajo es REPLICAR el formato del docente.
  - Conserva EXACTAMENTE: títulos, subtítulos, numeración, orden de secciones, encabezados y campos del formato del docente.
  - Si el formato tiene tablas o listas, mantén ese mismo tipo de estructura.
  - Si el formato tiene un encabezado institucional, escríbelo IGUAL (mismas palabras, mismo orden).
  - NO añadas secciones que no estén en el formato del docente.
  - NO omitas secciones que sí estén en el formato del docente.

═══ REGLA #2 — RELLENA CON LOS DATOS DEL DOCENTE ═══

  - Para cada campo del formato, busca el dato correspondiente entre los datos que proporcionó el docente.
  - Si un dato existe → escríbelo en el lugar correcto del formato.
  - Si un dato NO existe → escribe "(Sin información proporcionada)" en ese campo. NO inventes datos.
  - Cuando el formato pida análisis o redacción libre, usa los datos del docente para generar 2-4 párrafos profesionales basados estrictamente en hechos.

═══ REGLA #3 — TONO Y ESTILO ═══

  - Español ecuatoriano institucional: formal, directo, sin rodeos.
  - Prohibido: "es importante destacar", "cabe mencionar", "en este sentido", frases de relleno.
  - Prohibido: adjetivos calificativos simples ("bueno", "malo", "regular") — usa descripciones basadas en hechos observables.
  - Cuando hay números: calcula porcentajes, promedios, comparaciones (ej. "22 de 32 aprobados" → 68.75%).

═══ REGLA #4 — NO INVENCIÓN ═══

  - NUNCA inventes nombres, fechas, calificaciones, porcentajes, instituciones ni datos no proporcionados.
  - Si el formato pide algo que el docente no aportó, marca explícitamente "(Sin información proporcionada)".

═══ CONTEXTO ECUATORIANO (úsalo sólo si el formato lo pide) ═══

  - Escala de calificaciones sobre 10: Sobresaliente (9-10), Muy Buena (8-8.99), Buena (7-7.99), Regular (5-6.99), Insuficiente (<5). El aprobado es 7/10.
  - Currículo nacional: Destrezas con Criterio de Desempeño (DCD) con códigos oficiales.
  - DECE: maneja casos según Protocolos de Actuación del MINEDUC.
  - Planificaciones: formato PUD (Planificación de Unidad Didáctica) del MINEDUC.`;

/**
 * Devuelve el SYSTEM_PROMPT correcto según haya formato institucional o no.
 * @param {Object} opts
 * @param {boolean} [opts.hasFormato=false] - true si el docente subió un formato propio.
 */
export function getSystemPrompt({ hasFormato = false } = {}) {
  return hasFormato ? SYSTEM_PROMPT_CON_FORMATO : SYSTEM_PROMPT_DEFAULT;
}

// Backwards compat: re-exporta el default para llamadas existentes
export const SYSTEM_PROMPT = SYSTEM_PROMPT_DEFAULT;


// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE REPORTE
// ═══════════════════════════════════════════════════════════════════════════════

export const REPORT_TYPES = [
  {
    id: "semanal",
    label: "Informe Semanal",
    icon: "SE",
    desc: "Progreso semanal: logros, desafíos y plan de acción",
    structure: "Pasado (resultados) → Presente (desafíos) → Futuro (plan)",
  },
  {
    id: "calificaciones",
    label: "Reporte de Calificaciones",
    icon: "CA",
    desc: "Rendimiento cuantitativo + evaluación cualitativa + hoja de ruta",
    structure: "Notas → Análisis → Estrategias de refuerzo",
  },
  {
    id: "asistencia",
    label: "Registro de Asistencia",
    icon: "AS",
    desc: "Asistencia, tardanzas, patrones y prevención de deserción",
    structure: "Datos → Patrones → Acciones → Prevención",
  },
  {
    id: "dece",
    label: "Informe DECE",
    icon: "DE",
    desc: "Consejería estudiantil, intervención y actas de compromiso",
    structure: "Contexto → Intervención → Acuerdos → Seguimiento",
  },
  {
    id: "planificacion",
    label: "Planificación (PUD)",
    icon: "PL",
    desc: "Unidad didáctica con destrezas, metodología y adaptaciones NEE",
    structure: "Objetivos → Destrezas → Metodología → Evaluación → NEE",
  },
];


// ═══════════════════════════════════════════════════════════════════════════════
// CAMPOS DEL FORMULARIO POR TIPO
// ═══════════════════════════════════════════════════════════════════════════════

export const FORM_FIELDS = {

  // ── Datos comunes a todos los reportes ─────────────────────────────────────
  common: [
    { k: "docente",     label: "Nombre completo del docente",  ph: "Ej: Lcda. María Elena Pérez Torres",                req: true },
    { k: "email",       label: "Correo institucional",          ph: "m.perez@feyalegria.edu.ec" },
    { k: "institucion", label: "Nombre de la institución",      ph: "Ej: Unidad Educativa Fe y Alegría La Dolorosa" },
    { k: "cargo",       label: "Cargo / función",               ph: "Ej: Docente de Matemáticas — Básica Superior" },
  ],

  common2: [
    { k: "curso",          label: "Curso / paralelo",      ph: "Ej: 8vo EGB — Paralelo B",                    req: true,  half: true },
    { k: "periodo",        label: "Período evaluado",       ph: "Ej: Semana del 7 al 11 de abril de 2026",    req: true,  half: true },
    { k: "numEstudiantes", label: "Total de estudiantes",   ph: "Ej: 32",                                     half: true },
    { k: "jornadaTurno",   label: "Jornada / turno",        ph: "Ej: Matutina",                                half: true },
  ],


  // ── 1. INFORME SEMANAL ─────────────────────────────────────────────────────
  // Estructura: PASADO (resultados) → PRESENTE (desafíos) → FUTURO (plan)
  semanal: [
    // Grupo: Contexto académico
    { k: "_g1", group: "Contexto académico" },
    { k: "asignatura",   label: "Asignatura",              ph: "Ej: Matemáticas",                                                      half: true },
    { k: "tema",         label: "Tema / contenido desarrollado", ph: "Ej: Operaciones con fracciones heterogéneas — suma y resta con diferente denominador", half: true },
    { k: "objetivo",     label: "Objetivo de aprendizaje de la semana",
      ph: "Ej: Los estudiantes resuelven problemas de suma y resta de fracciones heterogéneas aplicando el mínimo común múltiplo",
      area: true, hint: "Copie el objetivo del PUD o redáctelo en términos de lo que el estudiante debería lograr al final de la semana" },

    // Grupo: Resultados (pasado)
    { k: "_g2", group: "Resultados de la semana (pasado)" },
    { k: "tareasCompletadas", label: "Actividades y tareas completadas",
      ph: "Ej: Explicación teórica con 5 ejemplos, ejercicios guiados en parejas (hoja de trabajo págs. 45-48), evaluación formativa de 10 preguntas, retroalimentación grupal",
      area: true, hint: "Detalle cronológicamente las actividades realizadas durante la semana" },
    { k: "hitosLogrados", label: "Logros alcanzados (datos concretos)",
      ph: "Ej: El 78% aprobó la evaluación formativa (25 de 32). 5 estudiantes mejoraron su nota respecto a la semana anterior. El grupo completó los ejercicios del texto págs. 45-52",
      area: true, hint: "Use datos medibles: porcentajes, cantidades, comparaciones con períodos anteriores" },
    { k: "asistenciaSemanal", label: "Resumen de asistencia de la semana",
      ph: "Ej: 29 presentes promedio, 3 ausentes (2 justificados, 1 sin justificación), 2 tardanzas recurrentes (Pedro S. y Luisa V.)" },

    // Grupo: Desafíos (presente)
    { k: "_g3", group: "Desafíos y obstáculos (presente)" },
    { k: "dificultades", label: "Dificultades y obstáculos observados",
      ph: "Ej: 8 estudiantes no dominan tablas de multiplicar, lo que impide calcular el MCM correctamente. 3 no entregaron la tarea del miércoles. El proyector falló el jueves",
      area: true, hint: "Describa las dificultades observadas, tanto académicas como logísticas o conductuales" },
    { k: "impacto", label: "Impacto de las dificultades en el aprendizaje",
      ph: "Ej: Los 8 estudiantes con dificultad en tablas obtuvieron promedios bajo 6 en la evaluación. Se retrasa el avance a multiplicación de fracciones previsto para esta semana",
      area: true, hint: "Explique cómo las dificultades afectaron los resultados o el cronograma" },

    // Grupo: Plan (futuro)
    { k: "_g4", group: "Plan para la próxima semana (futuro)" },
    { k: "planSiguiente", label: "Prioridades y contenidos de la próxima semana",
      ph: "Ej: Lunes y miércoles: refuerzo de tablas de multiplicar con material concreto. Jueves: introducción a multiplicación de fracciones. Viernes: ejercicios guiados",
      area: true, hint: "Detalle día por día o por bloques qué planifica hacer" },
    { k: "compromisos", label: "Compromisos y recursos necesarios",
      ph: "Ej: Coordinar con DECE caso de Carlos R. antes del martes. Solicitar 35 copias de hoja de trabajo a coordinación. Comunicar a padres de los 3 estudiantes sin tarea",
      area: true },
    { k: "observaciones", label: "Observaciones adicionales",
      ph: "Ej: Se detectó caso de posible bullying entre dos estudiantes que será derivado al DECE el lunes. El grupo muestra mejor disposición al trabajo en equipo que la semana anterior",
      area: true },
  ],


  // ── 2. REPORTE DE CALIFICACIONES ──────────────────────────────────────────
  // Estructura: DATOS → ANÁLISIS CUANTITATIVO → ANÁLISIS CUALITATIVO → ESTRATEGIAS
  calificaciones: [
    // Grupo: Información de la evaluación
    { k: "_g1", group: "Información de la evaluación" },
    { k: "asignatura",      label: "Asignatura evaluada",       ph: "Ej: Ciencias Naturales",                                       half: true },
    { k: "tipoEvaluacion",  label: "Tipo de evaluación",        ph: "Ej: Prueba escrita — Primer parcial del 2do quimestre",        half: true },
    { k: "fechaEvaluacion", label: "Fecha de aplicación",       ph: "Ej: 9 de abril de 2026",                                       half: true },
    { k: "destrezas",       label: "Destrezas con criterio de desempeño evaluadas (código DCD)",
      ph: "Ej: CN.4.1.5. Indagar y explicar las propiedades de la materia y relacionarlas con cambios físicos y químicos\nCN.4.1.6. Clasificar la materia según sus propiedades",
      area: true, hint: "Incluya el código del currículo nacional. Si no lo tiene, describa la destreza" },

    // Grupo: Resultados cuantitativos
    { k: "_g2", group: "Resultados cuantitativos" },
    { k: "promedioGeneral",      label: "Promedio general del curso",                          ph: "Ej: 7.2 / 10",                  half: true },
    { k: "notaMasAlta",          label: "Nota más alta obtenida",                              ph: "Ej: 9.8 / 10",                  half: true },
    { k: "notaMasBaja",          label: "Nota más baja obtenida",                              ph: "Ej: 3.5 / 10",                  half: true },
    { k: "estudiantesAprobados", label: "Estudiantes que alcanzan aprendizajes (≥7)",          ph: "Ej: 22 de 32 — 68.7%",          half: true },
    { k: "estudiantesRiesgo",    label: "Estudiantes que NO alcanzan aprendizajes (<7)",
      ph: "Ej: 10 de 32 — 31.3% | 5 entre 5-6.9 | 3 entre 4-4.9 | 2 bajo 4",
      hint: "Desglose por rango para identificar niveles de riesgo" },
    { k: "distribucionNotas",    label: "Distribución de calificaciones por rango",
      ph: "Ej: Sobresaliente 9-10: 5 | Muy buena 8-8.99: 8 | Buena 7-7.99: 9 | Regular 5-6.99: 7 | Insuficiente <5: 3",
      area: true, hint: "Use la escala del MINEDUC: Sobresaliente, Muy Buena, Buena, Regular, Insuficiente" },

    // Grupo: Análisis cualitativo
    { k: "_g3", group: "Análisis cualitativo (basado en hechos observables)" },
    { k: "avancesObservados", label: "Avances y logros observados",
      ph: "Ej: Los estudiantes identifican correctamente cambios físicos (92% de acierto en pregunta 2). El grupo mejoró 0.8 puntos respecto al parcial anterior",
      area: true, hint: "Describa logros concretos basados en evidencia, no opiniones. Evite 'los estudiantes son buenos'" },
    { k: "dificultadesCalif", label: "Dificultades identificadas",
      ph: "Ej: Confusión entre cambios químicos y físicos (68% de error en pregunta 4). Los 10 estudiantes en riesgo coinciden con alta inasistencia (promedio 4 faltas)",
      area: true, hint: "Relacione las dificultades con causas observables: inasistencia, falta de materiales, prerrequisitos no alcanzados" },
    { k: "evaluacionCualitativa", label: "Evaluación del proceso y actitud del grupo",
      ph: "Ej: El grupo mostró disposición al trabajo grupal. Los estudiantes en riesgo evidencian desmotivación y falta de materiales. 4 estudiantes no se presentaron al examen",
      area: true, hint: "Describa actitudes, hábitos de estudio, participación — sin adjetivos simples como 'bueno' o 'malo'" },

    // Grupo: Estrategias
    { k: "_g4", group: "Estrategias de refuerzo y recomendaciones" },
    { k: "estrategiasRefuerzo", label: "Estrategias de refuerzo académico propuestas",
      ph: "Ej: Clases de refuerzo martes y jueves 13:00-13:40 para los 10 estudiantes en riesgo. Material visual sobre cambios químicos. Evaluación recuperatoria el 25 de abril",
      area: true, hint: "Incluya: qué hacer, para quién, cuándo y con qué recursos" },
    { k: "recomendacionesFamilia", label: "Recomendaciones para las familias",
      ph: "Ej: Establecer rutina de estudio de 30 min diarios. Revisar el cuaderno de Ciencias cada noche. Comunicarse con el docente si el estudiante presenta dificultades antes del 20 de abril",
      area: true, hint: "Orientaciones prácticas que la familia puede implementar en casa" },
  ],


  // ── 3. REGISTRO DE ASISTENCIA ─────────────────────────────────────────────
  // Estructura: DATOS → PATRONES → CAUSAS → ACCIONES → PREVENCIÓN
  asistencia: [
    // Grupo: Datos cuantitativos
    { k: "_g1", group: "Datos cuantitativos del período" },
    { k: "diasHabiles",          label: "Total días hábiles del período",      ph: "Ej: 5 días (lunes 7 a viernes 11 de abril)",                half: true },
    { k: "totalPresentes",       label: "Total estudiantes presentes",         ph: "Ej: 28 promedio diario",                                    half: true },
    { k: "totalAusentes",        label: "Total ausentes",                      ph: "Ej: 4 promedio diario",                                     half: true },
    { k: "porcentajeAsistencia", label: "Porcentaje de asistencia del período", ph: "Ej: 87.5% (28 de 32)",                                    half: true },

    // Grupo: Detalle de inasistencias
    { k: "_g2", group: "Detalle de inasistencias" },
    { k: "ausentesJustificados", label: "Ausentes justificados (nombre, fecha, motivo)",
      ph: "Ej: Juan P. — 8/abr — certificado médico (gripe)\nMaría L. — 9 y 10/abr — calamidad doméstica (fallecimiento de familiar)",
      area: true, hint: "Incluya nombre, fecha(s) y tipo de justificación presentada" },
    { k: "ausentesInjustificados", label: "Ausentes sin justificación (nombre, fecha, frecuencia)",
      ph: "Ej: Carlos R. — 7, 8, 9, 10 y 11/abr — 5ta semana consecutiva con faltas\nAndrea M. — 7 y 11/abr — 2da semana con 2 faltas",
      area: true, hint: "Destaque la acumulación: ¿cuántas faltas lleva en el mes/quimestre?" },
    { k: "tardanzas", label: "Tardanzas registradas (nombre, hora, frecuencia)",
      ph: "Ej: Pedro S. — llegó 7:20 los 5 días (tardanza crónica)\nLuisa V. — llegó 7:25 el lunes y martes",
      area: true },

    // Grupo: Análisis
    { k: "_g3", group: "Análisis de patrones" },
    { k: "patronesAusentismo", label: "Patrones de ausentismo identificados",
      ph: "Ej: Carlos R. falta siempre los lunes (posible trabajo informal). Los lunes el ausentismo promedia 4 estudiantes vs 1.5 el resto de la semana. Las tardanzas se concentran en los estudiantes que toman bus escolar de la ruta norte",
      area: true, hint: "Busque tendencias: ¿hay días con más faltas? ¿hay estudiantes reincidentes? ¿hay correlación con rendimiento?" },
    { k: "causasIdentificadas", label: "Causas identificadas o sospechadas",
      ph: "Ej: Carlos R. trabaja informalmente los lunes según comentarios de compañeros. Andrea M. cuida a un hermano menor porque la madre trabaja turno completo. Las tardanzas de la ruta norte se deben a un cambio de horario del bus",
      area: true, hint: "Distinga entre causas confirmadas (evidencia) y sospechadas (indicios)" },

    // Grupo: Acciones
    { k: "_g4", group: "Acciones realizadas y pendientes" },
    { k: "accionesRealizadas", label: "Acciones ya realizadas (cronología)",
      ph: "Ej: 8/abr: llamada al representante de Carlos R. (sin respuesta). 9/abr: notificación escrita enviada a Andrea M. 10/abr: conversación con Pedro S. sobre tardanzas",
      area: true },
    { k: "accionesPendientes", label: "Acciones pendientes con responsable y fecha",
      ph: "Ej: Derivar caso de Carlos R. al DECE el lunes 14/abr (responsable: docente tutor). Reunión con padres de los 3 estudiantes con mayor ausentismo antes del 20/abr (responsable: coordinación). Solicitar informe de ruta del bus a inspección general",
      area: true, hint: "Cada acción debe tener: qué, quién y cuándo" },
  ],


  // ── 4. INFORME DECE ───────────────────────────────────────────────────────
  // Estructura: CONTEXTO → INTERVENCIÓN → ACUERDOS → SEGUIMIENTO
  dece: [
    // Grupo: Identificación
    { k: "_g1", group: "Identificación del caso" },
    { k: "tipoIntervencion", label: "Tipo de intervención DECE",
      ph: "Ej: Seguimiento de caso / Atención individual / Intervención en crisis / Derivación externa / Mediación de conflictos" },
    { k: "motivoDerivacion", label: "Motivo de derivación o seguimiento",
      ph: "Ej: Bajo rendimiento académico repentino en las últimas 3 semanas (promedio bajó de 8.5 a 5.1) y cambio conductual reportado por 3 docentes (aislamiento, irritabilidad, llanto en clase)",
      area: true, hint: "Describa la situación de forma objetiva: qué se observó, quién lo reportó, desde cuándo" },

    // Grupo: Antecedentes
    { k: "_g2", group: "Antecedentes e historial" },
    { k: "antecedentes", label: "Antecedentes relevantes del caso",
      ph: "Ej: Estudiante de 14 años, sin historial previo de dificultades académicas ni conductuales. Promedio anterior: 8.5. Promedio actual: 5.1. Los padres se separaron hace 2 meses. Vive con la madre y 2 hermanos menores. La madre trabaja turno completo",
      area: true, hint: "Incluya: trayectoria académica, contexto familiar relevante, historial de intervenciones previas" },
    { k: "accionesPrevias", label: "Acciones previas realizadas por el docente ANTES de derivar al DECE",
      ph: "Ej: 1/abr: conversación informal con el estudiante durante recreo (refirió estar 'bien'). 3/abr: revisión del cuaderno (tareas incompletas desde hace 2 semanas). 5/abr: llamada a la madre (no contestó). 6/abr: email a la madre (sin respuesta)",
      area: true, hint: "Documente todo lo que el docente hizo antes de derivar — esto es obligatorio en los protocolos del MINEDUC" },

    // Grupo: Intervención
    { k: "_g3", group: "Intervención realizada" },
    { k: "intervencion", label: "Cronología detallada de la intervención",
      ph: "Ej: 7/abr 10:00: entrevista individual con estudiante (45 min) — se aplicó cuestionario de bienestar emocional\n8/abr 14:00: entrevista con representante (madre) — duración 30 min\n9/abr 11:00: reunión con tutora de curso y 2 docentes para coordinar apoyo académico",
      area: true, hint: "Incluya fecha, hora, duración, participantes y herramientas aplicadas" },
    { k: "hallazgos", label: "Hallazgos y análisis profesional",
      ph: "Ej: El estudiante refiere tristeza persistente y falta de concentración desde la separación de sus padres. Expresa preocupación por la situación económica familiar. La madre confirma cambios de comportamiento en casa (no come, duerme poco). No se evidencian indicadores de riesgo de autolesión. El cuestionario de bienestar arroja puntaje 12/30 (rango de atención)",
      area: true, hint: "Describa objetivamente sin emitir diagnósticos no validados. Use los resultados de instrumentos si los aplicó" },

    // Grupo: Acuerdos
    { k: "_g4", group: "Acuerdos y compromisos" },
    { k: "acuerdos", label: "Acuerdos por actor (quién, qué, cuándo)",
      ph: "Ej: Madre: acompañamiento diario en tareas (verificación de cuaderno cada noche). Compromiso de asistir a reunión quincenal con DECE\nDocentes: apoyo pedagógico diferenciado (plazos extendidos en entregas por 2 semanas). Informe semanal de rendimiento al DECE\nEstudiante: asistir al grupo de apoyo emocional los miércoles a las 11:00\nDECE: seguimiento quincenal. Próxima cita: 21 de abril",
      area: true, hint: "Sea específico: quién se compromete a qué y para cuándo. Esto se convierte en el acta de compromiso" },
    { k: "actaCompromiso", label: "Acta de compromiso firmada",
      ph: "Ej: Sí — firmada por la madre y el estudiante el 8/abr. Copia archivada en expediente del DECE. Copia entregada a coordinación académica y a la madre" },
    { k: "derivacionExterna", label: "Derivación externa (si aplica)",
      ph: "Ej: Se recomienda valoración psicológica externa con profesional especializado en duelo adolescente. Se entregó a la familia listado de 3 profesionales con tarifa social. No se requiere derivación a salud pública / DINAPEN / Fiscalía",
      area: true },

    // Grupo: Seguimiento
    { k: "_g5", group: "Plan de seguimiento" },
    { k: "planSeguimiento", label: "Próximas acciones de seguimiento (fechas concretas)",
      ph: "Ej: 21/abr: segunda entrevista con estudiante y revisión de cuestionario de bienestar\n30/abr: revisión de rendimiento académico con docentes\n5/may: reunión de seguimiento con la madre\nIndicador de mejora esperado: promedio sube a ≥6.5 y asistencia regular",
      area: true, hint: "Incluya fechas, responsables e indicadores medibles de mejora" },
    { k: "confidencialidad", label: "Nota de confidencialidad y protocolo aplicado",
      ph: "Ej: Caso manejado según Protocolo de Actuación frente a Situaciones de Vulneración de Derechos del MINEDUC (2023). Información clasificada como RESERVADA. Acceso restringido a: profesional DECE, coordinadora académica y tutora de curso. No se comparte con otros docentes ni estudiantes",
      area: true },
  ],


  // ── 5. PLANIFICACIÓN (PUD) ────────────────────────────────────────────────
  // Estructura: OBJETIVOS → DESTREZAS → METODOLOGÍA → EVALUACIÓN → NEE
  planificacion: [
    // Grupo: Datos de la unidad
    { k: "_g1", group: "Datos de la unidad didáctica" },
    { k: "asignatura",  label: "Asignatura / área de conocimiento", ph: "Ej: Matemáticas — Álgebra y Funciones",               half: true },
    { k: "unidad",      label: "Número y título de la unidad",      ph: "Ej: Unidad 3 — Operaciones con números racionales",    half: true },
    { k: "duracion",    label: "Duración total (semanas y períodos)", ph: "Ej: 6 semanas — 30 períodos de 40 minutos cada uno" },

    // Grupo: Objetivos y destrezas
    { k: "_g2", group: "Objetivos y destrezas (qué van a aprender)" },
    { k: "objetivos", label: "Objetivos de aprendizaje (con código del currículo)",
      ph: "Ej: O.M.4.2. Utilizar patrones numéricos para resolver problemas de la vida cotidiana aplicando operaciones con fracciones y decimales\nO.M.4.3. Resolver problemas cotidianos que requieran cálculo de porcentajes",
      area: true, hint: "Use los códigos oficiales del currículo nacional del MINEDUC" },
    { k: "destrezas", label: "Destrezas con criterio de desempeño (DCD) a desarrollar",
      ph: "Ej: M.4.1.14. Resolver operaciones combinadas con fracciones, decimales y enteros aplicando el orden de operaciones\nM.4.1.15. Calcular porcentajes en contextos comerciales y estadísticos\nM.4.1.16. Representar fracciones en la recta numérica",
      area: true, hint: "Liste cada DCD con su código. Estas destrezas son las que se evaluarán al final de la unidad" },
    { k: "ejeTransversal", label: "Eje transversal y cómo se integra",
      ph: "Ej: Educación para la interculturalidad — Los problemas de aplicación usarán contextos de comercio justo y economía solidaria de comunidades ecuatorianas",
      area: true },

    // Grupo: Metodología
    { k: "_g3", group: "Metodología (cómo van a aprender)" },
    { k: "metodologia", label: "Estrategias metodológicas",
      ph: "Ej: Aprendizaje basado en problemas reales (ABP) con situaciones de compra-venta del barrio. Trabajo colaborativo en grupos de 4 con roles asignados. Clase invertida con 3 videos cortos (canal YouTube institucional). Uso de material concreto (regletas de Cuisenaire) para visualización",
      area: true, hint: "Describa cómo va a enseñar, no solo qué va a enseñar" },
    { k: "cronograma", label: "Distribución semanal de contenidos",
      ph: "Ej: Sem 1: fracciones equivalentes y simplificación\nSem 2: suma y resta de fracciones con mismo denominador\nSem 3: suma y resta con diferente denominador (MCM)\nSem 4: multiplicación de fracciones\nSem 5: división de fracciones y porcentajes\nSem 6: repaso, evaluación sumativa y retroalimentación",
      area: true, hint: "Detalle semana por semana para que la planificación sea ejecutable" },
    { k: "recursos", label: "Recursos y materiales necesarios",
      ph: "Ej: Texto del MINEDUC págs. 45-72. Calculadora científica. Software GeoGebra (laboratorio). Regletas de Cuisenaire (30 juegos). Hojas de trabajo diseñadas por el docente (6 sets). Proyector para videos" },

    // Grupo: Evaluación
    { k: "_g4", group: "Evaluación (cómo se va a medir)" },
    { k: "evaluacion", label: "Instrumentos y criterios de evaluación por momento",
      ph: "Ej: Diagnóstica (Sem 1): prueba escrita de prerrequisitos — 10 preguntas\nFormativa (Sem 2-5): rúbrica de trabajo grupal + portafolio de ejercicios resueltos\nSumativa (Sem 6): prueba escrita — 20 preguntas (60%) + proyecto grupal de aplicación (40%)",
      area: true, hint: "Incluya evaluación diagnóstica (inicio), formativa (proceso) y sumativa (cierre)" },
    { k: "indicadores", label: "Indicadores de logro esperados",
      ph: "Ej: El estudiante resuelve correctamente el 80% de operaciones combinadas con fracciones. El estudiante aplica porcentajes en al menos 2 contextos de la vida real. El estudiante justifica sus procedimientos oralmente",
      area: true, hint: "Indicadores medibles que permitan verificar si la destreza fue alcanzada" },

    // Grupo: NEE
    { k: "_g5", group: "Adaptaciones curriculares (NEE)" },
    { k: "adaptacionesNEE", label: "Adaptaciones para estudiantes con Necesidades Educativas Específicas",
      ph: "Ej: 2 estudiantes con TDAH (Grado 2):\n— Instrucciones fragmentadas en pasos cortos\n— Tiempo adicional del 25% en evaluaciones\n— Ubicación preferencial (primera fila, cerca del docente)\n— Uso de temporizador visual para actividades\n\n1 estudiante con discalculia (Grado 3):\n— Uso permanente de calculadora\n— Material concreto en evaluaciones\n— Evaluación oral complementaria\n— Adaptación de la prueba sumativa: 12 preguntas en vez de 20",
      area: true, hint: "Detalle los ajustes por cada estudiante: grado de adaptación, tipo de NEE y estrategias específicas" },

    // Grupo: Cierre
    { k: "_g6", group: "Observaciones finales" },
    { k: "observaciones", label: "Observaciones, coordinaciones y bibliografía",
      ph: "Ej: Esta planificación se alinea con el PCI institucional 2025-2026 y fue socializada en la junta de área del 4 de abril. Se coordinará con el área de Ciencias Naturales para proyecto interdisciplinario sobre porcentajes en contexto ambiental. Bibliografía: Texto del MINEDUC 8vo EGB, Estándares de Aprendizaje 2016",
      area: true },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════════
// CAMPOS REQUERIDOS POR TIPO DE REPORTE
// ═══════════════════════════════════════════════════════════════════════════════

export function getRequiredFields(type) {
  const common = ["docente", "curso", "periodo"];
  const byType = {
    semanal:        ["asignatura", "tema", "tareasCompletadas"],
    calificaciones: ["asignatura", "tipoEvaluacion", "promedioGeneral"],
    asistencia:     ["totalPresentes", "totalAusentes"],
    dece:           ["tipoIntervencion", "motivoDerivacion", "intervencion"],
    planificacion:  ["asignatura", "unidad", "objetivos", "destrezas"],
  };
  return [...common, ...(byType[type] || [])];
}


// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR DE PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Construye el prompt para el LLM.
 *
 * @param {string} type        - id del tipo de reporte (semanal, calificaciones, ...)
 * @param {Object} data        - datos ingresados por el docente
 * @param {Object} [opts={}]
 * @param {string} [opts.formatoTexto] - Texto del formato institucional subido. Si está
 *   presente, se ignora la estructura hardcodeada y se le indica al modelo que
 *   replique EXACTAMENTE el formato del docente.
 * @param {string} [opts.modo='estricto']  - 'estricto' (replica el formato 1:1) o 'guia' (lo usa como referencia)
 */
export function buildPrompt(type, data, opts = {}) {
  const { formatoTexto = "", modo = "estricto" } = opts;
  const rt = REPORT_TYPES.find(r => r.id === type);

  // ── Caso A: el docente subió SU formato institucional ─────────────────────
  if (formatoTexto && formatoTexto.trim()) {
    let p = `Genera un ${rt?.label || type} replicando EXACTAMENTE el formato institucional del docente que se proporciona al final de este mensaje.\n\n`;

    p += `═══ DATOS INGRESADOS POR EL DOCENTE ═══\n`;
    p += `Estos son los datos que el docente quiere que aparezcan dentro del formato institucional. Encájalos en el lugar correcto del formato. Si un campo del formato no tiene dato disponible, escribe "(Sin información proporcionada)".\n\n`;
    Object.entries(data).forEach(([k, v]) => {
      if (k.startsWith("_") || !v || !v.trim()) return;
      const allFields = [...FORM_FIELDS.common, ...FORM_FIELDS.common2, ...(FORM_FIELDS[type] || [])];
      const field = allFields.find(f => f.k === k);
      const label = field?.label || k;
      p += `- ${label}: ${v.trim()}\n`;
    });

    p += `\n═══ FORMATO INSTITUCIONAL DEL DOCENTE (REPLICAR EXACTAMENTE) ═══\n`;
    if (modo === "estricto") {
      p += `Replica EXACTAMENTE este formato. Conserva títulos, subtítulos, numeración, orden de secciones, encabezados institucionales y cualquier estructura visible (tablas, listas, campos). NO añadas secciones nuevas. NO omitas secciones existentes. Cuando un campo del formato pida un dato, búscalo arriba en los DATOS INGRESADOS POR EL DOCENTE; si no está, escribe "(Sin información proporcionada)".\n\n`;
    } else {
      p += `Usa este formato como REFERENCIA principal: respeta su estilo y estructura general, pero puedes adaptarte si los datos del docente lo justifican.\n\n`;
    }
    p += `--- INICIO DEL FORMATO ---\n`;
    p += formatoTexto;
    p += `\n--- FIN DEL FORMATO ---\n\n`;
    p += `Ahora genera el reporte llenando ese formato con los datos del docente. Devuelve SÓLO el reporte llenado, sin explicaciones previas. Al final, en una línea separada, agrega: "Documento generado con asistencia de DocuIA. El docente responsable debe revisar y validar todos los datos antes de su envío oficial."`;

    return p;
  }

  // ── Caso B: no hay formato del docente → estructura por defecto de DocuIA ─
  let p = `Genera un ${rt?.label || type} COMPLETO con formato institucional profesional.\n\n`;
  p += `DATOS INGRESADOS POR EL DOCENTE:\n`;

  Object.entries(data).forEach(([k, v]) => {
    if (k.startsWith("_") || !v || !v.trim()) return;
    const allFields = [...FORM_FIELDS.common, ...FORM_FIELDS.common2, ...(FORM_FIELDS[type] || [])];
    const field = allFields.find(f => f.k === k);
    const label = field?.label || k;
    p += `- ${label}: ${v.trim()}\n`;
  });

  p += `\nESTRUCTURA OBLIGATORIA DEL REPORTE:\n`;

  if (type === "semanal") p += `
Genera estas secciones exactas usando ## para cada título:
## 1. DATOS INFORMATIVOS — institución, docente, cargo, curso, paralelo, asignatura, jornada, período evaluado, total de estudiantes
## 2. RESULTADOS DE LA SEMANA — tema desarrollado, objetivo planteado, actividades completadas e hitos logrados. Incluir datos cuantitativos concretos (porcentajes, cantidades). Si se proporcionaron datos de asistencia, incluir resumen aquí
## 3. DESAFÍOS Y OBSTÁCULOS — descripción de cada dificultad observada (académica, logística o conductual) y su impacto específico en el aprendizaje o el cronograma del grupo
## 4. PLAN PARA LA PRÓXIMA SEMANA — cronograma de prioridades (día por día si es posible), contenidos a desarrollar, estrategias a aplicar
## 5. COMPROMISOS — lista numerada de compromisos del docente, recursos solicitados y coordinaciones pendientes, cada uno con fecha límite
## 6. RECOMENDACIONES — mínimo 3 acciones específicas con responsable y fecha. Al menos 1 dirigida al docente, 1 a los estudiantes y 1 a las familias
## FIRMA — nombre del docente, cargo y fecha`;

  else if (type === "calificaciones") p += `
Genera estas secciones exactas usando ## para cada título:
## 1. DATOS INFORMATIVOS — institución, docente, curso, asignatura, tipo de evaluación, fecha de aplicación
## 2. DESTREZAS EVALUADAS — listado de cada DCD evaluada con su código del currículo
## 3. RESULTADOS CUANTITATIVOS — promedio, nota más alta, nota más baja. Tabla de distribución por rangos (Sobresaliente 9-10, Muy Buena 8-8.99, Buena 7-7.99, Regular 5-6.99, Insuficiente <5). Porcentaje de aprobación y de riesgo. Si hay datos para comparar con evaluaciones anteriores, incluir la tendencia
## 4. ANÁLISIS CUALITATIVO — descripción de avances observados basada en hechos concretos (qué hicieron bien, en qué preguntas acertaron). Dificultades identificadas con análisis de causa (¿por qué fallaron? ¿correlación con inasistencia?). Evaluación de la actitud y proceso del grupo sin usar adjetivos simples
## 5. ESTUDIANTES EN SITUACIÓN DE RIESGO — descripción del grupo que no alcanza el 7.0, desglosado por nivel de riesgo. Factores asociados identificados (inasistencia, falta de materiales, situación familiar)
## 6. ESTRATEGIAS DE REFUERZO — hoja de ruta concreta: qué se va a hacer, para quién, cuándo y con qué recursos. Incluir fechas de refuerzo y de evaluación recuperatoria
## 7. RECOMENDACIONES PARA LA FAMILIA — orientaciones prácticas para el hogar: rutinas de estudio, revisión de cuadernos, comunicación con el docente. Con fechas límite
## FIRMA — nombre del docente, cargo y fecha`;

  else if (type === "asistencia") p += `
Genera estas secciones exactas usando ## para cada título:
## 1. DATOS INFORMATIVOS — institución, docente, curso, período evaluado, total de estudiantes, jornada
## 2. RESUMEN CUANTITATIVO — presentar como tabla: días hábiles, presentes, ausentes justificados, ausentes injustificados, tardanzas, porcentaje de asistencia del período. Comparar con el período anterior si hay datos
## 3. DETALLE DE INASISTENCIAS — por cada caso: nombre, fecha(s), tipo (justificado/injustificado), motivo si se conoce, acumulado de faltas en el mes/quimestre
## 4. ANÁLISIS DE PATRONES — identificar tendencias: días con mayor ausentismo, estudiantes reincidentes, correlación con rendimiento académico, posibles causas sistémicas. Distinguir entre causas confirmadas y sospechadas
## 5. ACCIONES REALIZADAS — cronología de comunicaciones y gestiones ya efectuadas (llamadas, notificaciones, reuniones) con resultados
## 6. ACCIONES PENDIENTES — plan de acción con cada tarea, responsable y fecha límite. Incluir derivaciones al DECE si aplica
## 7. RECOMENDACIONES — mínimo 3 medidas preventivas para reducir el ausentismo y las tardanzas. Al menos 1 a nivel de aula, 1 a nivel institucional y 1 dirigida a las familias
## FIRMA — nombre del docente, cargo y fecha`;

  else if (type === "dece") p += `
Genera estas secciones exactas usando ## para cada título:
## 1. DATOS INFORMATIVOS — institución, profesional DECE responsable, docente que derivó el caso, curso, fecha del informe. IMPORTANTE: no incluir el nombre del estudiante en el cuerpo del informe, usar "el/la estudiante"
## 2. MOTIVO DE DERIVACIÓN — descripción objetiva y detallada de la situación que originó la intervención: qué se observó, quién lo reportó, desde cuándo, cuántos docentes lo notaron
## 3. ANTECEDENTES — trayectoria académica del estudiante, contexto familiar relevante, historial de intervenciones anteriores del DECE si las hay, acciones previas del docente antes de derivar
## 4. INTERVENCIÓN REALIZADA — cronología completa con fechas, horas, participantes, duración de cada sesión e instrumentos aplicados
## 5. HALLAZGOS Y ANÁLISIS PROFESIONAL — síntesis del contexto psicológico, educativo, emocional y social identificado. Resultados de instrumentos aplicados. IMPORTANTE: no emitir diagnósticos clínicos no validados, usar lenguaje descriptivo
## 6. ACUERDOS Y COMPROMISOS — lista de compromisos organizados por actor (estudiante, familia, docentes, DECE) con responsable, acción específica y fecha. Referencia al acta de compromiso firmada
## 7. DERIVACIÓN EXTERNA — si aplica: institución o profesional recomendado, motivo de la derivación, información entregada a la familia
## 8. PLAN DE SEGUIMIENTO — próximas fechas de revisión con responsables. Indicadores medibles de mejora esperados (ej: promedio sube a ≥6.5, asistencia regular por 3 semanas consecutivas)
## 9. NOTA DE CONFIDENCIALIDAD — protocolo del MINEDUC aplicado, clasificación de la información, lista de personas con acceso autorizado al caso
## FIRMA — nombre del profesional DECE, cargo y fecha`;

  else if (type === "planificacion") p += `
Genera estas secciones exactas usando ## para cada título:
## 1. DATOS INFORMATIVOS — institución, docente, asignatura/área, número y título de la unidad, curso, duración (semanas y períodos), período lectivo
## 2. OBJETIVOS DE APRENDIZAJE — listado con código oficial del currículo nacional. Explicar brevemente qué logrará el estudiante al completar la unidad
## 3. DESTREZAS CON CRITERIO DE DESEMPEÑO — listado numerado de cada DCD con su código oficial completo. Estas son las que se evaluarán
## 4. EJE TRANSVERSAL — cuál eje se integra y cómo se aborda concretamente dentro de las actividades de la unidad (no solo mencionarlo, explicar la conexión)
## 5. ESTRATEGIAS METODOLÓGICAS — descripción detallada de cómo van a aprender los estudiantes. Incluir CRONOGRAMA SEMANAL: qué contenido se aborda cada semana, con qué estrategia y en cuántos períodos
## 6. RECURSOS Y MATERIALES — listado completo de recursos físicos y digitales necesarios, con cantidades cuando aplique
## 7. EVALUACIÓN — instrumentos y criterios organizados por momento: diagnóstica (inicio de unidad), formativa (durante el proceso) y sumativa (cierre). Incluir ponderación si aplica. Incluir indicadores de logro esperados para cada DCD
## 8. ADAPTACIONES CURRICULARES PARA ESTUDIANTES CON NEE — para cada estudiante con necesidades educativas específicas: tipo de NEE, grado de adaptación curricular (1, 2 o 3), y listado de ajustes específicos en metodología, evaluación, tiempos y recursos
## 9. OBSERVACIONES Y BIBLIOGRAFÍA — alineación con el PCI institucional, coordinaciones interdisciplinarias planificadas, y referencias bibliográficas
## FIRMA — nombre del docente, cargo y fecha`;

  p += `\n\nNOTA FINAL: Al terminar el reporte, agrega una línea separada que diga: "Documento generado con asistencia de DocuIA. El docente responsable debe revisar y validar todos los datos antes de su envío oficial."`;

  return p;
}