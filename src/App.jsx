import { useState, useRef, useEffect } from "react";
import "./App.css";

import { SYSTEM_PROMPT, REPORT_TYPES, buildPrompt, getRequiredFields } from "./config";
import { saveToSupabase } from "./utils/supabase.js";
import { getUser, logout } from "./utils/auth.js";

import Navbar      from "./components/Navbar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import LoadingView from "./components/LoadingView.jsx";
import ReportView  from "./components/ReportView.jsx";
import CursosView  from "./components/CursosView.jsx";

const LOAD_MSGS = [
  "Analizando datos del curso...",
  "Estructurando el reporte...",
  "Redactando contenido institucional...",
  "Añadiendo recomendaciones pedagógicas...",
  "Verificando formato de Fe y Alegría...",
  "Formateando documento final...",
];

function getToken() { return localStorage.getItem('docuia_token'); }

export default function App() {
  const [view,       setView]      = useState("landing");
  const [reportType, setReportType] = useState(null);
  const [form,       setFormState] = useState({});
  const [report,     setReport]    = useState("");
  const [error,      setError]     = useState("");
  const [copied,     setCopied]    = useState(false);
  const [loadMsg,    setLoadMsg]   = useState("");
  const formRef = useRef(null);

  const [cursos,         setCursos]         = useState([]);
  const [selectedCurso,  setSelectedCurso]  = useState(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [cursoForm,      setCursoForm]      = useState({});

  const [uploadingFormato, setUploadingFormato] = useState(false);
  const [formatoSubido,    setFormatoSubido]    = useState(null);

  const user  = getUser();
  const token = getToken();

  useEffect(() => {
    if (user) {
      setFormState(p => ({ ...p, docente: user.user_metadata?.name || "", email: user.email || "" }));
      loadCursos();
    }
    saveToSupabase("visitas", { referrer: document.referrer || "directo" });
  }, []);

  const set = (k, v) => setFormState(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ===== CURSOS CRUD =====
  async function loadCursos() {
    if (!token) return;
    try {
      const res  = await fetch('/api/cursos', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.cursos) setCursos(data.cursos);
    } catch (e) { console.error('Error loading cursos:', e); }
  }

  async function createCurso() {
    if (!cursoForm.nombre || !cursoForm.grado || !cursoForm.asignatura) {
      alert('Nombre, grado y asignatura son obligatorios'); return;
    }
    try {
      const res  = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(cursoForm),
      });
      const data = await res.json();
      if (data.success) {
        setCursos(p => [data.curso, ...p]);
        setCursoForm({});
        setShowCursoModal(false);
      }
    } catch { alert('Error al crear curso'); }
  }

  async function deleteCurso(id) {
    if (!confirm('¿Eliminar este curso?')) return;
    try {
      await fetch(`/api/cursos?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCursos(p => p.filter(c => c.id !== id));
    } catch { alert('Error al eliminar'); }
  }

  function selectCurso(curso) {
    if (!curso) return;
    setSelectedCurso(curso);
    setFormState(p => ({
      ...p,
      curso:          `${curso.grado} ${curso.paralelo ? '- ' + curso.paralelo : ''}`.trim(),
      asignatura:     curso.asignatura,
      numEstudiantes: curso.num_estudiantes?.toString() || '',
      jornadaTurno:   curso.jornada || '',
      institucion:    user?.user_metadata?.institucion || p.institucion || '',
    }));
  }

  // ===== UPLOAD FORMATO =====
  async function handleFormatoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'xlsx', 'xls'].includes(ext)) { alert('Solo PDF o Excel'); return; }

    setUploadingFormato(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const res    = await fetch('/api/upload-formato', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ filename: file.name, content: base64, tipo_reporte: reportType, es_ejemplo: false }),
        });
        const data = await res.json();
        if (data.success) {
          setFormatoSubido(data.formato);
          alert(`Formato subido: ${data.formato.num_campos_detectados} campos detectados`);
        } else {
          alert(data.error || 'Error al subir formato');
        }
        setUploadingFormato(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Error al procesar archivo');
      setUploadingFormato(false);
    }
  }

  // ===== GENERATE REPORT =====
  const generate = async () => {
    const requiredFields = reportType ? getRequiredFields(reportType) : ["docente", "curso", "periodo"];
    const missing = requiredFields.filter(k => !form[k]?.trim());
    if (missing.length > 0) { setError(`Complete los campos obligatorios: ${missing.join(', ')}`); return; }

    setView("loading");
    setError("");
    let mi = 0;
    setLoadMsg(LOAD_MSGS[0]);
    const iv = setInterval(() => { mi = (mi + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[mi]); }, 2200);

    try {
      let finalPrompt = buildPrompt(reportType, form);

      if (formatoSubido?.contenido_extraido) {
        finalPrompt += `\n\nFORMATO INSTITUCIONAL PROPORCIONADO POR EL DOCENTE:\nEl docente ha subido el siguiente formato que usa su institución. Usa esta estructura como guía adicional para el reporte:\n\n${formatoSubido.contenido_extraido.substring(0, 2000)}\n`;
      }

      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      clearInterval(iv);

      if (data.text) {
        setReport(data.text);
        setView("report");
        saveToSupabase("reportes", {
          email_docente:    form.email,
          nombre_docente:   form.docente,
          institucion:      form.institucion,
          curso:            form.curso,
          periodo:          form.periodo,
          tipo_reporte:     reportType,
          datos_ingresados: JSON.stringify(form),
          reporte_generado: data.text,
        });
      } else {
        setError(data.error || "No se pudo generar. Intenta de nuevo.");
        setView("form");
      }
    } catch {
      clearInterval(iv);
      setError("Error de conexión. Intenta de nuevo.");
      setView("form");
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    saveToSupabase("reportes_copiados", { email_docente: form.email, tipo: reportType });
  };

  const reset = () => {
    setView("landing");
    setReportType(null);
    setReport("");
    setError("");
    setFormState({});
    setSelectedCurso(null);
    setFormatoSubido(null);
  };

  const requiredFields = reportType ? getRequiredFields(reportType) : ["docente", "curso", "periodo"];
  const canSubmit      = requiredFields.every(k => form[k]?.trim());

  const fileName = `DocuIA_${REPORT_TYPES.find(r => r.id === reportType)?.label || "Reporte"}_${form.curso || ""}_${form.periodo || ""}`
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_\- ]/g, "")
    .replace(/\s+/g, "_");

  return (
    <div className="app-root">
      <Navbar
        user={user}
        logout={logout}
        scrollToForm={scrollToForm}
        onLogoClick={reset}
        cursos={cursos}
        onCursosClick={() => setView("cursos")}
      />

      {view === "cursos" && (
        <CursosView
          cursos={cursos}
          showModal={showCursoModal}
          setShowModal={setShowCursoModal}
          cursoForm={cursoForm}
          setCursoForm={setCursoForm}
          createCurso={createCurso}
          deleteCurso={deleteCurso}
        />
      )}

      {(view === "landing" || view === "form") && (
        <LandingPage
          reportType={reportType}
          setReportType={type => { setReportType(type); setFormState({}); }}
          form={form}
          set={set}
          generate={generate}
          canSubmit={canSubmit}
          error={error}
          scrollToForm={scrollToForm}
          formRef={formRef}
          user={user}
          cursos={cursos}
          selectedCurso={selectedCurso}
          selectCurso={selectCurso}
          uploadingFormato={uploadingFormato}
          formatoSubido={formatoSubido}
          handleFormatoUpload={handleFormatoUpload}
        />
      )}

      {view === "loading" && <LoadingView loadMsg={loadMsg} />}

      {view === "report" && (
        <ReportView
          report={report}
          reportType={reportType}
          form={form}
          fileName={fileName}
          reset={reset}
          copyReport={copyReport}
          copied={copied}
        />
      )}
    </div>
  );
}
