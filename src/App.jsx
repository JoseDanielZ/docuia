import { useState, useEffect } from "react";
import "./App.css";

import { SYSTEM_PROMPT, REPORT_TYPES, FORM_FIELDS, buildPrompt, getRequiredFields } from "./config";
import { saveToSupabase } from "./utils/supabase.js";
import { getUser, logout } from "./utils/auth.js";

import Navbar      from "./components/Navbar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import LoadingView from "./components/LoadingView.jsx";
import ReportView  from "./components/ReportView.jsx";

const LOAD_MSGS = [
  "Analizando datos del curso...",
  "Estructurando el reporte...",
  "Redactando contenido institucional...",
  "Añadiendo recomendaciones pedagógicas...",
  "Verificando formato de Fe y Alegría...",
  "Formateando documento final...",
];

export default function App() {
  const [view,       setView]       = useState("landing");
  const [reportType, setReportType] = useState(null);
  const [form,       setFormState]  = useState({});
  const [report,     setReport]     = useState("");
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const [loadMsg,    setLoadMsg]    = useState("");

  const user = getUser();

  useEffect(() => {
    if (user) {
      setFormState(p => ({ ...p, docente: user.user_metadata?.name || "", email: user.email || "" }));
    }
    saveToSupabase("visitas", { referrer: document.referrer || "directo" });
  }, []);

  const set = (k, v) => setFormState(p => ({ ...p, [k]: v }));

  const scrollToForm = () => setView("form");

  const generate = async () => {
    if (!form.docente || !form.curso || !form.periodo) {
      setError("Completa los campos obligatorios (docente, curso, período)");
      return;
    }
    setView("loading");
    setError("");

    let mi = 0;
    setLoadMsg(LOAD_MSGS[0]);
    const iv = setInterval(() => { mi = (mi + 1) % LOAD_MSGS.length; setLoadMsg(LOAD_MSGS[mi]); }, 2200);

    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(reportType, form), system: SYSTEM_PROMPT }),
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
  };

  const requiredFields = reportType ? getRequiredFields(reportType) : ["docente","curso","periodo"];
  const canSubmit = requiredFields.every(k => form[k]?.trim());

  const fileName = `DocuIA_${REPORT_TYPES.find(r => r.id === reportType)?.label || "Reporte"}_${form.curso || ""}_${form.periodo || ""}`
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_\- ]/g, "")
    .replace(/\s+/g, "_");

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: "var(--text)", background: "var(--paper)", minHeight: "100vh" }}>
      <Navbar
        user={user}
        logout={logout}
        scrollToForm={scrollToForm}
        onLogoClick={reset}
      />

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
