import { useState, useRef, useEffect } from "react";

// ===== SUPABASE =====
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_KEY);

async function saveToSupabase(table, data) {
  if (!supabaseEnabled) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=minimal" },
      body: JSON.stringify(data),
    });
  } catch {}
}

// ===== REPORT CONFIG =====
const SYSTEM_PROMPT = `Eres un asistente de redacción institucional para docentes de Fe y Alegría Ecuador. Generas reportes educativos completos, profesionales y listos para enviar a coordinación.

FORMATO INSTITUCIONAL OBLIGATORIO:
- Encabezado: "FE Y ALEGRÍA — UNIDAD EDUCATIVA [nombre]"
- Subtítulo con tipo de reporte, período y docente
- Secciones numeradas claramente separadas con títulos en mayúsculas
- Lenguaje formal pero claro, español ecuatoriano
- Incluir recomendaciones pedagógicas específicas al final
- Referencias al currículo nacional del Ecuador cuando sea pertinente
- Cerrar con línea de firma del docente, cargo y fecha

REGLAS:
- Usa SOLO los datos proporcionados, NO inventes nombres de estudiantes ni datos
- Genera el reporte COMPLETO y extenso, listo para copiar y usar
- Incluye análisis cuantitativo cuando haya datos numéricos
- Las recomendaciones deben ser accionables y específicas
- Formato profesional con numeración de secciones (1. 1.1. 1.2. etc.)`;

const REPORT_TYPES = [
  { id: "semanal", label: "Informe Semanal", icon: "📅", desc: "Avance académico semanal" },
  { id: "calificaciones", label: "Reporte de Calificaciones", icon: "📊", desc: "Notas parciales o quimestrales" },
  { id: "asistencia", label: "Registro de Asistencia", icon: "📋", desc: "Control de asistencia" },
  { id: "dece", label: "Informe DECE", icon: "🧠", desc: "Consejería estudiantil" },
  { id: "planificacion", label: "Planificación (PUD)", icon: "📐", desc: "Planificación de unidad didáctica" },
];

// ===== FORM FIELDS PER REPORT TYPE =====
const FORM_FIELDS = {
  common: [
    { k: "docente", label: "Nombre completo del docente", ph: "Ej: Lcda. María Elena Pérez Torres", req: true },
    { k: "email", label: "Email institucional", ph: "maria.perez@feyalegria.edu.ec" },
    { k: "institucion", label: "Nombre completo de la institución", ph: "Ej: Unidad Educativa Fe y Alegría La Dolorosa" },
    { k: "cargo", label: "Cargo / Función", ph: "Ej: Docente de Matemáticas - Básica Superior" },
  ],
  common2: [
    { k: "curso", label: "Curso / Paralelo", ph: "Ej: 8vo EGB - Paralelo B", req: true, half: true },
    { k: "periodo", label: "Período del reporte", ph: "Ej: Semana del 7 al 11 de abril de 2026", req: true, half: true },
    { k: "numEstudiantes", label: "Número total de estudiantes", ph: "Ej: 32 estudiantes", half: true },
    { k: "jornadaTurno", label: "Jornada / Turno", ph: "Ej: Matutina", half: true },
  ],
  semanal: [
    { k: "asignatura", label: "Asignatura", ph: "Ej: Matemáticas" },
    { k: "tema", label: "Tema / Contenido desarrollado", ph: "Ej: Operaciones con fracciones: suma y resta con diferente denominador", area: true },
    { k: "objetivoClase", label: "Objetivo de aprendizaje de la semana", ph: "Ej: Los estudiantes resolverán problemas de suma y resta de fracciones heterogéneas aplicando el mínimo común múltiplo", area: true },
    { k: "asistencia", label: "Datos de asistencia (presentes, ausentes, justificados)", ph: "Ej: 28 presentes, 3 ausentes (1 justificado por enfermedad, 2 sin justificación)" },
    { k: "actividadesRealizadas", label: "Actividades realizadas en clase", ph: "Ej: Explicación teórica con ejemplos en pizarra, ejercicios guiados en parejas, evaluación formativa con 5 problemas, retroalimentación grupal", area: true },
    { k: "recursosUsados", label: "Recursos y materiales utilizados", ph: "Ej: Texto del MINEDUC pág. 45-52, material concreto (regletas), proyector, hojas de trabajo" },
    { k: "logros", label: "Logros alcanzados", ph: "Ej: El 75% de los estudiantes logró resolver correctamente problemas de suma de fracciones. Participación activa en trabajo colaborativo", area: true },
    { k: "dificultades", label: "Dificultades observadas", ph: "Ej: 8 estudiantes no dominan las tablas de multiplicar, lo que dificulta encontrar el MCM. 3 estudiantes no trajeron materiales", area: true },
    { k: "observaciones", label: "Observaciones adicionales y aspectos conductuales", ph: "Ej: Se detectó un caso de posible bullying entre dos estudiantes que será derivado al DECE. El grupo en general muestra mejor disposición al trabajo en equipo", area: true },
  ],
  calificaciones: [
    { k: "asignatura", label: "Asignatura evaluada", ph: "Ej: Ciencias Naturales" },
    { k: "tipoEvaluacion", label: "Tipo de evaluación", ph: "Ej: Prueba escrita parcial del primer quimestre - Unidad 2" },
    { k: "fechaEvaluacion", label: "Fecha de la evaluación", ph: "Ej: 9 de abril de 2026" },
    { k: "destrezasEvaluadas", label: "Destrezas con criterio de desempeño evaluadas", ph: "Ej: CN.4.1.5. Indagar y explicar las propiedades de la materia y relacionarlas con cambios físicos y químicos", area: true },
    { k: "promedioGeneral", label: "Promedio general del curso", ph: "Ej: 7.2 / 10" },
    { k: "notaMasAlta", label: "Nota más alta", ph: "Ej: 9.8 / 10" },
    { k: "notaMasBaja", label: "Nota más baja", ph: "Ej: 3.5 / 10" },
    { k: "estudiantesAprobados", label: "Estudiantes que alcanzan los aprendizajes (≥7)", ph: "Ej: 22 de 32 (68.7%)" },
    { k: "estudiantesRiesgo", label: "Estudiantes que no alcanzan los aprendizajes (<7)", ph: "Ej: 10 de 32 (31.3%) — 5 entre 5-6.9, 3 entre 4-4.9, 2 bajo 4" },
    { k: "distribucionNotas", label: "Distribución de calificaciones", ph: "Ej: Sobresaliente (9-10): 5 | Muy buena (8-8.9): 8 | Buena (7-7.9): 9 | Regular (5-6.9): 7 | Insuficiente (<5): 3", area: true },
    { k: "observaciones", label: "Análisis y observaciones del docente", ph: "Ej: Los errores más comunes fueron en la pregunta 4 (cambios químicos vs físicos). Los estudiantes con bajo rendimiento coinciden con alta inasistencia", area: true },
  ],
  asistencia: [
    { k: "asignatura", label: "Asignatura (si aplica)", ph: "Ej: Todas las asignaturas / Matemáticas" },
    { k: "totalPresentes", label: "Total estudiantes presentes", ph: "Ej: 28" },
    { k: "totalAusentes", label: "Total ausentes", ph: "Ej: 4" },
    { k: "ausentesJustificados", label: "Ausentes justificados (detalle)", ph: "Ej: 2 justificados — Juan P. (certificado médico), María L. (calamidad doméstica)" },
    { k: "ausentesInjustificados", label: "Ausentes sin justificación", ph: "Ej: 2 sin justificación — Carlos R. (tercer día consecutivo), Andrea M." },
    { k: "atrasos", label: "Estudiantes con atrasos", ph: "Ej: 3 estudiantes llegaron después de las 7:15 — Pedro S., Luisa V., Miguel A." },
    { k: "patronesAusentismo", label: "Patrones de ausentismo observados", ph: "Ej: Carlos R. lleva 5 inasistencias en el mes. Los lunes hay mayor ausentismo (promedio 4 ausentes vs 2 otros días)", area: true },
    { k: "accionesTomadas", label: "Acciones tomadas o pendientes", ph: "Ej: Se llamó al representante de Carlos R. sin respuesta. Se enviará notificación escrita vía DECE. Se aplicará el protocolo de ausentismo del código de convivencia", area: true },
    { k: "observaciones", label: "Observaciones adicionales", ph: "Ej: Se recomienda reunión con padres de familia de los 3 estudiantes con mayor inasistencia antes del cierre del parcial", area: true },
  ],
  dece: [
    { k: "tipoInforme", label: "Tipo de intervención DECE", ph: "Ej: Atención individual / Seguimiento de caso / Intervención en crisis / Derivación externa" },
    { k: "motivoAtencion", label: "Motivo de atención (sin nombres de estudiantes)", ph: "Ej: Bajo rendimiento académico repentino en las últimas 3 semanas, cambio conductual reportado por 3 docentes" },
    { k: "antecedentes", label: "Antecedentes del caso", ph: "Ej: Estudiante de 14 años, sin historial previo de dificultades académicas. Promedio anterior: 8.5. Promedio actual: 5.2. Padres divorciados hace 6 meses, vive con la madre", area: true },
    { k: "intervencionRealizada", label: "Intervención realizada (fechas y acciones)", ph: "Ej: 7/abril: entrevista individual con estudiante. 8/abril: entrevista con representante (madre). 9/abril: reunión con tutora de curso. Se aplicó test de bienestar emocional", area: true },
    { k: "hallazgos", label: "Hallazgos y análisis", ph: "Ej: El estudiante refiere sentirse triste y desmotivado tras la separación de sus padres. La madre confirma cambios de comportamiento en casa. No se evidencian indicadores de riesgo", area: true },
    { k: "acuerdos", label: "Acuerdos y compromisos establecidos", ph: "Ej: Madre se compromete a acompañamiento diario en tareas. Docentes darán apoyo pedagógico adicional. Seguimiento quincenal con DECE. Estudiante participará en grupo de apoyo emocional", area: true },
    { k: "derivacion", label: "Derivación externa (si aplica)", ph: "Ej: Se recomienda valoración psicológica externa con profesional privado. No se requiere derivación a salud / DINAPEN / Fiscalía" },
    { k: "seguimiento", label: "Plan de seguimiento", ph: "Ej: Próxima cita con DECE: 21 de abril. Revisión de rendimiento académico: 30 de abril. Reunión de seguimiento con madre: 5 de mayo", area: true },
    { k: "observaciones", label: "Observaciones de confidencialidad y protocolo", ph: "Ej: Caso manejado según Protocolo de Actuación del MINEDUC. Información confidencial compartida solo con actores involucrados", area: true },
  ],
  planificacion: [
    { k: "asignatura", label: "Asignatura / Área de conocimiento", ph: "Ej: Matemáticas - Álgebra y Funciones" },
    { k: "tema", label: "Título de la unidad didáctica", ph: "Ej: Unidad 3: Operaciones con números racionales" },
    { k: "duracion", label: "Duración / Número de períodos", ph: "Ej: 6 semanas — 30 períodos de clase de 40 minutos" },
    { k: "objetivoUnidad", label: "Objetivo de la unidad", ph: "Ej: O.M.4.2. Utilizar patrones numéricos para resolver problemas de la vida cotidiana aplicando operaciones con fracciones y decimales", area: true },
    { k: "destrezas", label: "Destrezas con criterio de desempeño (DCD)", ph: "Ej: M.4.1.14. Resolver operaciones combinadas con fracciones, decimales y números enteros, aplicando el orden de operaciones", area: true },
    { k: "ejeTransversal", label: "Eje transversal", ph: "Ej: La interculturalidad / El cuidado de la salud / La protección del medio ambiente" },
    { k: "metodologia", label: "Metodología y estrategias didácticas", ph: "Ej: Aprendizaje basado en problemas, trabajo colaborativo en grupos de 4, clase invertida con videos, uso de material concreto", area: true },
    { k: "recursos", label: "Recursos y materiales", ph: "Ej: Texto del MINEDUC, calculadora, GeoGebra, material concreto (regletas de Cuisenaire), hojas de trabajo, proyector" },
    { k: "evaluacion", label: "Criterios e instrumentos de evaluación", ph: "Ej: Evaluación diagnóstica (inicio), rúbrica de trabajo grupal, prueba escrita parcial, portafolio de ejercicios, autoevaluación", area: true },
    { k: "adaptaciones", label: "Adaptaciones curriculares / NEE", ph: "Ej: 2 estudiantes con TDAH: tiempo adicional en evaluaciones, instrucciones fragmentadas, ubicación preferencial. 1 estudiante con discalculia: uso de calculadora y material concreto", area: true },
    { k: "observaciones", label: "Observaciones y bibliografía adicional", ph: "Ej: Esta planificación se alinea con el PCI institucional 2025-2026. Se coordinará con el área de Ciencias Naturales para proyecto interdisciplinario", area: true },
  ],
};

function buildPrompt(type, data) {
  const rt = REPORT_TYPES.find(r => r.id === type);
  let p = `Genera un ${rt.label} COMPLETO y EXTENSO con formato institucional de Fe y Alegría Ecuador.\n\nDATOS PROPORCIONADOS POR EL DOCENTE:\n`;
  Object.entries(data).forEach(([k, v]) => { if (v && v.trim()) p += `- ${k}: ${v}\n`; });
  p += `\nINSTRUCCIONES ADICIONALES:\n`;
  if (type === "semanal") p += "Genera informe semanal completo con: 1) Datos informativos, 2) Resumen de actividades desarrolladas, 3) Análisis de asistencia, 4) Logros de aprendizaje alcanzados, 5) Dificultades y problemas detectados, 6) Recomendaciones pedagógicas específicas, 7) Plan de acción para la siguiente semana, 8) Compromisos.";
  else if (type === "calificaciones") p += "Genera reporte de calificaciones con: 1) Datos informativos, 2) Información de la evaluación, 3) Resultados cuantitativos (promedios, distribución), 4) Análisis de rendimiento por nivel de logro, 5) Identificación de estudiantes en riesgo, 6) Estrategias de refuerzo académico, 7) Recomendaciones para padres de familia, 8) Compromisos del docente.";
  else if (type === "asistencia") p += "Genera registro de asistencia con: 1) Datos informativos, 2) Resumen cuantitativo del período, 3) Detalle de inasistencias, 4) Análisis de patrones de ausentismo, 5) Acciones realizadas, 6) Acciones pendientes, 7) Recomendaciones y alertas, 8) Seguimiento propuesto.";
  else if (type === "dece") p += "Genera informe DECE con: 1) Datos informativos, 2) Motivo de atención, 3) Antecedentes relevantes, 4) Descripción de la intervención (cronológica), 5) Hallazgos y análisis profesional, 6) Acuerdos y compromisos, 7) Derivaciones, 8) Plan de seguimiento, 9) Nota de confidencialidad.";
  else if (type === "planificacion") p += "Genera PUD completo con: 1) Datos informativos, 2) Objetivos de la unidad, 3) Destrezas con criterio de desempeño, 4) Ejes transversales, 5) Estrategias metodológicas (desglosadas por semana), 6) Recursos, 7) Criterios e instrumentos de evaluación, 8) Adaptaciones curriculares, 9) Bibliografía.";
  return p;
}

// ===== DOWNLOAD FUNCTIONS =====
function downloadWord(text, filename) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 2.5cm; color: #1a1a1a; }
  h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 12pt; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; border-bottom: 1pt solid #1E3A5F; padding-bottom: 4pt; }
  p { margin: 6pt 0; text-align: justify; }
</style></head><body>${text.split('\n').map(line => {
    const t = line.trim();
    if (!t) return '';
    if (t.startsWith('# ') || t.match(/^FE Y ALEGRÍA/i)) return `<h1>${t.replace(/^#+\s*/, '')}</h1>`;
    if (t.startsWith('## ') || t.match(/^\d+\.\s+[A-ZÁÉÍÓÚ]/)) return `<h2>${t.replace(/^#+\s*/, '')}</h2>`;
    if (t.startsWith('**') && t.endsWith('**')) return `<h2>${t.replace(/\*\*/g, '')}</h2>`;
    return `<p>${t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>')}</p>`;
  }).join('\n')}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${filename}.doc`; a.click(); URL.revokeObjectURL(a.href);
}

function downloadPDF(text, filename) {
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title><style>
    @media print { @page { margin: 2cm; } }
    body { font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.6; max-width: 21cm; margin: 2cm auto; color: #1a1a1a; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; border-bottom: 2px solid #1E3A5F; padding-bottom: 8px; }
    h2 { font-size: 13pt; font-weight: bold; margin-top: 16px; color: #2D3561; }
    p { margin: 6px 0; text-align: justify; }
  </style></head><body>${text.split('\n').map(line => {
    const t = line.trim();
    if (!t) return '<br>';
    if (t.startsWith('# ') || t.match(/^FE Y ALEGRÍA/i)) return `<h1>${t.replace(/^#+\s*/, '')}</h1>`;
    if (t.startsWith('## ') || t.match(/^\d+\.\s+[A-ZÁÉÍÓÚ]/)) return `<h2>${t.replace(/^#+\s*/, '')}</h2>`;
    if (t.startsWith('**') && t.endsWith('**')) return `<h2>${t.replace(/\*\*/g, '')}</h2>`;
    return `<p>${t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>')}</p>`;
  }).join('\n')}</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

function downloadExcel(text, filename) {
  const rows = text.split('\n').filter(l => l.trim());
  let csv = '\uFEFF'; // BOM for Excel UTF-8
  rows.forEach(r => { csv += `"${r.replace(/"/g, '""')}"\n`; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

function printReport(text) {
  downloadPDF(text, 'DocuIA_Reporte');
}

// ===== FIELD COMPONENT (must be outside App to avoid remount on each keystroke) =====
function Field({ label, k, ph, area, req, half, form, set }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#4A4A4A", display: "block", marginBottom: 4 }}>
        {label} {req && <span style={{ color: "#8B0000" }}>*</span>}
      </label>
      {area ? (
        <textarea value={form[k] || ""} onChange={e => set(k, e.target.value)} placeholder={ph} rows={3}
          style={{ width: "100%", padding: "10px 12px", border: "2px solid #D9D9D9", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#FFFFFF", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#1E3A5F"} onBlur={e => e.target.style.borderColor = "#D9D9D9"} />
      ) : (
        <input value={form[k] || ""} onChange={e => set(k, e.target.value)} placeholder={ph}
          style={{ width: "100%", padding: "10px 12px", border: "2px solid #D9D9D9", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#1E3A5F"} onBlur={e => e.target.style.borderColor = "#D9D9D9"} />
      )}
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [view, setView] = useState("landing");
  const [reportType, setReportType] = useState(null);
  const [form, setForm] = useState({});
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const formRef = useRef(null);

  const msgs = ["Analizando datos del curso...", "Estructurando el reporte...", "Redactando contenido institucional...", "Añadiendo recomendaciones pedagógicas...", "Verificando formato de Fe y Alegría...", "Formateando documento final..."];

  useEffect(() => { saveToSupabase("visitas", { referrer: document.referrer || "directo" }); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const generate = async () => {
    if (!form.docente || !form.curso || !form.periodo) { setError("Completa los campos obligatorios (docente, curso, período)"); return; }
    setView("loading"); setError("");
    let mi = 0; setLoadMsg(msgs[0]);
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadMsg(msgs[mi]); }, 2200);

    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(reportType, form), system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      clearInterval(iv);
      if (data.text) {
        setReport(data.text); setView("report");
        saveToSupabase("reportes", {
          email_docente: form.email, nombre_docente: form.docente,
          institucion: form.institucion, curso: form.curso, periodo: form.periodo,
          tipo_reporte: reportType, datos_ingresados: JSON.stringify(form), reporte_generado: data.text,
        });
      } else { setError(data.error || "No se pudo generar. Intenta de nuevo."); setView("form"); }
    } catch { clearInterval(iv); setError("Error de conexión. Intenta de nuevo."); setView("form"); }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report); setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    saveToSupabase("reportes_copiados", { email_docente: form.email, tipo: reportType });
  };

  const reset = () => { setView("landing"); setReportType(null); setReport(""); setError(""); setForm({}); };

  const canSubmit = form.docente && form.curso && form.periodo;
  const fileName = `DocuIA_${REPORT_TYPES.find(r => r.id === reportType)?.label || 'Reporte'}_${form.curso || ''}_${form.periodo || ''}`.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_\- ]/g, '').replace(/\s+/g, '_');

  return (
    <div style={{ fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif", color: "#0F1419", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .fade{animation:fadeUp .6s ease both}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
        .btn{transition:all .2s;cursor:pointer;border:none;outline:none}
        .btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(30,58,95,.25)}
        .btn:active{transform:scale(.97)}
        .card{transition:all .25s}
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(15,20,25,.12)}
        .dl-btn{transition:all .15s;cursor:pointer;border:none;outline:none;display:flex;align-items:center;gap:8px;justify-content:center}
        .dl-btn:hover{transform:translateY(-1px);filter:brightness(1.05)}
        .dl-btn:active{transform:scale(.96)}
        @media(max-width:700px){.g2{grid-template-columns:1fr!important}.hero-t{font-size:30px!important}.sn{font-size:30px!important}.dl-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#FFFFFF", boxShadow: "0 2px 8px rgba(15,20,25,.08)", borderBottom: "none", padding: "12px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={reset}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#1E3A5F,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#0F1419" }}>DocuIA</span>
          </div>
          <button className="btn" onClick={scrollToForm} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#1E3A5F,#6C7AE0)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
            Generar reporte gratis
          </button>
        </div>
      </nav>

      {/* HERO + LANDING */}
      {(view === "landing" || view === "form") && (
        <>
          <section style={{ background: "linear-gradient(170deg,#0F1419 0%,#1E3A5F 50%,#1E3A5F 100%)", padding: "80px 24px 90px", position: "relative", overflow: "hidden" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
              <div className="fade" style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,201,167,.15)", borderRadius: 20, marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#D4AF37" }}>🎓 Para docentes de Fe y Alegría</span>
              </div>
              <h1 className="fade d1 hero-t" style={{ fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1.15, margin: "0 0 20px" }}>
                ¿Pierdes <span style={{ color: "#D4AF37" }}>6+ horas</span> semanales<br />haciendo reportes?
              </h1>
              <p className="fade d2" style={{ fontSize: 19, color: "rgba(255,255,255,.75)", lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 600 }}>
                DocuIA genera tus informes institucionales completos en <strong style={{ color: "#fff" }}>menos de 10 minutos</strong> con inteligencia artificial.
              </p>
              <button className="btn fade d3" onClick={scrollToForm} style={{ padding: "16px 40px", background: "#D4AF37", color: "#0F1419", fontSize: 17, fontWeight: 800, borderRadius: 14 }}>
                Genera tu primer reporte gratis →
              </button>
              <p className="fade d4" style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 16 }}>Sin registro · Sin costo · Descarga en Word, PDF o Excel</p>
            </div>
          </section>

          {/* STATS */}
          <section style={{ background: "#F5F5F5", padding: "0 24px" }}>
            <div className="g2" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", transform: "translateY(-40px)" }}>
              {[{ num: "79%", label: "dedica +6 hrs/semana\na reportes", color: "#8B0000" }, { num: "63%", label: "trabaja fuera\nde jornada", color: "#F59E0B" }, { num: "47%", label: "repite datos\n3+ veces/semana", color: "#1E3A5F" }, { num: "37%", label: "trabaja fines\nde semana", color: "#8B5CF6" }].map((s, i) => (
                <div key={i} className="fade card" style={{ background: "#fff", padding: "28px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid #F0F0F0" : "none", borderRadius: i === 0 ? "16px 0 0 16px" : i === 3 ? "0 16px 16px 0" : 0, boxShadow: "0 4px 20px rgba(0,0,0,.04)", animationDelay: `${.1 + i * .1}s` }}>
                  <div className="sn" style={{ fontSize: 36, fontWeight: 700, color: "#1E3A5F", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "#757575", marginTop: 6, lineHeight: 1.4, whiteSpace: "pre-line" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ padding: "40px 24px 70px", background: "#F5F5F5" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 50px", color: "#0F1419" }}>¿Cómo funciona?</h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
                {[{ s: "1", icon: "📝", t: "Ingresa datos", d: "Completa el formulario detallado con la información de tu curso." }, { s: "2", icon: "🤖", t: "La IA genera", d: "DocuIA redacta el informe completo en formato institucional." }, { s: "3", icon: "📥", t: "Descarga", d: "Descarga en Word, PDF o Excel. Listo para enviar." }].map((st, i) => (
                  <div key={i} style={{ textAlign: "center", maxWidth: 240 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px", background: "linear-gradient(135deg,#1E3A5F,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 8px 24px rgba(30,58,95,.25)" }}>{st.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#1E3A5F", marginBottom: 6, letterSpacing: 1 }}>PASO {st.s}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1419", marginBottom: 8 }}>{st.t}</div>
                    <p style={{ fontSize: 13, color: "#757575", lineHeight: 1.5, margin: 0 }}>{st.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FORM */}
          <section ref={formRef} style={{ padding: "70px 24px", background: "#F5F5F5" }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: "center", margin: "0 0 8px", color: "#0F1419" }}>Genera tu reporte ahora</h2>
              <p style={{ textAlign: "center", color: "#757575", fontSize: 15, marginBottom: 30 }}>Mientras más detalle ingreses, mejor será el reporte generado</p>

              {!reportType ? (
                <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {REPORT_TYPES.map(rt => (
                    <div key={rt.id} className="card" onClick={() => { setReportType(rt.id); setForm({}); }}
                      style={{ background: "#fff", borderRadius: 14, padding: "20px 16px", textAlign: "center", cursor: "pointer", border: "2px solid rgba(30,58,95,.05)" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{rt.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1419" }}>{rt.label}</div>
                      <div style={{ fontSize: 11, color: "#757575", marginTop: 4 }}>{rt.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{REPORT_TYPES.find(r => r.id === reportType)?.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#1E3A5F" }}>{REPORT_TYPES.find(r => r.id === reportType)?.label}</span>
                    </div>
                    <button onClick={() => setReportType(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#757575", fontWeight: 600 }}>← Cambiar</button>
                  </div>

                  {error && <div style={{ padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, fontSize: 13, color: "#DC2626", marginBottom: 14, border: "1px solid #FECACA" }}>⚠️ {error}</div>}

                  {/* DATOS DEL DOCENTE */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", letterSpacing: 1.5, marginBottom: 10, marginTop: 4 }}>DATOS DEL DOCENTE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    {FORM_FIELDS.common.map(f => <Field key={f.k} {...f} form={form} set={set} half />)}
                  </div>

                  {/* DATOS DEL CURSO */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", letterSpacing: 1.5, marginBottom: 10, marginTop: 8 }}>DATOS DEL CURSO / PERÍODO</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    {FORM_FIELDS.common2.map(f => <Field key={f.k} {...f} form={form} set={set} half />)}
                  </div>

                  {/* SPECIFIC FIELDS */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", letterSpacing: 1.5, marginBottom: 10, marginTop: 8 }}>INFORMACIÓN ESPECÍFICA DEL REPORTE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    {(FORM_FIELDS[reportType] || []).map(f => <Field key={f.k} {...f} form={form} set={set} />)}
                  </div>

                  <button className="btn" onClick={generate} disabled={!canSubmit}
                    style={{ width: "100%", padding: 16, marginTop: 12, background: canSubmit ? "linear-gradient(135deg,#1E3A5F,#6C7AE0)" : "#BFBFBF", color: "#fff", fontSize: 16, fontWeight: 700, borderRadius: 12, cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 4px 20px rgba(74,95,224,.3)" : "none" }}>
                    🤖 Generar reporte con IA
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* QUOTE + CTA + FOOTER */}
          <section style={{ padding: "50px 24px", background: "#fff" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: .15 }}>"</div>
              <p style={{ fontSize: 20, fontWeight: 500, color: "#4A4A4A", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 16px" }}>Los informes son diarios. Todos los días ciertos reportes son repetidos. Durante toda la mañana.</p>
              <p style={{ fontSize: 14, color: "#757575" }}>— Ivette Proaño, Inspectora General, Fe y Alegría</p>
            </div>
          </section>
          <section style={{ padding: "50px 24px", background: "linear-gradient(135deg,#0F1419,#2D3561)" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>¿Quieres DocuIA para toda tu institución?</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)", marginBottom: 24 }}>Licencia institucional. Un solo pago, reportes ilimitados.</p>
              <a href="mailto:docuia.feyalegria@gmail.com?subject=Interés en DocuIA institucional" className="btn" style={{ display: "inline-block", padding: "12px 32px", background: "#D4AF37", color: "#0F1419", fontSize: 15, fontWeight: 700, borderRadius: 12, textDecoration: "none" }}>Contactar →</a>
            </div>
          </section>
          <footer style={{ padding: "24px", background: "#0F1419", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#BFBFBF", margin: 0 }}>DocuIA · Fe y Alegría · PUCE 2026 · Piñero · Heredia · Zumárraga · Iza</p>
          </footer>
        </>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ textAlign: "center", animation: "fadeUp .4s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 28px", background: "linear-gradient(135deg,#1E3A5F,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, animation: "spin 3s linear infinite", boxShadow: "0 8px 30px rgba(74,95,224,.3)" }}>⚙️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>Generando tu reporte...</h2>
            <p style={{ fontSize: 16, color: "#1E3A5F", fontWeight: 500, animation: "pulse 2s ease-in-out infinite" }}>{loadMsg}</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 20 }}>Esto puede tomar 15-30 segundos</p>
          </div>
        </div>
      )}

      {/* REPORT RESULT */}
      {view === "report" && (
        <div style={{ maxWidth: 850, margin: "0 auto", padding: "40px 24px 80px", animation: "fadeUp .5s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✅</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#2D5D3F" }}>Reporte generado exitosamente</div>
                <div style={{ fontSize: 12, color: "#757575" }}>{REPORT_TYPES.find(r => r.id === reportType)?.label} · {form.curso} · {form.periodo}</div>
              </div>
            </div>
            <button onClick={reset} className="btn" style={{ padding: "10px 20px", background: "#F0F0F0", color: "#1E3A5F", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>+ Nuevo reporte</button>
          </div>

          {/* DOWNLOAD BAR */}
          <div style={{ background: "#F5F5F5", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: "1px solid rgba(74,95,224,.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1E3A5F", letterSpacing: 1.5, marginBottom: 12 }}>DESCARGAR REPORTE</div>
            <div className="dl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              <button className="dl-btn" onClick={() => downloadWord(report, fileName)}
                style={{ padding: "12px 10px", background: "#2B579A", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>
                📝 Word (.doc)
              </button>
              <button className="dl-btn" onClick={() => downloadPDF(report, fileName)}
                style={{ padding: "12px 10px", background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>
                📕 PDF
              </button>
              <button className="dl-btn" onClick={() => downloadExcel(report, fileName)}
                style={{ padding: "12px 10px", background: "#217346", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>
                📊 Excel (.csv)
              </button>
              <button className="dl-btn" onClick={() => printReport(report)}
                style={{ padding: "12px 10px", background: "#4A4A4A", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>
                🖨️ Imprimir
              </button>
            </div>
          </div>

          {/* Report content */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", border: "1px solid rgba(0,0,0,.04)", boxShadow: "0 4px 20px rgba(0,0,0,.04)", fontSize: 14, color: "#1a1a1a", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 500, overflowY: "auto" }}>
            {report}
          </div>

          {/* Copy + Edit */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button className="btn" onClick={copyReport} style={{ flex: 1, minWidth: 200, padding: 14, background: copied ? "#2D5D3F" : "linear-gradient(135deg,#1E3A5F,#6C7AE0)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 12 }}>
              {copied ? "✅ Copiado al portapapeles" : "📋 Copiar texto completo"}
            </button>
            <button className="btn" onClick={() => { setView("form"); setReport(""); }} style={{ padding: "14px 20px", background: "#F0F0F0", color: "#1E3A5F", fontSize: 14, fontWeight: 700, borderRadius: 12 }}>✏️ Editar datos</button>
          </div>

          {/* Share */}
          <div style={{ marginTop: 24, padding: "18px 20px", background: "#F5F5F5", borderRadius: 14, textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", margin: "0 0 8px" }}>¿Te fue útil? Comparte con un colega</p>
            <button className="dl-btn" onClick={() => {
              navigator.clipboard.writeText(`¡Prueba DocuIA! Genera reportes con IA en menos de 10 min: ${window.location.href}`);
              saveToSupabase("referrals", { email_from: form.email }); alert("Link copiado. ¡Envíalo por WhatsApp!");
            }} style={{ padding: "10px 28px", background: "#1F4A3A", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
              📤 Compartir por WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
