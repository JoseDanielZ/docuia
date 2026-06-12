import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { REPORT_TYPES, FORM_FIELDS } from "../config.js";
import { getFormatoPreview } from "../utils/formatoText.js";
import Field from "./Field.jsx";
import TooltipHelper from "./assistant/TooltipHelper.jsx";
import "./LandingPage.css";
import {
  useEnter,
  useStaggerChildren,
  useCountUp,
  useSplitWordsEnter,
  useScrollReveal,
  magneticHover,
} from "../utils/anim.js";

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ scrollToForm }) {
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const microRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo", duration: 800 } });

    if (eyebrowRef.current) {
      utils.set(eyebrowRef.current, { opacity: 0, translateY: 14 });
      tl.add(eyebrowRef.current, { opacity: [0, 1], translateY: [14, 0], duration: 600 }, 0);
    }
    if (subRef.current) utils.set(subRef.current, { opacity: 0, translateY: 16 });
    if (ctaRef.current) utils.set(ctaRef.current, { opacity: 0, translateY: 16, scale: 0.96 });
    if (microRef.current) utils.set(microRef.current, { opacity: 0, translateY: 8 });

    tl.add(subRef.current, { opacity: [0, 1], translateY: [16, 0], duration: 700 }, 600);
    tl.add(ctaRef.current, {
      opacity: [0, 1],
      translateY: [16, 0],
      scale: [0.96, 1],
      duration: 700,
      ease: "outBack(1.6)",
    }, 750);
    tl.add(microRef.current, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, 950);

    if (glowRef.current) {
      animate(glowRef.current, {
        opacity: [{ to: 0.45, duration: 0 }, { to: 0.7, duration: 4200 }, { to: 0.45, duration: 4200 }],
        loop: true,
        ease: "inOutSine",
      });
    }
  }, []);

  useSplitWordsEnter(titleRef, { delay: 180, perWord: 55, y: 28, duration: 950 });

  const ctaHover = magneticHover();

  return (
    <section className="hero-section">
      <div ref={glowRef} className="hero-aurora" style={{ willChange: "opacity" }} />
      <div className="hero-grid" />

      <div className="hero-inner">
        <div ref={eyebrowRef} className="hero-badge" style={{ willChange: "transform, opacity" }}>
          <span className="hero-badge__dot" />
          Plataforma IA para docentes
        </div>

        <h1 ref={titleRef} className="hero-title" style={{ willChange: "transform, opacity" }}>
          Reportes que antes<br />
          tomaban horas,{" "}
          <span className="hero-title__accent">ahora en segundos.</span>
        </h1>

        <p ref={subRef} className="hero-subtitle" style={{ willChange: "transform, opacity" }}>
          Inteligencia artificial que genera informes institucionales completos en el formato exacto que requiere su coordinación.
        </p>

        <button
          ref={ctaRef}
          className="btn btn-primary"
          onClick={scrollToForm}
          {...ctaHover}
          style={{ padding: "15px 40px", fontSize: 16, fontWeight: 700, borderRadius: "var(--radius-lg)", willChange: "transform, opacity" }}
        >
          Generar mi primer reporte
        </button>

        <p ref={microRef} className="hero-micro" style={{ willChange: "transform, opacity" }}>
          Sin registro · Sin costo · Descarga en Word, PDF o Excel
        </p>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { num: 79, suffix: "%", label: "dedica más de 6 horas\nsemanales a reportes" },
  { num: 63, suffix: "%", label: "trabaja fuera\nde su jornada laboral" },
  { num: 47, suffix: "%", label: "repite la misma información\nmás de tres veces" },
  { num: 37, suffix: "%", label: "trabaja fines\nde semana" },
];

function StatItem({ stat, index, triggered }) {
  const numRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!triggered) return;
    if (cardRef.current) {
      utils.set(cardRef.current, { opacity: 0, translateY: 24 });
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        delay: index * 110,
        ease: "outExpo",
      });
    }
    if (numRef.current) {
      const obj = { value: 0 };
      animate(obj, {
        value: stat.num,
        duration: 1400,
        delay: index * 110 + 120,
        ease: "outExpo",
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = Math.round(obj.value) + stat.suffix;
        },
      });
    }
  }, [triggered]);

  return (
    <div ref={cardRef} className="stat-item" style={{ willChange: "transform, opacity" }}>
      <div ref={numRef} className="stat-number">0{stat.suffix}</div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
}

function StatsSection() {
  const sectionRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="stats-section">
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <StatItem key={i} stat={s} index={i} triggered={triggered} />
        ))}
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", t: "Ingrese los datos",   d: "Complete el formulario con la información de su curso, asignatura y período." },
  { num: "02", t: "La IA redacta",       d: "DocuIA genera el informe completo siguiendo el formato institucional que necesite." },
  { num: "03", t: "Descargue y envíe",   d: "Obtenga su reporte en Word, PDF o Excel. Listo para coordinación." },
];

function HowItWorksSection() {
  const stepsRef = useRef(null);
  useScrollReveal(stepsRef, { selector: ".step-item", y: 26, duration: 800, delay: 140 });

  return (
    <section className="how-section">
      <div className="how-inner">
        <p className="how-eyebrow">Cómo funciona</p>
        <h2 className="how-title">
          Tres pasos. Un resultado <span className="how-title__accent">profesional.</span>
        </h2>

        <div ref={stepsRef} className="steps-grid">
          {STEPS.map((st, i) => {
            const iconColors = [
              { bg: "rgba(0,212,168,0.1)", border: "1px solid rgba(0,212,168,0.2)", color: "var(--jade-500)" },
              { bg: "rgba(245,166,35,0.1)",  border: "1px solid rgba(245,166,35,0.2)",  color: "var(--amber-500)" },
              { bg: "rgba(74,144,226,0.1)",  border: "1px solid rgba(74,144,226,0.2)",  color: "#4A90E2" },
            ];
            const ic = iconColors[i];
            const elements = [(
              <div key={i} className="step-item step-card" style={{ willChange: "transform, opacity" }}>
                <div className="step-icon" style={{ background: ic.bg, border: ic.border, color: ic.color }}>
                  {st.num}
                </div>
                <div className="step-title">{st.t}</div>
                <p className="step-desc">{st.d}</p>
              </div>
            )];
            if (i < STEPS.length - 1) elements.push(
              <div key={`c${i}`} className="step-connector" />
            );
            return elements;
          })}
        </div>
      </div>
    </section>
  );
}

// ── Form section ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return <div className="form-section-label">{children}</div>;
}

// ── Selector de curso guardado ────────────────────────────────────────────────
function CursoSelector({ cursos, selectedCurso, selectCurso }) {
  if (!cursos?.length) return null;
  return (
    <>
      <SectionLabel>Mis cursos guardados</SectionLabel>
      <select
        value={selectedCurso?.id || ""}
        onChange={e => {
          const c = cursos.find(x => x.id === e.target.value);
          selectCurso(c || null);
        }}
        className="form-select"
      >
        <option value="">— Sin auto-llenar —</option>
        {cursos.map(c => (
          <option key={c.id} value={c.id}>
            {c.nombre} · {c.asignatura} · {c.grado} {c.paralelo}
          </option>
        ))}
      </select>
    </>
  );
}

// ── Upload + selector de formato institucional ────────────────────────────────
function FormatoInstitucional({
  reportType,
  formatosDisponibles,
  formatoSubido,
  uploadingFormato,
  handleFormatoUpload,
  selectFormato,
  clearFormato,
  formatoCompartir,
  setFormatoCompartir,
  formatoModo,
  setFormatoModo,
  user,
}) {
  const [showPreview, setShowPreview] = useState(false);
  if (!user) return null;

  const mios = formatosDisponibles?.mios || [];
  const compartidos = formatosDisponibles?.compartidos || [];
  const tipoCoincide = !formatoSubido || !reportType || formatoSubido.tipo_reporte === reportType;

  const preview = formatoSubido?.contenido_extraido
    ? getFormatoPreview(formatoSubido.contenido_extraido, { maxChars: 700, maxLines: 18 })
    : "";

  return (
    <>
      <SectionLabel>Formato institucional (opcional)</SectionLabel>

      {/* ── Banner de formato ACTIVO ────────────────────────────────────── */}
      {formatoSubido && (
        <div style={{
          background: tipoCoincide ? "color-mix(in srgb, var(--accent) 14%, var(--paper))" : "color-mix(in srgb, #c0392b 12%, var(--paper))",
          border: `1px solid ${tipoCoincide ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "color-mix(in srgb, #c0392b 35%, transparent)"}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 8px", borderRadius: 999,
              background: tipoCoincide ? "var(--accent)" : "#c0392b",
              color: "var(--paper)",
              fontFamily: "var(--font-mono)",
              fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase",
              fontWeight: 600,
            }}>
              {tipoCoincide ? "● Formato activo" : "⚠ Tipo no coincide"}
            </span>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: 13, color: "var(--ink)", fontWeight: 500,
            }}>
              {formatoSubido.nombre_archivo}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11, color: "var(--muted)",
            }}>
              {formatoSubido.num_campos_detectados || 0} campos · {formatoSubido.tipo_reporte}
            </span>
            <button
              onClick={() => clearFormato?.()}
              style={{
                marginLeft: "auto",
                background: "transparent", border: "1px solid var(--line)",
                borderRadius: 6, padding: "3px 9px",
                fontFamily: "var(--font-mono)",
                fontSize: 10, color: "var(--muted)", cursor: "pointer",
              }}
            >
              QUITAR
            </button>
          </div>

          {!tipoCoincide && (
            <p style={{
              margin: 0, fontSize: 11, color: "#c0392b",
              fontFamily: "var(--font-mono)",
            }}>
              Este formato fue subido como "{formatoSubido.tipo_reporte}". El reporte actual es "{reportType}". Sube uno específico o quita el actual.
            </p>
          )}

          {/* Toggle modo estricto / guía */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10, color: "var(--muted)",
              letterSpacing: ".05em", textTransform: "uppercase",
            }}>Modo:</span>
            {[
              { id: "estricto", label: "Estricto · replica el formato 1:1" },
              { id: "guia",     label: "Guía · usa estructura como referencia" },
            ].map(opt => (
              <label key={opt.id} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "var(--font-body)",
                fontSize: 12, cursor: "pointer",
                color: formatoModo === opt.id ? "var(--ink)" : "var(--muted)",
                fontWeight: formatoModo === opt.id ? 600 : 400,
              }}>
                <input
                  type="radio"
                  name="formatoModo"
                  checked={formatoModo === opt.id}
                  onChange={() => setFormatoModo?.(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Preview del contenido extraído */}
          {preview && (
            <div>
              <button
                onClick={() => setShowPreview(s => !s)}
                style={{
                  background: "transparent", border: "none", padding: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11, color: "var(--accent)", cursor: "pointer",
                  letterSpacing: ".04em",
                }}
              >
                {showPreview ? "▾ Ocultar previsualización" : "▸ Ver qué se le envía al modelo"}
              </button>
              {showPreview && (
                <pre style={{
                  marginTop: 8, padding: 10,
                  background: "var(--paper-3)", border: "1px solid var(--line)",
                  borderRadius: 6, maxHeight: 220, overflow: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11, lineHeight: 1.55, color: "var(--ink)",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>{preview}</pre>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{
        background: "var(--paper)", border: "1px dashed var(--line)",
        borderRadius: 10, padding: 14, marginBottom: 16,
      }}>
        {(mios.length > 0 || compartidos.length > 0) && (
          <select
            value={formatoSubido?.id || ""}
            onChange={e => {
              const todos = [...mios, ...compartidos];
              const f = todos.find(x => x.id === e.target.value);
              selectFormato(f || null);
            }}
            style={{
              width: "100%", padding: "9px 12px", marginBottom: 10,
              background: "var(--paper-2)", border: "1px solid var(--line)",
              borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 13,
              color: "var(--ink)",
            }}
          >
            <option value="">— Sin formato —</option>
            {mios.length > 0 && (
              <optgroup label="Mis formatos">
                {mios.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nombre_archivo} ({f.tipo_reporte}){f.compartido ? " · compartido" : ""}
                  </option>
                ))}
              </optgroup>
            )}
            {compartidos.length > 0 && (
              <optgroup label="De mi institución">
                {compartidos.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nombre_archivo} ({f.tipo_reporte})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label className="btn btn-ghost" style={{
            padding: "8px 14px", fontSize: 12, cursor: "pointer",
            border: "1px solid var(--line)", borderRadius: 8,
            opacity: (uploadingFormato || !reportType) ? 0.6 : 1,
          }}>
            {uploadingFormato ? "Subiendo..." : "Subir PDF/Excel"}
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFormatoUpload}
              disabled={uploadingFormato || !reportType}
              style={{ display: "none" }}
            />
          </label>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-body)", fontSize: 12,
            color: "var(--muted)",
          }}>
            <input
              type="checkbox"
              checked={!!formatoCompartir}
              onChange={e => setFormatoCompartir(e.target.checked)}
            />
            Compartir con mi institución
          </label>
        </div>

        {!reportType && (
          <p style={{
            margin: "8px 0 0", fontSize: 11, color: "var(--muted)",
            fontFamily: "var(--font-mono)",
          }}>Selecciona primero el tipo de reporte para subir un formato.</p>
        )}
        {!formatoSubido && reportType && (
          <p style={{
            margin: "8px 0 0", fontSize: 11, color: "var(--muted)",
            fontFamily: "var(--font-mono)", lineHeight: 1.5,
          }}>
            Si subes un PDF o Excel del formato de tu institución, el reporte se generará replicando esa estructura exacta.
          </p>
        )}
      </div>
    </>
  );
}

// ── Card de tipo (con animación de entrada y hover) ───────────────────────────
function TypeCard({ rt, onClick }) {
  const ref = useRef(null);
  const hover = magneticHover();
  return (
    <div
      ref={ref}
      className="type-card"
      onClick={onClick}
      {...hover}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="type-card__icon">
        {rt.icon || rt.id.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="type-card__label">{rt.label}</div>
        <div className="type-card__desc">{rt.desc}</div>
      </div>
    </div>
  );
}

function FormSection({
  formRef, reportType, setReportType, form, set, generate, generating, canSubmit, error,
  user, cursos, selectedCurso, selectCurso,
  formatosDisponibles, formatoSubido, selectFormato, clearFormato,
  uploadingFormato, handleFormatoUpload,
  formatoCompartir, setFormatoCompartir,
  formatoModo, setFormatoModo,
  saveAsTemplate, plantillas, loadTemplate,
  draftRestored, onDismissDraft,
  erroresForm,
}) {
  const cardsRef = useRef(null);
  const formInnerRef = useRef(null);

  useStaggerChildren(cardsRef, { y: 18, delay: 60, duration: 600, deps: [reportType] });

  // Animar la entrada del formulario cuando se selecciona un tipo
  useEffect(() => {
    if (!reportType || !formInnerRef.current) return;
    const sections = formInnerRef.current.querySelectorAll("[data-form-block]");
    if (!sections.length) return;
    utils.set(sections, { opacity: 0, translateY: 14 });
    animate(sections, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 600,
      delay: stagger(70, { start: 80 }),
      ease: "outExpo",
    });
  }, [reportType]);

  const generateHover = magneticHover();
  const canGenerate = canSubmit && !!user && !generating;

  return (
    <section ref={formRef} className="form-section">
      <div className="form-section-inner">
        <p className="form-section-eyebrow">Generador de reportes</p>
        <h2 className="form-section-title">
          Generar reporte <span className="form-section-title__accent">institucional</span>
        </h2>
        <p className="form-section-desc">A mayor detalle, mayor precisión en el documento generado.</p>
        <p className="form-section-privacy">
          Privacidad: el contenido se envía cifrado (HTTPS) a un proveedor de IA. No incluyas contraseñas ni datos sensibles. Revisa siempre el texto antes de enviarlo oficialmente.
        </p>

        {draftRestored && (
          <div className="draft-banner">
            <span>Borrador restaurado — continuando desde donde lo dejaste.</span>
            <button className="draft-banner__dismiss" onClick={onDismissDraft}>
              Descartar
            </button>
          </div>
        )}

        {!reportType ? (
          <div ref={cardsRef} className="type-cards-grid">
            {REPORT_TYPES.map(rt => (
              <TypeCard key={rt.id} rt={rt} onClick={() => setReportType(rt.id)} />
            ))}
          </div>
        ) : (
          <div ref={formInnerRef} className="form-card">
            <div className="form-card__bar" />
            <div data-form-block className="form-card-header">
              <div className="form-card-header__badge">
                <span className="form-card-header__dot" />
                {REPORT_TYPES.find(r => r.id === reportType)?.label}
              </div>
              <button className="form-card-header__change" onClick={() => setReportType(null)}>
                Cambiar tipo
              </button>
            </div>

            {error && (
              <div data-form-block className="form-error">{error}</div>
            )}

            {user && plantillas?.length > 0 && (
              <div data-form-block>
                <SectionLabel>Cargar plantilla</SectionLabel>
                <select
                  value=""
                  onChange={e => {
                    const p = plantillas.find(x => x.id === e.target.value);
                    if (p) loadTemplate(p);
                  }}
                  className="form-select"
                >
                  <option value="">— Seleccionar plantilla —</option>
                  {plantillas
                    .filter(p => !reportType || p.tipo_reporte === reportType)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} · {p.tipo_reporte}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div data-form-block>
              <CursoSelector cursos={cursos} selectedCurso={selectedCurso} selectCurso={selectCurso} />
            </div>

            <div data-form-block>
              <FormatoInstitucional
                reportType={reportType}
                formatosDisponibles={formatosDisponibles}
                formatoSubido={formatoSubido}
                uploadingFormato={uploadingFormato}
                handleFormatoUpload={handleFormatoUpload}
                selectFormato={selectFormato}
                clearFormato={clearFormato}
                formatoCompartir={formatoCompartir}
                setFormatoCompartir={setFormatoCompartir}
                formatoModo={formatoModo}
                setFormatoModo={setFormatoModo}
                user={user}
              />
            </div>

            <div data-form-block>
              <SectionLabel>Datos del docente</SectionLabel>
              <div className="form-fields-grid">
                {FORM_FIELDS.common.map(f => <Field key={f.k} {...f} form={form} set={set} half error={erroresForm?.[f.k]} />)}
              </div>
            </div>

            <div data-form-block>
              <SectionLabel>Datos del curso</SectionLabel>
              <div className="form-fields-grid">
                {FORM_FIELDS.common2.map(f => <Field key={f.k} {...f} form={form} set={set} half error={erroresForm?.[f.k]} />)}
              </div>
            </div>

            <div data-form-block>
              <SectionLabel>Información del reporte</SectionLabel>
              <div className="form-fields-grid">
                {(FORM_FIELDS[reportType] || []).map(f => <Field key={f.k} {...f} form={form} set={set} error={erroresForm?.[f.k]} />)}
              </div>
            </div>

            <div data-form-block className="form-actions">
              <TooltipHelper text="La IA creará tu documento con los datos del formulario" position="top">
              <button
                className="btn btn-primary"
                onClick={generate}
                disabled={!canGenerate}
                {...(canGenerate ? generateHover : {})}
                style={{
                  flex: 1, minWidth: 200, padding: "15px 0",
                  fontSize: 15, fontWeight: 700,
                  borderRadius: "var(--radius-lg)",
                  background: canGenerate ? "var(--grad-jade)" : "var(--bg-elevated)",
                  color: canGenerate ? "var(--text-inverse)" : "var(--text-muted)",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  boxShadow: canGenerate ? "0 4px 20px rgba(0,212,168,0.3)" : "none",
                  willChange: "transform",
                }}
              >
                {generating ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Generando…</>
                ) : (
                  <>Generar reporte <span style={{ fontSize: 10, opacity: .6, fontWeight: 400, marginLeft: 6 }}>Ctrl+Enter</span></>
                )}
              </button>
              </TooltipHelper>
              {user && (
                <TooltipHelper text="Guarda estos datos para reutilizarlos la próxima vez" position="top">
                  <button
                    className="btn btn-ghost"
                    onClick={saveAsTemplate}
                    disabled={!reportType}
                    style={{
                      padding: "13px 18px", fontSize: 13, borderRadius: 10,
                      border: "1px solid var(--line)", background: "var(--paper)",
                      color: reportType ? "var(--ink)" : "var(--muted)",
                      cursor: reportType ? "pointer" : "not-allowed",
                    }}
                  >
                    Guardar como plantilla
                  </button>
                </TooltipHelper>
              )}
            </div>
            {reportType && !user && (
              <p className="form-login-hint">
                <a href="/login.html">Inicia sesión</a>
                {" "}para generar y guardar reportes en tu historial.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CtaSection() {
  const ref = useRef(null);
  useScrollReveal(ref, { y: 22, duration: 800 });
  return (
    <>
      <section className="cta-section">
        <div ref={ref} className="cta-inner" style={{ willChange: "transform, opacity" }}>
          <p className="cta-eyebrow">Licencia institucional</p>
          <h2 className="cta-title">¿Desea DocuIA para toda su institución?</h2>
          <p className="cta-desc">Un solo pago. Reportes ilimitados para todos los docentes.</p>
          <a
            href="mailto:contacto@docuia.app?subject=Interés en DocuIA institucional"
            className="btn btn-ghost"
            style={{ display: "inline-flex", padding: "12px 28px", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
          >
            Solicitar información
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <a
          className="site-footer__instagram"
          href="https://www.instagram.com/docu_ia?igsh=OXZ2dWw2aDJxYzFj&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @docu_ia
        </a>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} DocuIA · Todos los derechos reservados
        </p>
      </footer>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage(props) {
  const {
    reportType, setReportType, form, set, generate, generating, canSubmit, error, scrollToForm,
    user, cursos, selectedCurso, selectCurso,
    formatosDisponibles, formatoSubido, selectFormato, clearFormato,
    uploadingFormato, handleFormatoUpload,
    formatoCompartir, setFormatoCompartir,
    formatoModo, setFormatoModo,
    saveAsTemplate, plantillas, loadTemplate,
    draftRestored, onDismissDraft,
    erroresForm,
  } = props;

  const formRef = useRef(null);

  const handleScrollToForm = () => {
    scrollToForm();
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <>
      <HeroSection scrollToForm={handleScrollToForm} />
      <StatsSection />
      <HowItWorksSection />
      <FormSection
        formRef={formRef}
        reportType={reportType}
        setReportType={setReportType}
        form={form}
        set={set}
        generate={generate}
        generating={generating}
        canSubmit={canSubmit}
        error={error}
        user={user}
        cursos={cursos}
        selectedCurso={selectedCurso}
        selectCurso={selectCurso}
        formatosDisponibles={formatosDisponibles}
        formatoSubido={formatoSubido}
        selectFormato={selectFormato}
        clearFormato={clearFormato}
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
        onDismissDraft={onDismissDraft}
        erroresForm={erroresForm || {}}
      />
      <CtaSection />
    </>
  );
}
