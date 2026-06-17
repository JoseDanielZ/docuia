import { useState, useRef, useEffect } from "react";
import "./App.css";

import { REPORT_TYPES, FORM_FIELDS, buildPrompt, getRequiredFields, isFeAlegriaType } from "./config";
import {
  mergeFormIntoTemplateData, serializeFeAReport, normalizeSemanas, parseStoredReport,
} from "./config/feAlegriaSchemas.js";
import { recordVisita } from "./utils/telemetry.js";
import { fetchMe, logout, authFetch } from "./utils/auth.js";
import { truncateForLLM } from "./utils/formatoText.js";
import { useToast } from "./components/Toast.jsx";

import Navbar         from "./components/Navbar.jsx";
import LandingPage    from "./components/LandingPage.jsx";
import LoadingView    from "./components/LoadingView.jsx";
import ReportView         from "./components/ReportView.jsx";
import FeAlegriaReportView from "./components/FeAlegriaReportView.jsx";
import CursosView     from "./components/CursosView.jsx";
import PlantillasView from "./components/PlantillasView.jsx";
import HistorialView  from "./components/HistorialView.jsx";
import DashboardView    from "./components/DashboardView.jsx";
import OnboardingModal  from "./components/OnboardingModal.jsx";
import AssistantBot     from "./components/assistant/AssistantBot.jsx";
import { useTheme }     from "./hooks/useTheme.js";

const DRAFT_KEY  = 'docuia_draft';
const DRAFT_MAX  = 512 * 1024; // 512 KB
const PAGE_LIMIT = 20;

const LOAD_MSGS = [
  "Analizando datos del curso...",
  "Estructurando el reporte...",
  "Redactando contenido institucional...",
  "Añadiendo recomendaciones pedagógicas...",
  "Verificando formato institucional...",
  "Formateando documento final...",
];

function parseSSEChunk(raw) {
  let content = '';
  const lines = raw.split('\n');
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') continue;
    try {
      const parsed = JSON.parse(data);
      content += parsed.choices?.[0]?.delta?.content ?? '';
    } catch { /* skip malformed chunks */ }
  }
  return content;
}

export default function App() {
  const toast = useToast();
  const [theme, toggleTheme] = useTheme();

  const [view,       setView]      = useState("landing");
  const [reportType, setReportType] = useState(null);
  const [form,       setFormState] = useState({});
  const [report,     setReport]    = useState("");
  const [streaming,  setStreaming]  = useState(false);
  const [error,      setError]     = useState("");
  const [copied,     setCopied]    = useState(false);
  const [loadMsg,    setLoadMsg]   = useState("");
  const formRef = useRef(null);

  // Cursos
  const [cursos,         setCursos]         = useState([]);
  const [selectedCurso,  setSelectedCurso]  = useState(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [cursoForm,      setCursoForm]      = useState({});
  const [editingCursoId, setEditingCursoId] = useState(null);

  // Formato institucional
  const [uploadingFormato,    setUploadingFormato]    = useState(false);
  const [formatoSubido,       setFormatoSubido]       = useState(null);
  const [formatoCompartir,    setFormatoCompartir]    = useState(false);
  const [formatoModo,         setFormatoModo]         = useState("estricto");
  const [formatosDisponibles, setFormatosDisponibles] = useState({ mios: [], compartidos: [] });

  // Plantillas
  const [plantillas, setPlantillas] = useState([]);

  // Borrador automático
  const [draftRestored, setDraftRestored] = useState(false);

  // Métricas server-side
  const [metricas, setMetricas] = useState(null);

  // Historial (paginado)
  const [reportes,        setReportes]        = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialHasMore, setHistorialHasMore] = useState(false);
  const [historialOffset,  setHistorialOffset]  = useState(0);
  const [currentReporteId,      setCurrentReporteId]      = useState(null);
  const [currentReporteFeedback, setCurrentReporteFeedback] = useState(null);
  const [showOnboarding,  setShowOnboarding]  = useState(false);
  const [erroresForm,     setErroresForm]     = useState({});
  const [user,            setUser]            = useState(null);

  useEffect(() => {
    fetchMe().then(me => {
      setUser(me);
      if (me) {
        setFormState(p => ({
          ...p,
          docente:     me.name        || me.user_metadata?.name        || "",
          email:       me.email       || "",
          institucion: me.institucion || me.user_metadata?.institucion || p.institucion || "",
          cargo:       me.cargo       || me.user_metadata?.cargo       || p.cargo       || "",
        }));
      }
    });
    recordVisita(document.referrer || "directo");

    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { form: savedForm, reportType: savedType } = JSON.parse(saved);
        const skip = new Set(['docente', 'email']);
        const formData = Object.fromEntries(Object.entries(savedForm || {}).filter(([k]) => !skip.has(k)));
        const hasContent = Object.values(formData).some(v => v?.toString().trim());
        if (hasContent || savedType) {
          setFormState(p => ({ ...p, ...formData }));
          if (savedType) setReportType(savedType);
          setDraftRestored(true);
        }
      }
    } catch { /* borrador corrupto */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar datos cuando el usuario esté disponible (evita el problema de closure
  // donde setUser() no actualiza user en el mismo tick del effect anterior)
  useEffect(() => {
    if (!user) return;
    loadCursos();
    loadFormatos();
    loadPlantillas();
    loadReportes(true);
    loadMetricas();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-guardar borrador (debounce 800ms, con límite de tamaño)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const serialized = JSON.stringify({ form, reportType });
        if (serialized.length < DRAFT_MAX) localStorage.setItem(DRAFT_KEY, serialized);
      } catch { /* ignorar */ }
    }, 800);
    return () => clearTimeout(t);
  }, [form, reportType]);

  const set = (k, v) => {
    setFormState(p => ({ ...p, [k]: v }));
    if (erroresForm[k]) setErroresForm(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const scrollToForm = () => {
    setView("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // ===== CURSOS =====
  async function loadCursos() {
    if (!user) return;
    try {
      const res  = await authFetch('/api/cursos');
      const data = await res.json();
      if (data.cursos) setCursos(data.cursos);
    } catch { toast.error('No se pudieron cargar tus cursos. Recarga la página.'); }
  }

  async function createCurso() {
    if (!cursoForm.nombre || !cursoForm.grado || !cursoForm.asignatura) {
      toast.warning('Nombre, grado y asignatura son obligatorios'); return;
    }
    try {
      const res  = await authFetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoForm),
      });
      const data = await res.json();
      if (data.success) {
        setCursos(p => [data.curso, ...p]);
        setCursoForm({});
        setShowCursoModal(false);
        toast.success('Curso creado correctamente');
      } else {
        toast.error(data.error || 'Error al crear curso');
      }
    } catch { toast.error('Error al crear curso'); }
  }

  async function updateCurso() {
    if (!cursoForm.nombre || !cursoForm.grado || !cursoForm.asignatura) {
      toast.warning('Nombre, grado y asignatura son obligatorios'); return;
    }
    try {
      const res  = await authFetch(`/api/cursos?id=${editingCursoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoForm),
      });
      const data = await res.json();
      if (data.success) {
        setCursos(p => p.map(c => c.id === editingCursoId ? data.curso : c));
        setCursoForm({});
        setEditingCursoId(null);
        setShowCursoModal(false);
        toast.success('Curso actualizado correctamente');
      } else {
        toast.error(data.error || 'Error al actualizar curso');
      }
    } catch { toast.error('Error al actualizar el curso'); }
  }

  async function deleteCurso(id) {
    const ok = await toast.confirm('¿Eliminar este curso?', {
      confirmLabel: 'Eliminar', danger: true,
    });
    if (!ok) return;
    try {
      await authFetch(`/api/cursos?id=${id}`, { method: 'DELETE' });
      setCursos(p => p.filter(c => c.id !== id));
      toast.success('Curso eliminado');
    } catch { toast.error('Error al eliminar el curso'); }
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
      institucion:    user?.institucion || user?.user_metadata?.institucion || p.institucion || '',
    }));
  }

  // ===== FORMATOS =====
  async function loadFormatos() {
    if (!user) return;
    try {
      const res  = await authFetch('/api/formatos');
      const data = await res.json();
      setFormatosDisponibles({ mios: data.mios || [], compartidos: data.compartidos || [] });
    } catch { /* silencioso */ }
  }

  async function selectFormato(formato) {
    if (!formato) { setFormatoSubido(null); return; }
    if (formato.contenido_extraido) { setFormatoSubido(formato); return; }
    try {
      const res  = await authFetch(`/api/formatos?id=${formato.id}`);
      const data = await res.json();
      setFormatoSubido(data.formato ?? formato);
    } catch {
      setFormatoSubido(formato);
    }
  }

  async function handleFormatoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'xlsx', 'xls'].includes(ext)) { toast.warning('Solo se admiten archivos PDF o Excel (.pdf, .xlsx, .xls)'); return; }
    if (file.size > 25 * 1024 * 1024) { toast.warning('El archivo supera 25 MB. Usa un archivo más liviano.'); return; }
    if (!reportType) { toast.warning('Selecciona primero el tipo de reporte antes de subir el formato'); return; }

    setUploadingFormato(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        try {
          const res  = await authFetch('/api/upload-formato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name, content: base64,
              tipo_reporte: reportType, es_ejemplo: false, compartido: formatoCompartir,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setFormatoSubido(data.formato);
            loadFormatos();
            const campos = data.formato.num_campos_detectados || 0;
            toast.success(`Formato subido: ${campos} campo${campos !== 1 ? 's' : ''} detectado${campos !== 1 ? 's' : ''}${formatoCompartir ? ' · compartido con tu institución' : ''}`);
          } else {
            toast.error(data.error || 'Error al subir formato');
          }
        } catch { toast.error('Error al subir el formato'); }
        setUploadingFormato(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Error al procesar el archivo');
      setUploadingFormato(false);
    }
  }

  // ===== PLANTILLAS =====
  async function loadPlantillas() {
    if (!user) return;
    try {
      const res  = await authFetch('/api/plantillas');
      const data = await res.json();
      if (data.plantillas) setPlantillas(data.plantillas);
    } catch { /* silencioso */ }
  }

  async function saveAsTemplate() {
    if (!user) { toast.warning('Inicia sesión para guardar plantillas'); return; }
    if (!reportType) { toast.warning('Selecciona un tipo de reporte primero'); return; }
    const nombre = await toast.prompt('Nombre de la plantilla:', { placeholder: 'Ej: Semana 1 - 8vo B' });
    if (!nombre) return;
    try {
      const res  = await authFetch('/api/plantillas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tipo_reporte: reportType, datos: form }),
      });
      const data = await res.json();
      if (data.success) {
        setPlantillas(p => [data.plantilla, ...p]);
        toast.success('Plantilla guardada correctamente');
      } else {
        toast.error(data.error || 'Error al guardar plantilla');
      }
    } catch { toast.error('Error al guardar la plantilla'); }
  }

  async function deletePlantilla(id) {
    const ok = await toast.confirm('¿Eliminar esta plantilla?', {
      confirmLabel: 'Eliminar', danger: true,
    });
    if (!ok) return;
    try {
      await authFetch(`/api/plantillas?id=${id}`, { method: 'DELETE' });
      setPlantillas(p => p.filter(x => x.id !== id));
      toast.success('Plantilla eliminada');
    } catch { toast.error('Error al eliminar la plantilla'); }
  }

  function loadTemplate(p) {
    setReportType(p.tipo_reporte);
    setFormState({ ...p.datos });
    setView('form');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ===== MÉTRICAS =====
  async function loadMetricas() {
    if (!user) return;
    try {
      const res  = await authFetch('/api/metricas');
      const data = await res.json();
      if (data.total_reportes !== undefined) setMetricas(data);
    } catch { /* silencioso — el dashboard usa cálculo local como fallback */ }
  }

  // ===== HISTORIAL (paginado) =====
  async function loadReportes(reset = true) {
    if (!user) return;
    setHistorialLoading(true);
    const offset = reset ? 0 : historialOffset;
    try {
      const res  = await authFetch(`/api/reportes?limit=${PAGE_LIMIT}&offset=${offset}`);
      const data = await res.json();
      const rows = data.reportes || [];
      setReportes(p => reset ? rows : [...p, ...rows]);
      setHistorialHasMore(data.hasMore ?? false);
      setHistorialOffset(offset + rows.length);
      if (reset && rows.length === 0 && !localStorage.getItem('docuia_onboarding_done')) {
        setShowOnboarding(true);
      }
    } catch { toast.error('Error al cargar el historial'); }
    setHistorialLoading(false);
  }

  async function loadMoreReportes() {
    await loadReportes(false);
  }

  async function openReportFromHistory(reporteOrId) {
    const id = typeof reporteOrId === 'string' ? reporteOrId : reporteOrId?.id;
    try {
      const res  = await authFetch(`/api/reportes?id=${id}`);
      const data = await res.json();
      if (data.reporte) {
        const r = data.reporte;
        setReportType(r.tipo_reporte);
        try {
          const datos = typeof r.datos_ingresados === 'string'
            ? JSON.parse(r.datos_ingresados) : (r.datos_ingresados || {});
          setFormState(datos);
        } catch { /* ignorar */ }
        setReport(r.reporte_generado || '');
        setCurrentReporteId(r.id);
        setCurrentReporteFeedback(r.feedback ?? null);
        setView('report');
      } else {
        toast.error('No se encontró el reporte');
      }
    } catch { toast.error('Error al abrir el reporte'); }
  }

  async function deleteReporte(id) {
    const ok = await toast.confirm(
      '¿Archivar este reporte? No se mostrará más en tu historial.',
      { confirmLabel: 'Archivar', danger: true }
    );
    if (!ok) return;
    try {
      await authFetch(`/api/reportes?id=${id}`, { method: 'DELETE' });
      setReportes(p => p.filter(x => x.id !== id));
      toast.success('Reporte archivado');
    } catch { toast.error('Error al archivar el reporte'); }
  }

  async function duplicateReporte(id) {
    const res = await authFetch(`/api/reportes?id=${id}`);
    const data = await res.json();
    if (!data.reporte) throw new Error('No se encontró el reporte');
    const r = data.reporte;
    await authFetch('/api/reportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_reporte:     r.tipo_reporte,
        curso:            r.curso ? r.curso + ' (copia)' : '(copia)',
        periodo:          r.periodo,
        datos_ingresados: r.datos_ingresados,
        reporte_generado: r.reporte_generado,
      }),
    });
    loadReportes(true);
  }

  async function saveReportEdits(payload) {
    if (!currentReporteId || !user) return;
    const text = typeof payload === 'string'
      ? payload
      : serializeFeAReport(reportType, payload);
    try {
      await authFetch(`/api/reportes?id=${currentReporteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporte_generado: text }),
      });
      if (typeof payload !== 'string') setReport(text);
    } catch { /* silencioso */ }
  }

  // ===== GENERAR REPORTE (con streaming SSE) =====
  const generate = async () => {
    if (!user) { setError("Inicia sesión para generar reportes."); return; }
    const requiredFields = reportType ? getRequiredFields(reportType) : ["docente", "curso", "periodo"];
    const errores = {};
    requiredFields.forEach(k => { if (!form[k]?.trim()) errores[k] = 'Campo requerido'; });
    if (!reportType) errores._tipo = 'Selecciona el tipo de reporte';
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      toast.error('Completa los campos requeridos antes de generar');
      const firstKey = Object.keys(errores).find(k => !k.startsWith('_'));
      if (firstKey) {
        const el = document.querySelector(`[data-field="${firstKey}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      }
      return;
    }
    setErroresForm({});

    setView("loading");
    setError("");
    setCurrentReporteId(null);
    setReport("");

    let msgIdx = 0;
    setLoadMsg(LOAD_MSGS[0]);
    const iv = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOAD_MSGS.length;
      setLoadMsg(LOAD_MSGS[msgIdx]);
    }, 2200);

    try {
      const formatoTexto = (!isFeAlegriaType(reportType) && formatoSubido?.contenido_extraido)
        ? truncateForLLM(formatoSubido.contenido_extraido, 12000) : "";

      const finalPrompt = buildPrompt(reportType, form, { formatoTexto, modo: formatoModo });
      const isFeA = isFeAlegriaType(reportType) && !formatoTexto;

      const res = await authFetch("/api/generate", {
        method: "POST",
        headers: isFeA
          ? { "Content-Type": "application/json" }
          : { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ prompt: finalPrompt, type: reportType }),
      });

      if (!res.ok) {
        clearInterval(iv);
        const errData = await res.json().catch(() => ({}));
        const status  = res.status;
        let msg = errData.error || "No se pudo generar el reporte. Intenta de nuevo.";
        if (status === 401) msg = "Tu sesión expiró. Recarga la página e inicia sesión nuevamente.";
        else if (status === 429) msg = "Alcanzaste el límite de reportes por hora. Espera unos minutos e intenta de nuevo.";
        setError(msg);
        setView("form");
        return;
      }

      const contentType = res.headers.get('content-type') || '';

      // ── Fe y Alegría JSON ────────────────────────────────────────────────
      if (isFeA || contentType.includes('application/json')) {
        const data = await res.json();
        if (data.format === 'fea_v2' && data.data && typeof data.data === 'object') {
          let merged = mergeFormIntoTemplateData(reportType, form, data.data);
          if (reportType === 'microcurricular') {
            merged = normalizeSemanas(merged, form.num_semanas);
          }
          const serialized = serializeFeAReport(reportType, merged);
          setReport(serialized);
          setView("report");
          clearInterval(iv);
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
          setDraftRestored(false);
          saveGeneratedReport(serialized);
          return;
        }
        if (data.text?.trim()) {
          setReport(data.text);
          setView("report");
          clearInterval(iv);
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
          setDraftRestored(false);
          saveGeneratedReport(data.text);
          return;
        }
        clearInterval(iv);
        setError(data.error || "No se pudo generar. Intenta de nuevo.");
        setView("form");
        return;
      }

      // ── Streaming SSE ──────────────────────────────────────────────────
      if (contentType.includes('text/event-stream')) {
        setStreaming(true);
        setView("report");
        clearInterval(iv);

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer  = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer  += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const chunk = parseSSEChunk(line + '\n');
            if (chunk) { fullText += chunk; setReport(fullText); }
          }
        }
        // Flush remainder
        if (buffer) {
          const chunk = parseSSEChunk(buffer);
          if (chunk) { fullText += chunk; setReport(fullText); }
        }

        setStreaming(false);
        if (!fullText.trim()) {
          setReport("");
          setError("La IA no devolvió contenido. Verifica la configuración del servidor e intenta de nuevo.");
          setView("form");
          return;
        }
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
        setDraftRestored(false);
        saveGeneratedReport(fullText);

      // ── JSON fallback ──────────────────────────────────────────────────
      } else {
        const data = await res.json();
        if (data.text?.trim()) {
          setReport(data.text);
          setView("report");
          clearInterval(iv);
          try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
          setDraftRestored(false);
          saveGeneratedReport(data.text);
        } else {
          clearInterval(iv);
          setError(data.error || "No se pudo generar. Intenta de nuevo.");
          setView("form");
        }
      }

    } catch {
      clearInterval(iv);
      setStreaming(false);
      setError("Error de conexión. Intenta de nuevo.");
      setView("form");
    }
  };

  async function saveGeneratedReport(text) {
    try {
      const saveRes = await authFetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_docente:    form.email,
          nombre_docente:   form.docente,
          institucion:      form.institucion,
          curso:            form.curso,
          periodo:          form.periodo,
          tipo_reporte:     reportType,
          datos_ingresados: form,
          reporte_generado: text,
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.reporte?.id) setCurrentReporteId(saveData.reporte.id);
      else if (!saveRes.ok) toast.warn('El reporte se generó pero no se pudo guardar en el historial.');
    } catch { toast.warn('El reporte se generó pero no se pudo guardar en el historial.'); }
  }

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (user) {
      authFetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "reporte_copiado", tipo: reportType }),
      }).catch(() => {});
    }
  };

  const recordReferralShare = () => {
    if (!user) return;
    authFetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "referral" }),
    }).catch(() => {});
  };

  const reset = () => {
    setView("landing");
    setReportType(null);
    setReport("");
    setError("");
    setFormState(user ? { docente: user.name || user.user_metadata?.name || "", email: user.email || "" } : {});
    setSelectedCurso(null);
    setFormatoSubido(null);
    setCurrentReporteId(null);
    setCurrentReporteFeedback(null);
    setStreaming(false);
    setErroresForm({});
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
    setDraftRestored(false);
  };

  const requiredFields = reportType ? getRequiredFields(reportType) : ["docente", "curso", "periodo"];
  const canSubmit      = requiredFields.every(k => form[k]?.trim());

  // H2: Mapa de claves técnicas → labels legibles para mensajes de error
  const FIELD_LABELS = Object.fromEntries(
    [...(FORM_FIELDS.common || []), ...(FORM_FIELDS.common2 || []),
     ...Object.values(FORM_FIELDS).flat()]
      .filter(f => f.k && !f.k.startsWith('_') && f.label)
      .map(f => [f.k, f.label])
  );

  // H7: Ctrl+Enter / Cmd+Enter para generar reporte desde el formulario
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && view === 'form' && canSubmit && user) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, canSubmit, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const generating = view === 'loading' || streaming;

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
        onHistorialClick={() => { setView("historial"); loadReportes(true); }}
        onDashboardClick={() => { setView("dashboard"); loadReportes(true); loadMetricas(); }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {view === "cursos" && (
        <CursosView
          cursos={cursos}
          showModal={showCursoModal}
          setShowModal={setShowCursoModal}
          cursoForm={cursoForm}
          setCursoForm={setCursoForm}
          createCurso={createCurso}
          updateCurso={updateCurso}
          deleteCurso={deleteCurso}
          editingCursoId={editingCursoId}
          setEditingCursoId={setEditingCursoId}
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
          loading={historialLoading}
          onGenerar={scrollToForm}
          onDuplicateReport={duplicateReporte}
        />
      )}

      {view === "dashboard" && (
        <DashboardView
          reportes={reportes}
          metricas={metricas}
          loading={historialLoading}
          scrollToForm={scrollToForm}
          onCursosClick={() => setView("cursos")}
          onVerHistorial={() => { setView("historial"); loadReportes(true); }}
        />
      )}

      {(view === "landing" || view === "form") && (
        <LandingPage
          reportType={reportType}
          setReportType={type => {
            setReportType(type);
            if (formatoSubido && formatoSubido.tipo_reporte && formatoSubido.tipo_reporte !== type) {
              setFormatoSubido(null);
            }
          }}
          form={form}
          set={set}
          generate={generate}
          generating={generating}
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
          draftRestored={draftRestored}
          erroresForm={erroresForm}
          onDismissDraft={() => {
            try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignorar */ }
            setDraftRestored(false);
          }}
        />
      )}

      {showOnboarding && user && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      <AssistantBot
        currentView={
          view === 'form' || view === 'landing'
            ? (reportType || 'nuevo_reporte')
            : view
        }
      />

      {view === "loading" && <LoadingView loadMsg={loadMsg} />}

      {view === "report" && (() => {
        const stored = parseStoredReport(report);
        if (stored.format === 'fea_v2' && isFeAlegriaType(stored.type || reportType)) {
          return (
            <FeAlegriaReportView
              reportType={stored.type || reportType}
              form={form}
              fileName={fileName}
              data={stored.data}
              streaming={streaming}
              reset={reset}
              copyReport={copyReport}
              copied={copied}
              onSaveEdits={currentReporteId ? saveReportEdits : null}
              onDataChange={(d) => setReport(serializeFeAReport(stored.type || reportType, d))}
              reporteId={currentReporteId}
              feedbackInicial={currentReporteFeedback}
            />
          );
        }
        return (
          <ReportView
            report={report}
            streaming={streaming}
            reportType={reportType}
            form={form}
            fileName={fileName}
            reset={reset}
            copyReport={copyReport}
            copied={copied}
            onSaveEdits={currentReporteId ? saveReportEdits : null}
            onReferralShare={recordReferralShare}
            reporteId={currentReporteId}
            feedbackInicial={currentReporteFeedback}
          />
        );
      })()}
    </div>
  );
}
