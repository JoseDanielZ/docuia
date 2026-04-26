import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { REPORT_TYPES, FORM_FIELDS } from "../config.js";
import Field from "./Field.jsx";
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
    <section style={{
      background: "var(--ink)",
      padding: "88px 32px 100px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div ref={glowRef} style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(700px 500px at 15% 20%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%), radial-gradient(600px 400px at 85% 90%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 60%)",
        opacity: .45,
        willChange: "opacity",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(to right, color-mix(in srgb, var(--paper) 4%, transparent) 1px, transparent 1px)",
        backgroundSize: "44px 100%",
        maskImage: "linear-gradient(to bottom, black, transparent 80%)",
      }} />

      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <p ref={eyebrowRef} style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, fontWeight: 500,
          color: "color-mix(in srgb, var(--accent) 80%, var(--paper))",
          letterSpacing: ".12em", textTransform: "uppercase",
          marginBottom: 28,
        }}>
          Plataforma de gestión documental — Fe y Alegría Ecuador
        </p>

        <h1 ref={titleRef} className="hero-t" style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 52,
          color: "var(--paper)",
          lineHeight: 1.1, letterSpacing: "-.02em",
          margin: "0 0 22px",
        }}>
          Seis horas de reportes reducidas a <em style={{ fontStyle: "italic", color: "color-mix(in srgb, var(--accent) 80%, var(--paper))" }}>diez minutos.</em>
        </h1>

        <p ref={subRef} style={{
          fontSize: 17, color: "rgba(245,241,232,.6)",
          lineHeight: 1.65, margin: "0 auto 40px", maxWidth: 520,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          Inteligencia artificial que genera informes institucionales completos en el formato exacto que requiere su coordinación.
        </p>

        <button
          ref={ctaRef}
          className="btn btn-primary"
          onClick={scrollToForm}
          {...ctaHover}
          style={{
            padding: "14px 36px", fontSize: 15, fontWeight: 600,
            background: "var(--paper)", color: "var(--ink)",
            boxShadow: "none",
            willChange: "transform, opacity",
          }}
        >
          Generar mi primer reporte
        </button>

        <p ref={microRef} style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "rgba(245,241,232,.25)",
          marginTop: 18, letterSpacing: ".04em",
        }}>
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
    <div ref={cardRef} style={{
      padding: "36px 20px",
      textAlign: "center",
      borderRight: index < 3 ? "1px solid var(--line)" : "none",
      background: "var(--paper)",
      willChange: "transform, opacity",
    }}>
      <div ref={numRef} className="sn" style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: 40, fontWeight: 300,
        color: "var(--ink)", lineHeight: 1,
      }}>0{stat.suffix}</div>
      <div style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 12, color: "var(--muted)",
        marginTop: 10, lineHeight: 1.5,
        whiteSpace: "pre-line",
      }}>{stat.label}</div>
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
    <section ref={sectionRef} style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line)", padding: "0 32px" }}>
      <div className="g2" style={{
        maxWidth: 1000, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        transform: "translateY(-1px)",
      }}>
        {STATS.map((s, i) => (
          <StatItem key={i} stat={s} index={i} triggered={triggered} />
        ))}
      </div>
      <p style={{
        textAlign: "center", paddingBottom: 18,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11, color: "var(--muted)",
        borderTop: "1px solid var(--line)",
        paddingTop: 14,
      }}>
        Encuesta a 19 docentes de Fe y Alegría — abril 2026
      </p>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", t: "Ingrese los datos",   d: "Complete el formulario con la información de su curso, asignatura y período." },
  { num: "02", t: "La IA redacta",       d: "DocuIA genera el informe completo en el formato institucional de Fe y Alegría." },
  { num: "03", t: "Descargue y envíe",   d: "Obtenga su reporte en Word, PDF o Excel. Listo para coordinación." },
];

function HowItWorksSection() {
  const stepsRef = useRef(null);
  useScrollReveal(stepsRef, { selector: ".step-item", y: 26, duration: 800, delay: 140 });

  return (
    <section style={{ padding: "72px 32px", background: "var(--paper)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)",
          letterSpacing: ".1em", textTransform: "uppercase",
          marginBottom: 10, textAlign: "center",
        }}>Proceso</p>

        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 34,
          color: "var(--ink)", textAlign: "center",
          margin: "0 0 56px", letterSpacing: "-.02em",
        }}>
          Tres pasos. Un resultado <em style={{ fontStyle: "italic" }}>profesional.</em>
        </h2>

        <div ref={stepsRef} style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
          {STEPS.map((st, i) => (
            <div key={i} className="step-item" style={{ textAlign: "center", maxWidth: 220, willChange: "transform, opacity" }}>
              <div style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 36, fontWeight: 300,
                color: "color-mix(in srgb, var(--accent) 70%, var(--paper-3))",
                marginBottom: 12,
              }}>{st.num}</div>
              <div style={{ width: 32, height: 1, background: "var(--line)", margin: "0 auto 14px" }} />
              <div style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 15, fontWeight: 600,
                color: "var(--ink)", marginBottom: 8,
              }}>{st.t}</div>
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13, color: "var(--muted)",
                lineHeight: 1.6, margin: 0,
              }}>{st.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Form section ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10, fontWeight: 500,
      color: "var(--muted)", letterSpacing: ".1em",
      textTransform: "uppercase",
      marginBottom: 10, marginTop: 10,
      paddingBottom: 8,
      borderBottom: "1px solid var(--line)",
    }}>
      {children}
    </div>
  );
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
        style={{
          width: "100%", padding: "10px 12px", marginBottom: 16,
          background: "var(--paper)", border: "1px solid var(--line)",
          borderRadius: 8, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
          color: "var(--ink)",
        }}
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
  formatoCompartir,
  setFormatoCompartir,
  user,
}) {
  if (!user) return null;

  const mios = formatosDisponibles?.mios || [];
  const compartidos = formatosDisponibles?.compartidos || [];

  return (
    <>
      <SectionLabel>Formato institucional (opcional)</SectionLabel>
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
              borderRadius: 8, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
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
            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12,
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
            fontFamily: "'IBM Plex Mono', monospace",
          }}>Selecciona primero el tipo de reporte para subir un formato.</p>
        )}
        {formatoSubido && (
          <p style={{
            margin: "8px 0 0", fontSize: 12, color: "var(--ink)",
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            Usando: <b>{formatoSubido.nombre_archivo}</b>
            {formatoSubido.num_campos_detectados ? ` · ${formatoSubido.num_campos_detectados} campos` : ""}
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
      className="card"
      onClick={onClick}
      {...hover}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 12, padding: "20px 18px",
        display: "flex", alignItems: "flex-start", gap: 14,
        willChange: "transform, opacity",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "var(--paper-3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13, fontWeight: 600, color: "var(--muted)",
      }}>
        {rt.id.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14, fontWeight: 600, color: "var(--ink)",
          marginBottom: 3,
        }}>{rt.label}</div>
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 12, color: "var(--muted)",
        }}>{rt.desc}</div>
      </div>
    </div>
  );
}

function FormSection({
  formRef, reportType, setReportType, form, set, generate, canSubmit, error,
  user, cursos, selectedCurso, selectCurso,
  formatosDisponibles, formatoSubido, selectFormato,
  uploadingFormato, handleFormatoUpload,
  formatoCompartir, setFormatoCompartir,
  saveAsTemplate, plantillas, loadTemplate,
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

  return (
    <section ref={formRef} style={{ padding: "72px 32px", background: "var(--paper-2)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)",
          letterSpacing: ".1em", textTransform: "uppercase",
          marginBottom: 10, textAlign: "center",
        }}>Generador</p>

        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 34,
          color: "var(--ink)", textAlign: "center",
          margin: "0 0 8px", letterSpacing: "-.02em",
        }}>
          Generar reporte <em style={{ fontStyle: "italic" }}>institucional</em>
        </h2>
        <p style={{
          textAlign: "center", color: "var(--muted)",
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14, marginBottom: 32,
        }}>
          A mayor detalle, mayor precisión en el documento generado.
        </p>

        {!reportType ? (
          <div ref={cardsRef} className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {REPORT_TYPES.map(rt => (
              <TypeCard key={rt.id} rt={rt} onClick={() => setReportType(rt.id)} />
            ))}
          </div>
        ) : (
          <div ref={formInnerRef} style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "28px 28px",
            boxShadow: "var(--shadow)",
          }}>
            <div data-form-block style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20, paddingBottom: 16,
              borderBottom: "1px solid var(--line)",
            }}>
              <span style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 18, fontWeight: 400, color: "var(--ink)",
              }}>
                {REPORT_TYPES.find(r => r.id === reportType)?.label}
              </span>
              <button
                onClick={() => setReportType(null)}
                style={{
                  all: "unset", cursor: "pointer",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 13, color: "var(--muted)",
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: 1,
                }}
              >
                Cambiar tipo
              </button>
            </div>

            {error && (
              <div data-form-block style={{
                padding: "12px 16px", background: "#fef2f2",
                border: "1px solid #f5c6c6", borderRadius: 8,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13, color: "var(--danger)", marginBottom: 16,
              }}>
                {error}
              </div>
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
                  style={{
                    width: "100%", padding: "10px 12px", marginBottom: 16,
                    background: "var(--paper)", border: "1px solid var(--line)",
                    borderRadius: 8, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13,
                    color: "var(--ink)",
                  }}
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
                formatoCompartir={formatoCompartir}
                setFormatoCompartir={setFormatoCompartir}
                user={user}
              />
            </div>

            <div data-form-block>
              <SectionLabel>Datos del docente</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {FORM_FIELDS.common.map(f => <Field key={f.k} {...f} form={form} set={set} half />)}
              </div>
            </div>

            <div data-form-block>
              <SectionLabel>Datos del curso</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {FORM_FIELDS.common2.map(f => <Field key={f.k} {...f} form={form} set={set} half />)}
              </div>
            </div>

            <div data-form-block>
              <SectionLabel>Información del reporte</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                {(FORM_FIELDS[reportType] || []).map(f => <Field key={f.k} {...f} form={form} set={set} />)}
              </div>
            </div>

            <div data-form-block style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button
                className="btn"
                onClick={generate}
                disabled={!canSubmit}
                {...(canSubmit ? generateHover : {})}
                style={{
                  flex: 1, minWidth: 200, padding: "14px 0",
                  background: canSubmit ? "var(--ink)" : "var(--line)",
                  color: canSubmit ? "var(--paper)" : "var(--muted)",
                  fontSize: 14, fontWeight: 600, borderRadius: 10,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  letterSpacing: ".01em",
                  willChange: "transform",
                }}
              >
                Generar reporte
              </button>
              {user && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Quote ─────────────────────────────────────────────────────────────────────
function QuoteSection() {
  const ref = useRef(null);
  useScrollReveal(ref, { y: 22, duration: 800 });
  return (
    <section style={{ padding: "64px 32px", background: "var(--paper)", borderBottom: "1px solid var(--line)" }}>
      <div ref={ref} style={{ maxWidth: 580, margin: "0 auto", textAlign: "center", willChange: "transform, opacity" }}>
        <div style={{ width: 32, height: 1, background: "var(--line)", margin: "0 auto 24px" }} />
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 20, fontStyle: "italic",
          color: "var(--ink)", lineHeight: 1.65,
          margin: "0 0 18px", letterSpacing: "-.01em",
        }}>
          "Los informes son diarios. Todos los días ciertos reportes son repetidos. Durante toda la mañana."
        </p>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)", letterSpacing: ".04em",
        }}>
          Ivette Proaño — Inspectora General, Fe y Alegría
        </p>
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
      <section style={{ padding: "64px 32px", background: "var(--ink)" }}>
        <div ref={ref} style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", willChange: "transform, opacity" }}>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, color: "color-mix(in srgb, var(--accent) 70%, var(--paper))",
            letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12,
          }}>Licencia institucional</p>

          <h2 style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 400, fontSize: 28,
            color: "var(--paper)", margin: "0 0 12px",
            letterSpacing: "-.02em",
          }}>
            ¿Desea DocuIA para toda su institución?
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14, color: "rgba(245,241,232,.45)",
            marginBottom: 28,
          }}>
            Un solo pago. Reportes ilimitados para todos los docentes.
          </p>
          <a
            href="mailto:docuia.feyalegria@gmail.com?subject=Interés en DocuIA institucional"
            className="btn"
            style={{
              display: "inline-flex", padding: "12px 28px",
              border: "1px solid rgba(245,241,232,.2)",
              color: "var(--paper)", background: "transparent",
              fontSize: 13, fontWeight: 500, borderRadius: 8,
              textDecoration: "none", letterSpacing: ".02em",
            }}
          >
            Solicitar información
          </a>
        </div>
      </section>

      <footer style={{ padding: "20px 32px", background: "var(--ink)", borderTop: "1px solid rgba(255,255,255,.06)", textAlign: "center" }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "rgba(245,241,232,.2)",
          margin: 0, letterSpacing: ".04em",
        }}>
          DocuIA · Fe y Alegría · PUCE Emprendimiento Tecnológico 2026 · Piñero · Heredia · Zumárraga · Iza
        </p>
      </footer>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LandingPage(props) {
  const {
    reportType, setReportType, form, set, generate, canSubmit, error, scrollToForm,
    user, cursos, selectedCurso, selectCurso,
    formatosDisponibles, formatoSubido, selectFormato,
    uploadingFormato, handleFormatoUpload,
    formatoCompartir, setFormatoCompartir,
    saveAsTemplate, plantillas, loadTemplate,
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
        canSubmit={canSubmit}
        error={error}
        user={user}
        cursos={cursos}
        selectedCurso={selectedCurso}
        selectCurso={selectCurso}
        formatosDisponibles={formatosDisponibles}
        formatoSubido={formatoSubido}
        selectFormato={selectFormato}
        uploadingFormato={uploadingFormato}
        handleFormatoUpload={handleFormatoUpload}
        formatoCompartir={formatoCompartir}
        setFormatoCompartir={setFormatoCompartir}
        saveAsTemplate={saveAsTemplate}
        plantillas={plantillas}
        loadTemplate={loadTemplate}
      />
      <QuoteSection />
      <CtaSection />
    </>
  );
}
