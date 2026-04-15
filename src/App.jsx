import { useState, useRef, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";

// ===== SUPABASE CONFIG =====
// Option 1: Set these directly here
// Option 2: Use VITE_SUPABASE_URL and VITE_SUPABASE_KEY env vars in Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";
const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_KEY);

async function saveToSupabase(table, data) {
  if (!supabaseEnabled) return null;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(data),
    });
  } catch {}
}

// ===== REPORT CONFIG =====
const SYSTEM_PROMPT = `Eres un asistente de redacción institucional para docentes de Fe y Alegría Ecuador. Generas reportes educativos completos, profesionales y listos para enviar a coordinación.

FORMATO INSTITUCIONAL OBLIGATORIO:
- Encabezado: "FE Y ALEGRÍA — UNIDAD EDUCATIVA [nombre]"
- Subtítulo con tipo de reporte, período y docente
- Secciones numeradas claramente separadas
- Lenguaje formal pero claro, español ecuatoriano
- Incluir recomendaciones pedagógicas al final
- Cerrar con firma del docente y fecha

REGLAS:
- Usa SOLO los datos proporcionados, NO inventes nombres ni datos
- Genera el reporte COMPLETO, listo para copiar y usar
- Si hay dificultades, genera recomendaciones pedagógicas específicas`;

const REPORT_TYPES = [
  { id: "semanal", label: "Informe Semanal", icon: "📅", desc: "Avance académico semanal" },
  { id: "calificaciones", label: "Reporte de Calificaciones", icon: "📊", desc: "Notas parciales o quimestrales" },
  { id: "asistencia", label: "Registro de Asistencia", icon: "📋", desc: "Control de asistencia" },
  { id: "dece", label: "Informe DECE", icon: "🧠", desc: "Consejería estudiantil" },
  { id: "planificacion", label: "Planificación (PUD)", icon: "📐", desc: "Planificación de unidad didáctica" },
];

function buildPrompt(type, data) {
  const rt = REPORT_TYPES.find(r => r.id === type);
  let p = `Genera un ${rt.label} completo con formato institucional de Fe y Alegría.\n\nDATOS:\n- Institución: ${data.institucion || "UE Fe y Alegría"}\n- Docente: ${data.docente}\n- Curso: ${data.curso}\n- Período: ${data.periodo}\n`;
  if (type === "semanal") p += `- Tema: ${data.tema}\n- Asistencia: ${data.asistencia}\n- Observaciones: ${data.observaciones}\n\nGenera informe semanal con: resumen, logros, dificultades, recomendaciones y plan siguiente semana.`;
  else if (type === "calificaciones") p += `- Calificaciones: ${data.calificaciones}\n- Observaciones: ${data.observaciones}\n\nGenera reporte de calificaciones con análisis de rendimiento y recomendaciones.`;
  else if (type === "asistencia") p += `- Asistencia: ${data.asistencia}\n- Observaciones: ${data.observaciones}\n\nGenera registro formal de asistencia con análisis y acciones sugeridas.`;
  else if (type === "dece") p += `- Caso: ${data.caso}\n- Observaciones: ${data.observaciones}\n\nGenera informe DECE formal con descripción, intervenciones, seguimiento y derivaciones.`;
  else if (type === "planificacion") p += `- Tema/Unidad: ${data.tema}\n- Objetivos: ${data.observaciones}\n\nGenera PUD completo con objetivos, destrezas, actividades, recursos, evaluación e indicadores.`;
  return p;
}

// ===== FIELD COMPONENT (must be outside App to avoid remount on each keystroke) =====
function Field({ label, k, ph, area, req, form, set }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
        {label} {req && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {area ? (
        <textarea value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} rows={3}
          style={{ width: "100%", padding: "12px 14px", border: "2px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#FAFBFF", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#4A5FE0"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
      ) : (
        <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
          style={{ width: "100%", padding: "12px 14px", border: "2px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#FAFBFF", outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = "#4A5FE0"} onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
      )}
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  const [view, setView] = useState("landing");
  const [reportType, setReportType] = useState(null);
  const [form, setForm] = useState({
    docente: "", email: "", institucion: "", curso: "", periodo: "",
    tema: "", asistencia: "", observaciones: "", calificaciones: "", caso: "",
  });
  const [report, setReport] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const formRef = useRef(null);

  const msgs = ["Analizando datos del curso...", "Estructurando el reporte...", "Redactando contenido institucional...", "Añadiendo recomendaciones pedagógicas...", "Formateando documento final..."];

  useEffect(() => { saveToSupabase("visitas", { referrer: document.referrer || "directo" }); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const generate = async () => {
    if (!form.docente || !form.curso || !form.periodo) { setError("Completa los campos obligatorios"); return; }
    setView("loading"); setError("");
    let mi = 0; setLoadMsg(msgs[0]);
    const iv = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadMsg(msgs[mi]); }, 2200);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(reportType, form), system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      clearInterval(iv);

      if (data.text) {
        setReport(data.text); setView("report");
        saveToSupabase("reportes", {
          email_docente: form.email, nombre_docente: form.docente,
          institucion: form.institucion, curso: form.curso, periodo: form.periodo,
          tipo_reporte: reportType, datos_ingresados: JSON.stringify(form),
          reporte_generado: data.text,
        });
      } else { setError(data.error || "No se pudo generar. Intenta de nuevo."); setView("form"); }
    } catch (e) { clearInterval(iv); setError("Error de conexión. Intenta de nuevo."); setView("form"); }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report); setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    saveToSupabase("reportes_copiados", { email_docente: form.email, tipo: reportType });
  };

  const reset = () => {
    setView("landing"); setReportType(null); setReport(""); setError("");
    setForm({ docente: "", email: "", institucion: "", curso: "", periodo: "", tema: "", asistencia: "", observaciones: "", calificaciones: "", caso: "" });
  };

  const canSubmit = form.docente && form.curso && form.periodo;

  return (
    <>
      <Analytics />
      <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .fade{animation:fadeUp .6s ease both}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
        .btn{transition:all .2s;cursor:pointer;border:none;outline:none}
        .btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(74,95,224,.35)}
        .btn:active{transform:scale(.97)}
        .card{transition:all .25s}
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}
        @media(max-width:700px){.g2{grid-template-columns:1fr!important}.hero-t{font-size:30px!important}.sn{font-size:30px!important}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,.05)", padding: "12px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={reset}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1A1F36", letterSpacing: -0.5 }}>DocuIA</span>
          </div>
          <button className="btn" onClick={scrollToForm} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
            Generar reporte gratis
          </button>
        </div>
      </nav>

      {/* HERO + LANDING */}
      {(view === "landing" || view === "form") && (
        <>
          <section style={{ background: "linear-gradient(170deg,#1A1F36 0%,#2D3561 50%,#4A5FE0 100%)", padding: "80px 24px 90px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(0,201,167,.08)" }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(74,95,224,.15)" }} />
            <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
              <div className="fade" style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,201,167,.15)", borderRadius: 20, marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#00C9A7" }}>🎓 Para docentes de Fe y Alegría</span>
              </div>
              <h1 className="fade d1 hero-t" style={{ fontSize: 46, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -1 }}>
                ¿Pierdes <span style={{ color: "#00C9A7" }}>6+ horas</span> semanales<br />haciendo reportes?
              </h1>
              <p className="fade d2" style={{ fontSize: 19, color: "rgba(255,255,255,.75)", lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 600 }}>
                DocuIA genera tus informes institucionales completos en <strong style={{ color: "#fff" }}>menos de 10 minutos</strong> con inteligencia artificial.
              </p>
              <button className="btn fade d3" onClick={scrollToForm} style={{ padding: "16px 40px", background: "#00C9A7", color: "#1A1F36", fontSize: 17, fontWeight: 800, borderRadius: 14 }}>
                Genera tu primer reporte gratis →
              </button>
              <p className="fade d4" style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 16 }}>Sin registro · Sin costo · Resultado inmediato</p>
            </div>
          </section>

          {/* STATS */}
          <section style={{ background: "#F7F8FC", padding: "0 24px" }}>
            <div className="g2" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", transform: "translateY(-40px)" }}>
              {[
                { num: "79%", label: "dedica +6 hrs/semana\na reportes", color: "#EF4444" },
                { num: "63%", label: "trabaja fuera\nde jornada", color: "#F59E0B" },
                { num: "47%", label: "repite datos\n3+ veces/semana", color: "#4A5FE0" },
                { num: "37%", label: "trabaja fines\nde semana", color: "#8B5CF6" },
              ].map((s, i) => (
                <div key={i} className="fade card" style={{
                  background: "#fff", padding: "28px 16px", textAlign: "center",
                  borderRight: i < 3 ? "1px solid #F0F0F0" : "none",
                  borderRadius: i === 0 ? "16px 0 0 16px" : i === 3 ? "0 16px 16px 0" : 0,
                  boxShadow: "0 4px 20px rgba(0,0,0,.04)", animationDelay: `${.1 + i * .1}s`,
                }}>
                  <div className="sn" style={{ fontSize: 42, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 1.4, whiteSpace: "pre-line" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PAIN POINTS */}
          <section style={{ padding: "40px 24px 70px", background: "#F7F8FC" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", margin: "0 0 10px", color: "#1A1F36" }}>El problema que resolvemos</h2>
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 16, marginBottom: 40 }}>Datos reales de 19 docentes encuestados en Fe y Alegría</p>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { icon: "⏱️", title: "Registro de calificaciones", pct: "74%", desc: "14 de 19 docentes lo hacen semanalmente. La tarea más universal y repetitiva.", color: "#EF4444" },
                  { icon: "📋", title: "Llenado de plataformas", pct: "68%", desc: "13 de 19 ingresan los mismos datos en múltiples sistemas. Redundancia pura.", color: "#F59E0B" },
                  { icon: "📝", title: "Elaboración de reportes", pct: "63%", desc: "12 de 19 redactan informes manuales para coordinación cada semana.", color: "#4A5FE0" },
                  { icon: "👥", title: "Seguimiento académico", pct: "58%", desc: "11 de 19 hacen informes individuales por estudiante. El más complejo.", color: "#8B5CF6" },
                ].map((p, i) => (
                  <div key={i} className="fade card" style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,0,0,.04)", boxShadow: "0 2px 12px rgba(0,0,0,.03)", animationDelay: `${i * .1}s` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 28 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1F36" }}>{p.title}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.pct} de docentes</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ padding: "70px 24px", background: "#fff" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 style={{ fontSize: 30, fontWeight: 800, textAlign: "center", margin: "0 0 10px", color: "#1A1F36" }}>¿Cómo funciona?</h2>
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 16, marginBottom: 50 }}>De 2 horas a menos de 10 minutos en 3 pasos</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
                {[
                  { s: "1", icon: "📝", title: "Ingresa datos mínimos", desc: "Curso, semana, tema, asistencia y una observación. Menos de 2 minutos." },
                  { s: "2", icon: "🤖", title: "La IA genera el reporte", desc: "DocuIA redacta el informe completo en formato institucional de Fe y Alegría." },
                  { s: "3", icon: "✅", title: "Copia y envía", desc: "Reporte listo para coordinación. Copia, pega en Word y listo." },
                ].map((st, i) => (
                  <div key={i} className="fade" style={{ textAlign: "center", maxWidth: 240, animationDelay: `${i * .15}s` }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px", background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 8px 24px rgba(74,95,224,.25)" }}>{st.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#4A5FE0", marginBottom: 6, letterSpacing: 1 }}>PASO {st.s}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1F36", marginBottom: 8 }}>{st.title}</div>
                    <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>{st.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 50 }}>
                <button className="btn" onClick={scrollToForm} style={{ padding: "16px 40px", background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", color: "#fff", fontSize: 16, fontWeight: 700, borderRadius: 14, boxShadow: "0 4px 20px rgba(74,95,224,.3)" }}>
                  Probar ahora — Es gratis →
                </button>
              </div>
            </div>
          </section>

          {/* FORM */}
          <section ref={formRef} style={{ padding: "70px 24px", background: "linear-gradient(170deg,#F7F8FC,#EEF0FF)" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 8px", color: "#1A1F36" }}>Genera tu reporte ahora</h2>
              <p style={{ textAlign: "center", color: "#6B7280", fontSize: 15, marginBottom: 30 }}>Elige el tipo de reporte e ingresa los datos mínimos</p>

              {!reportType ? (
                <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {REPORT_TYPES.map(rt => (
                    <div key={rt.id} className="card" onClick={() => setReportType(rt.id)}
                      style={{ background: "#fff", borderRadius: 14, padding: "20px 16px", textAlign: "center", cursor: "pointer", border: "2px solid rgba(74,95,224,.08)", boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{rt.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F36" }}>{rt.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>{rt.desc}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.06)", border: "1px solid rgba(74,95,224,.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{REPORT_TYPES.find(r => r.id === reportType)?.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#4A5FE0" }}>{REPORT_TYPES.find(r => r.id === reportType)?.label}</span>
                    </div>
                    <button onClick={() => setReportType(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>← Cambiar</button>
                  </div>

                  {error && <div style={{ padding: "10px 14px", background: "#FEF2F2", borderRadius: 10, fontSize: 13, color: "#DC2626", marginBottom: 16, border: "1px solid #FECACA" }}>⚠️ {error}</div>}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="Nombre del docente" k="docente" ph="Ej: Lcda. María Pérez" req form={form} set={set} />
                    <Field label="Email" k="email" ph="docente@feyalegria.edu.ec" form={form} set={set} />
                  </div>
                  <Field label="Institución" k="institucion" ph="Ej: UE Fe y Alegría La Dolorosa" form={form} set={set} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <Field label="Curso" k="curso" ph="Ej: 3ro B" req form={form} set={set} />
                    <Field label="Período" k="periodo" ph="Ej: Semana 7-11 abril" req form={form} set={set} />
                  </div>

                  {(reportType === "semanal" || reportType === "planificacion") && <Field label="Tema / Unidad" k="tema" ph="Ej: Fracciones - suma y resta" form={form} set={set} />}
                  {(reportType === "semanal" || reportType === "asistencia") && <Field label="Datos de asistencia" k="asistencia" ph="Ej: 28 presentes, 3 ausencias" form={form} set={set} />}
                  {reportType === "calificaciones" && <Field label="Datos de calificaciones" k="calificaciones" ph="Ej: Promedio: 7.2/10. 5 bajo 5.0." area form={form} set={set} />}
                  {reportType === "dece" && <Field label="Detalles del caso" k="caso" ph="Ej: Estudiante con bajo rendimiento repentino..." area form={form} set={set} />}
                  <Field label="Observaciones adicionales" k="observaciones" ph="Ej: Grupo con dificultades en operaciones básicas." area form={form} set={set} />

                  <button className="btn" onClick={generate} disabled={!canSubmit}
                    style={{ width: "100%", padding: 16, marginTop: 8, background: canSubmit ? "linear-gradient(135deg,#4A5FE0,#6C7AE0)" : "#CBD5E0", color: "#fff", fontSize: 16, fontWeight: 700, borderRadius: 12, cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 4px 20px rgba(74,95,224,.3)" : "none" }}>
                    🤖 Generar reporte con IA
                  </button>
                  <p style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF", marginTop: 10 }}>La IA generará el reporte completo en formato institucional</p>
                </div>
              )}
            </div>
          </section>

          {/* QUOTE */}
          <section style={{ padding: "60px 24px", background: "#fff" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: .15 }}>"</div>
              <p style={{ fontSize: 20, fontWeight: 500, color: "#374151", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 20px" }}>
                Los informes son diarios. Todos los días ciertos reportes son repetidos. Durante toda la mañana.
              </p>
              <p style={{ fontSize: 14, color: "#6B7280" }}>— Ivette Proaño, Inspectora General, Fe y Alegría</p>
            </div>
          </section>

          {/* INSTITUTIONAL CTA */}
          <section style={{ padding: "60px 24px", background: "linear-gradient(135deg,#1A1F36,#2D3561)" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>¿Quieres DocuIA para toda tu institución?</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", marginBottom: 28, lineHeight: 1.6 }}>Licencia institucional para todos los docentes. Un solo pago, reportes ilimitados.</p>
              <a href="mailto:docuia.feyalegria@gmail.com?subject=Interés en DocuIA institucional" className="btn" style={{ display: "inline-block", padding: "14px 36px", background: "#00C9A7", color: "#1A1F36", fontSize: 15, fontWeight: 700, borderRadius: 12, textDecoration: "none" }}>
                Contactar al equipo →
              </a>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ padding: "30px 24px", background: "#111318", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📄</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>DocuIA</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", margin: 0 }}>Fe y Alegría · PUCE · Emprendimiento Tecnológico 2026</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 6 }}>Piñero · Heredia · Zumárraga · Iza</p>
          </footer>
        </>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: 24 }}>
          <div style={{ textAlign: "center", animation: "fadeUp .4s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, margin: "0 auto 28px", background: "linear-gradient(135deg,#4A5FE0,#6C7AE0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, animation: "spin 3s linear infinite", boxShadow: "0 8px 30px rgba(74,95,224,.3)" }}>⚙️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1A1F36", margin: "0 0 12px" }}>Generando tu reporte...</h2>
            <p style={{ fontSize: 16, color: "#4A5FE0", fontWeight: 500, animation: "pulse 2s ease-in-out infinite" }}>{loadMsg}</p>
            <div style={{ width: 240, height: 5, background: "#E8EDFF", borderRadius: 3, margin: "28px auto 0", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#4A5FE0,#00C9A7)", borderRadius: 3, animation: "pulse 1.5s ease-in-out infinite", width: "65%" }} />
            </div>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 20 }}>Esto puede tomar 15-30 segundos</p>
          </div>
        </div>
      )}

      {/* REPORT */}
      {view === "report" && (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px", animation: "fadeUp .5s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✅</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>Reporte generado</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{REPORT_TYPES.find(r => r.id === reportType)?.label} · {form.curso} · {form.periodo}</div>
              </div>
            </div>
            <button onClick={reset} className="btn" style={{ padding: "10px 20px", background: "#F0F2FF", color: "#4A5FE0", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>+ Nuevo reporte</button>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", border: "1px solid rgba(0,0,0,.06)", boxShadow: "0 4px 20px rgba(0,0,0,.04)", fontSize: 14, color: "#1a1a1a", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 500, overflowY: "auto" }}>
            {report}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <button className="btn" onClick={copyReport} style={{ flex: 1, minWidth: 200, padding: 16, background: copied ? "#059669" : "linear-gradient(135deg,#4A5FE0,#6C7AE0)", color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 12, boxShadow: "0 4px 20px rgba(74,95,224,.25)" }}>
              {copied ? "✅ Copiado" : "📋 Copiar reporte completo"}
            </button>
            <button className="btn" onClick={() => { setView("form"); setReport(""); }} style={{ padding: "16px 24px", background: "#F0F2FF", color: "#4A5FE0", fontSize: 15, fontWeight: 700, borderRadius: 12 }}>✏️ Editar</button>
          </div>

          <div style={{ marginTop: 28, padding: "20px 24px", background: "#F7F8FC", borderRadius: 14, textAlign: "center", border: "1px solid rgba(74,95,224,.06)" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>¿Te fue útil? Comparte DocuIA con un colega</p>
            <button className="btn" onClick={() => {
              navigator.clipboard.writeText(`¡Prueba DocuIA! Genera reportes con IA en menos de 10 min: ${window.location.href}`);
              saveToSupabase("referrals", { email_from: form.email });
              alert("Link copiado. ¡Envíalo por WhatsApp!");
            }} style={{ padding: "10px 28px", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 10 }}>
              📤 Compartir por WhatsApp
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
