export const SYSTEM_PROMPT = `Eres un asistente de redacción institucional para docentes de Fe y Alegría Ecuador. Generas reportes educativos completos, profesionales y listos para enviar a coordinación.

FORMATO OBLIGATORIO:
- Primera línea: "FE Y ALEGRÍA — UNIDAD EDUCATIVA [nombre de la institución]"
- Segunda línea: tipo de reporte, período y nombre del docente
- Separa cada sección principal con ## seguido del título en mayúsculas (ejemplo: ## 1. DATOS INFORMATIVOS)
- Dentro de cada sección usa numeración jerárquica: 1.1, 1.2, 1.3
- Usa numeración (1. 2. 3.) para listas de ítems, nunca guiones
- Cierra siempre con una sección ## FIRMA con nombre, cargo y fecha

TONO Y ESTILO:
- Lenguaje formal, directo y sin tecnicismos innecesarios
- Español ecuatoriano institucional
- Párrafos cortos, máximo 4 líneas por párrafo
- Nunca uses frases genéricas como "es importante destacar" o "cabe mencionar"

DATOS:
- Usa ÚNICAMENTE los datos proporcionados por el docente
- No inventes nombres de estudiantes, fechas ni calificaciones
- Si un dato no fue proporcionado, omite esa subsección en lugar de inventar
- Cuando haya datos numéricos, incluye análisis cuantitativo (porcentajes, promedios, comparaciones)

RECOMENDACIONES:
- Al final de cada reporte incluye una sección ## RECOMENDACIONES con mínimo 3 puntos accionables y específicos
- Las recomendaciones deben ser aplicables en el siguiente período académico`;

export const REPORT_TYPES = [
  { id: "semanal",        label: "Informe Semanal",          icon: "📅", desc: "Avance académico semanal" },
  { id: "calificaciones", label: "Reporte de Calificaciones", icon: "📊", desc: "Notas parciales o quimestrales" },
  { id: "asistencia",     label: "Registro de Asistencia",   icon: "📋", desc: "Control de asistencia" },
  { id: "dece",           label: "Informe DECE",              icon: "🧠", desc: "Consejería estudiantil" },
  { id: "planificacion",  label: "Planificación (PUD)",       icon: "📐", desc: "Planificación de unidad didáctica" },
];

export const FORM_FIELDS = {
  common: [
    { k: "docente",      label: "Nombre completo del docente",        ph: "Ej: Lcda. María Elena Pérez Torres",                      req: true },
    { k: "email",        label: "Email institucional",                 ph: "maria.perez@feyalegria.edu.ec" },
    { k: "institucion",  label: "Nombre completo de la institución",   ph: "Ej: Unidad Educativa Fe y Alegría La Dolorosa" },
    { k: "cargo",        label: "Cargo / Función",                     ph: "Ej: Docente de Matemáticas - Básica Superior" },
  ],
  common2: [
    { k: "curso",           label: "Curso / Paralelo",              ph: "Ej: 8vo EGB - Paralelo B",                          req: true, half: true },
    { k: "periodo",         label: "Período del reporte",           ph: "Ej: Semana del 7 al 11 de abril de 2026",           req: true, half: true },
    { k: "numEstudiantes",  label: "Número total de estudiantes",   ph: "Ej: 32 estudiantes",                                half: true },
    { k: "jornadaTurno",    label: "Jornada / Turno",               ph: "Ej: Matutina",                                      half: true },
  ],
  semanal: [
    { k: "asignatura",          label: "Asignatura",                                            ph: "Ej: Matemáticas" },
    { k: "tema",                label: "Tema / Contenido desarrollado",                         ph: "Ej: Operaciones con fracciones: suma y resta con diferente denominador", area: true },
    { k: "objetivoClase",       label: "Objetivo de aprendizaje de la semana",                  ph: "Ej: Los estudiantes resolverán problemas de suma y resta de fracciones heterogéneas aplicando el mínimo común múltiplo", area: true },
    { k: "asistencia",          label: "Datos de asistencia (presentes, ausentes, justificados)", ph: "Ej: 28 presentes, 3 ausentes (1 justificado por enfermedad, 2 sin justificación)" },
    { k: "actividadesRealizadas", label: "Actividades realizadas en clase",                     ph: "Ej: Explicación teórica, ejercicios guiados en parejas, evaluación formativa, retroalimentación grupal", area: true },
    { k: "recursosUsados",      label: "Recursos y materiales utilizados",                      ph: "Ej: Texto del MINEDUC pág. 45-52, material concreto (regletas), proyector, hojas de trabajo" },
    { k: "logros",              label: "Logros alcanzados",                                     ph: "Ej: El 75% logró resolver correctamente problemas de suma de fracciones", area: true },
    { k: "dificultades",        label: "Dificultades observadas",                               ph: "Ej: 8 estudiantes no dominan tablas de multiplicar, dificultando el MCM", area: true },
    { k: "observaciones",       label: "Observaciones adicionales",                             ph: "Ej: Se detectó caso de posible bullying que será derivado al DECE", area: true },
  ],
  calificaciones: [
    { k: "asignatura",          label: "Asignatura evaluada",                                   ph: "Ej: Ciencias Naturales" },
    { k: "tipoEvaluacion",      label: "Tipo de evaluación",                                    ph: "Ej: Prueba escrita parcial del primer quimestre" },
    { k: "fechaEvaluacion",     label: "Fecha de la evaluación",                                ph: "Ej: 9 de abril de 2026" },
    { k: "destrezasEvaluadas",  label: "Destrezas con criterio de desempeño evaluadas",         ph: "Ej: CN.4.1.5. Indagar y explicar las propiedades de la materia", area: true },
    { k: "promedioGeneral",     label: "Promedio general del curso",                            ph: "Ej: 7.2 / 10" },
    { k: "notaMasAlta",         label: "Nota más alta",                                         ph: "Ej: 9.8 / 10" },
    { k: "notaMasBaja",         label: "Nota más baja",                                         ph: "Ej: 3.5 / 10" },
    { k: "estudiantesAprobados", label: "Estudiantes que alcanzan los aprendizajes (≥7)",       ph: "Ej: 22 de 32 (68.7%)" },
    { k: "estudiantesRiesgo",   label: "Estudiantes que no alcanzan los aprendizajes (<7)",     ph: "Ej: 10 de 32 (31.3%)" },
    { k: "distribucionNotas",   label: "Distribución de calificaciones",                        ph: "Ej: Sobresaliente (9-10): 5 | Muy buena (8-8.9): 8 | Buena (7-7.9): 9", area: true },
    { k: "observaciones",       label: "Análisis y observaciones",                              ph: "Ej: Errores comunes en pregunta 4. Bajo rendimiento correlaciona con inasistencia", area: true },
  ],
  asistencia: [
    { k: "asignatura",              label: "Asignatura (si aplica)",            ph: "Ej: Todas las asignaturas" },
    { k: "totalPresentes",          label: "Total presentes",                   ph: "Ej: 28" },
    { k: "totalAusentes",           label: "Total ausentes",                    ph: "Ej: 4" },
    { k: "ausentesJustificados",    label: "Ausentes justificados (detalle)",   ph: "Ej: 2 — Juan P. (certificado médico), María L. (calamidad doméstica)" },
    { k: "ausentesInjustificados",  label: "Ausentes sin justificación",        ph: "Ej: 2 — Carlos R. (tercer día consecutivo), Andrea M." },
    { k: "atrasos",                 label: "Estudiantes con atrasos",           ph: "Ej: 3 llegaron después de las 7:15" },
    { k: "patronesAusentismo",      label: "Patrones de ausentismo observados", ph: "Ej: Los lunes hay mayor ausentismo (promedio 4 vs 2 otros días)", area: true },
    { k: "accionesTomadas",         label: "Acciones tomadas o pendientes",     ph: "Ej: Se llamó al representante sin respuesta. Se enviará notificación vía DECE", area: true },
    { k: "observaciones",           label: "Observaciones adicionales",         ph: "Ej: Se recomienda reunión con padres antes del cierre del parcial", area: true },
  ],
  dece: [
    { k: "tipoInforme",           label: "Tipo de intervención DECE",                      ph: "Ej: Atención individual / Seguimiento de caso" },
    { k: "motivoAtencion",        label: "Motivo de atención",                              ph: "Ej: Bajo rendimiento repentino, cambio conductual reportado por 3 docentes" },
    { k: "antecedentes",          label: "Antecedentes del caso",                           ph: "Ej: Estudiante de 14 años, sin historial previo. Padres divorciados hace 6 meses", area: true },
    { k: "intervencionRealizada", label: "Intervención realizada (fechas y acciones)",      ph: "Ej: 7/abr: entrevista con estudiante. 8/abr: entrevista con representante", area: true },
    { k: "hallazgos",             label: "Hallazgos y análisis",                            ph: "Ej: Estudiante refiere tristeza tras separación de padres. No se evidencian indicadores de riesgo", area: true },
    { k: "acuerdos",              label: "Acuerdos y compromisos",                          ph: "Ej: Madre se compromete a acompañamiento. Seguimiento quincenal con DECE", area: true },
    { k: "derivacion",            label: "Derivación externa (si aplica)",                  ph: "Ej: Se recomienda valoración psicológica externa" },
    { k: "seguimiento",           label: "Plan de seguimiento",                             ph: "Ej: Próxima cita: 21 de abril. Revisión académica: 30 de abril", area: true },
    { k: "observaciones",         label: "Observaciones de confidencialidad",               ph: "Ej: Caso manejado según Protocolo de Actuación del MINEDUC", area: true },
  ],
  planificacion: [
    { k: "asignatura",      label: "Asignatura / Área",                             ph: "Ej: Matemáticas - Álgebra y Funciones" },
    { k: "tema",            label: "Título de la unidad didáctica",                 ph: "Ej: Unidad 3: Operaciones con números racionales" },
    { k: "duracion",        label: "Duración / Períodos",                           ph: "Ej: 6 semanas — 30 períodos de 40 minutos" },
    { k: "objetivoUnidad",  label: "Objetivo de la unidad",                         ph: "Ej: O.M.4.2. Utilizar patrones numéricos para resolver problemas", area: true },
    { k: "destrezas",       label: "Destrezas con criterio de desempeño (DCD)",     ph: "Ej: M.4.1.14. Resolver operaciones combinadas", area: true },
    { k: "ejeTransversal",  label: "Eje transversal",                               ph: "Ej: La interculturalidad / El cuidado de la salud" },
    { k: "metodologia",     label: "Metodología y estrategias",                     ph: "Ej: Aprendizaje basado en problemas, trabajo colaborativo, clase invertida", area: true },
    { k: "recursos",        label: "Recursos y materiales",                         ph: "Ej: Texto MINEDUC, calculadora, GeoGebra, regletas de Cuisenaire" },
    { k: "evaluacion",      label: "Criterios e instrumentos de evaluación",        ph: "Ej: Evaluación diagnóstica, rúbrica grupal, prueba escrita, portafolio", area: true },
    { k: "adaptaciones",    label: "Adaptaciones curriculares / NEE",               ph: "Ej: 2 estudiantes con TDAH: tiempo adicional. 1 con discalculia: calculadora", area: true },
    { k: "observaciones",   label: "Observaciones y bibliografía",                  ph: "Ej: Alineado con PCI 2025-2026. Proyecto interdisciplinario con Ciencias Naturales", area: true },
  ],
};

export function buildPrompt(type, data) {
  const rt = REPORT_TYPES.find(r => r.id === type);
  let p = `Genera un ${rt.label} COMPLETO y EXTENSO con formato institucional de Fe y Alegría Ecuador.\n\nDATOS PROPORCIONADOS POR EL DOCENTE:\n`;
  Object.entries(data).forEach(([k, v]) => { if (v && v.trim()) p += `- ${k}: ${v}\n`; });
  p += `\nINSTRUCCIONES ADICIONALES:\n`;
  if (type === "semanal")       p += "Genera informe semanal completo con: 1) Datos informativos, 2) Resumen de actividades, 3) Análisis de asistencia, 4) Logros, 5) Dificultades, 6) Recomendaciones pedagógicas, 7) Plan siguiente semana, 8) Compromisos.";
  else if (type === "calificaciones") p += "Genera reporte con: 1) Datos informativos, 2) Info evaluación, 3) Resultados cuantitativos, 4) Análisis por nivel de logro, 5) Estudiantes en riesgo, 6) Refuerzo académico, 7) Recomendaciones para padres, 8) Compromisos.";
  else if (type === "asistencia")    p += "Genera registro con: 1) Datos informativos, 2) Resumen cuantitativo, 3) Detalle inasistencias, 4) Patrones, 5) Acciones realizadas, 6) Pendientes, 7) Recomendaciones, 8) Seguimiento.";
  else if (type === "dece")          p += "Genera informe DECE con: 1) Datos informativos, 2) Motivo, 3) Antecedentes, 4) Intervención cronológica, 5) Hallazgos, 6) Acuerdos, 7) Derivaciones, 8) Seguimiento, 9) Confidencialidad.";
  else if (type === "planificacion") p += "Genera PUD con: 1) Datos informativos, 2) Objetivos, 3) DCD, 4) Ejes transversales, 5) Metodología por semana, 6) Recursos, 7) Evaluación, 8) Adaptaciones, 9) Bibliografía.";
  p += "\n\nADVERTENCIA IMPORTANTE: Incluye un mensaje claro al final del informe que indique que el docente debe revisar el contenido y no confiar en la IA al 100%.";
  return p;
}
