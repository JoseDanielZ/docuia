import { useState, useRef, useEffect } from "react";
import "./App.css";

import { REPORT_TYPES, buildPrompt, getRequiredFields, getSystemPrompt } from "./config";
import { saveToSupabase } from "./utils/supabase.js";
import { getUser, logout } from "./utils/auth.js";
import { truncateForLLM } from "./utils/formatoText.js";

import Navbar         from "./components/Navbar.jsx";
import LandingPage    from "./components/LandingPage.jsx";
import LoadingView    from "./components/LoadingView.jsx";
import ReportView     from "./components/ReportView.jsx";
import CursosView     from "./components/CursosView.jsx";
import PlantillasView from "./components/PlantillasView.jsx";
import HistorialView  from "./components/HistorialView.jsx";

const LOAD_MSGS = [
  "Analizando datos del curso...",
  "Estructurando el reporte...",
  "Redactando contenido institucional...",
  "Añadiendo recomendaciones pedagógicas...",
  "Verificando formato institucional...",
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

  // Cursos
  const [cursos,         setCursos]         = useState([]);
  const [selectedCurso,  setSelectedCurso]  = useState(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [cursoForm,      setCursoForm]      = useState({});

  // Formato institucional (subido en esta sesión o seleccionado de la lista)
  const [uploadingFormato, setUploadingFormato] = useState(false);
  const [formatoSubido,    setFormatoSubido]    = useState(null);
  const [formatoCompartir, setFormatoCompartir] = useState(false);
  const [formatoModo,      setFormatoModo]      = useState("estricto"); // 'estricto' | 'guia'
  const [formatosDisponibles, setFormatosDisponibles] = useState({ mios: [], compartidos: [] });

  // Plantillas
  const [plantillas, setPlantillas] = useState([]);

  // Historial
  const [reportes, setReportes] = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [currentReporteId, setCurrentReporteId] = useState(null);

  const user  = getUser();
  const token = getToken();

  useEffect(() => {
    if (user) {
      setFormState(p => ({ ...p, docente: user.user_metadata?.name || "", email: user.email || "" }));
      loadCursos();
      loadFormatos();
      loadPlantillas();
    }
    saveToSupabase("visitas", { referrer: document.referrer || "directo" });
  }, []);

  const set = (k, v) => setFormState(p => ({ ...p, [k]: v }));

  const scrollToForm = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  // ===== CURSOS =====
  async function loadCursos() {
    if (!token) return;
    try {
      const res  = await fetch('/api/cursos', { headers: authHeaders() });
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
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
      await fetch(`/api/cursos?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      setCursos(p => p.filter(c => c.id !== id));
    } catch { alert('Error al eliminar'); }
  }

  function selectCurso(curso) {
    setSelectedCurso(curso);
    if (!curso) return;
    setFormState(p => ({
      ...p,
      curso:          `${curso.grado} ${curso.paralelo ? '- ' + curso.paralelo : ''}`.trim(),
      asignatura:     curso.asignatura,
      numEstudiantes: curso.num_estudiantes?.toString() || '',
      jornadaTurno:   curso.jornada || '',
      institucion:    user?.user_metadata?.institucion || p.institucion || '',
    }));
  }

  // ===== FORMATOS =====
  async function loadFormatos() {
    if (!token) return;
    try {
      const res = await fetch('/api/formatos', { headers: authHeaders() });
      const data = await res.json();
      setFormatosDisponibles({
        mios: data.mios || [],
        compartidos: data.compartidos || [],
      });
    } catch (e) { console.error('Error loading formatos:', e); }
  }

  function selectFormato(f) {
    setFormatoSubido(f);
  }

  async function handleFormatoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'xlsx', 'xls'].includes(ext)) { alert('Solo PDF o Excel'); return; }
    if (!reportType) { alert('Selecciona primero el tipo de reporte'); return; }

    setUploadingFormato(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const res    = await fetch('/api/upload-formato', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            filename: file.name,
            content: base64,
            tipo_reporte: reportType,
            es_ejemplo: false,
            compartido: formatoCompartir,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setFormatoSubido(data.formato);
          // refrescar la lista (mis + compartidos)
          loadFormatos();
          alert(`Formato subido: ${data.formato.num_campos_detectados || 0} campos detectados${formatoCompartir ? ' · compartido con tu institución' : ''}`);
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

  // ===== PLANTILLAS =====
  async function loadPlantillas() {
    if (!token) return;
    try {
      const res = await fetch('/api/plantillas', { headers: authHeaders() });
      const data = await res.json();
      if (data.plantillas) setPlantillas(data.plantillas);
    } catch (e) { console.error('Error loading plantillas:', e); }
  }

  async function saveAsTemplate() {
    if (!token) { alert('Inicia sesión para guardar plantillas'); return; }
    if (!reportType) { alert('Selecciona un tipo de reporte primero'); return; }
    const nombre = prompt('Nombre de la plantilla:');
    if (!nombre?.trim()) return;
    try {
      const res = await fetch('/api/plantillas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ nombre: nombre.trim(), tipo_reporte: reportType, datos: form }),
      });
      const data = await res.json();
      if (data.success) {
        setPlantillas(p => [data.plantilla, ...p]);
        alert('Plantilla guardada');
      } else {
        alert(data.error || 'Error al guardar plantilla');
      }
    } catch { alert('Error al guardar plantilla'); }
  }

  async function deletePlantilla(id) {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      await fetch(`/api/plantillas?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      setPlantillas(p => p.filter(x => x.id !== id));
    } catch { alert('Error al eliminar plantilla'); }
  }

  function loadTemplate(p) {
    setReportType(p.tipo_reporte);
    setFormState({ ...p.datos });
    setView('form');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ===== HISTORIAL =====
  async function loadReportes() {
    if (!token) return;
    setHistorialLoading(true);
    try {
      const res = await fetch('/api/reportes', { headers: authHeaders() });
      const data = await res.json();
      setReportes(data.reportes || []);
    } catch (e) { console.error('Error loading reportes:', e); }
    setHistorialLoading(false);
  }

  async function openReportFromHistory(id) {
    try {
      const res = await fetch(`/api/reportes?id=${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.reporte) {
        const r = data.reporte;
        setReportType(r.tipo_reporte);
        try {
          const datos = typeof r.datos_ingresados === 'string'
            ? JSON.parse(r.datos_ingresados)
            : (r.datos_ingresados || {});
          setFormState(datos);
        } catch { /* ignorar */ }
        setReport(r.reporte_generado || '');
        setCurrentReporteId(r.id);
        setView('report');
      } else {
        alert('No se encontró el reporte');
      }
    } catch { alert('Error al abrir reporte'); }
  }

  async function deleteReporte(id) {
    if (!confirm('¿Archivar este reporte? No se mostrará más en tu historial.')) return;
    try {
      await fetch(`/api/reportes?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      setReportes(p => p.filter(x => x.id !== id));
    } catch { alert('Error al archivar'); }
  }

  async function saveReportEdits(newText) {
    if (!currentReporteId || !token) return;
    try {
      await fetch(`/api/reportes?id=${currentReporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ reporte_generado: newText }),
      });
    } catch { /* silencioso */ }
  }

  // ===== GENERAR REPORTE =====
  const generate = async () => {
    const requiredFields = reportType ? getRequiredFields(reportType) : ["docente", "curso", "periodo"];
    const missing = requiredFields.filter(k => !form[k]?.trim());
    if (missing.length > 0) { setError(`Complete los campos obligatorios: ${missing.join(', ')}`); return; }

    setView("loading");
    setError("");
    setCurrentReporteId(null);
    let mi = 0;
    setLoadMsg(LOAD_MSGS[0]);
    const iv = setInterval(() => { mi = (mi + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[mi]); }, 2200);

    try {
      // Si el docente subió un formato, lo limpiamos y se lo pasamos al builder
      // para que el LLM REPLIQUE ese formato (estructura por defecto desactivada).
      const formatoTexto = formatoSubido?.contenido_extraido
        ? truncateForLLM(formatoSubido.contenido_extraido, 12000)
        : "";

      const finalPrompt  = buildPrompt(reportType, form, {
        formatoTexto,
        modo: formatoModo,
      });
      const systemPrompt = getSystemPrompt({ hasFormato: !!formatoTexto });

      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, system: systemPrompt }),
      });
      const data = await res.json();
      clearInterval(iv);

      if (data.text) {
        setReport(data.text);
        setView("report");
        // Guardar en historial (con user_id si hay sesión, así aparece en HistorialView)
        saveToSupabase("reportes", {
          user_id:          user?.id || null,
          email_docente:    form.email,
          nombre_docente:   form.docente,
          institucion:      form.institucion,
          curso:            form.curso,
          periodo:          form.periodo,
          tipo_reporte:     reportType,
          datos_ingresados: form,
          reporte_generado: data.text,
        });
        // Recargar historial en background
        if (token) loadReportes();
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
    setFormState(user ? { docente: user.user_metadata?.name || "", email: user.email || "" } : {});
    setSelectedCurso(null);
    setFormatoSubido(null);
    setCurrentReporteId(null);
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
        onPlantillasClick={() => setView("plantillas")}
        onHistorialClick={() => { setView("historial"); loadReportes(); }}
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

      {view === "plantillas" && (
        <PlantillasView
          plantillas={plantillas}
          deletePlantilla={deletePlantilla}
          loadTemplate={loadTemplate}
          goBack={() => setView("form")}
        />
      )}

      {view === "historial" && (
        <HistorialView
          reportes={reportes}
          openReport={openReportFromHistory}
          deleteReport={deleteReporte}
          goBack={() => setView("form")}
          loading={historialLoading}
        />
      )}

      {(view === "landing" || view === "form") && (
        <LandingPage
          reportType={reportType}
          setReportType={type => {
            setReportType(type);
            // Si el formato seleccionado es de otro tipo, lo deseleccionamos
            // para evitar mezclar (ej. formato de "planificacion" en "semanal").
            if (formatoSubido && formatoSubido.tipo_reporte && formatoSubido.tipo_reporte !== type) {
              setFormatoSubido(null);
            }
          }}
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
          formatosDisponibles={formatosDisponibles}
          formatoSubido={formatoSubido}
          selectFormato={selectFormato}
          clearFormato={() => setFormatoSubido(null)}
          uploadingFormato={uploadingFormato}
          handleFormatoUpload={handleFormatoUpload}
          formatoCompartir={formatoCompartir}
          setFormatoCompartir={setFormatoCompartir}
          formatoModo={formatoModo}
          setFormatoModo={setFormatoModo}
          saveAsTemplate={saveAsTemplate}
          plantillas={plantillas}
          loadTemplate={loadTemplate}
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
          onSaveEdits={currentReporteId ? saveReportEdits : null}
        />
      )}
    </div>
  );
}
