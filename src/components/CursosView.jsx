import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";
import "./CursosView.css";
import { useEnter, useStaggerChildren, magneticHover, pop } from "../utils/anim.js";

export default function CursosView({ cursos, showModal, setShowModal, cursoForm, setCursoForm, createCurso, deleteCurso }) {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEnter(headerRef, { y: 14, duration: 600 });
  useStaggerChildren(gridRef, { y: 22, delay: 70, duration: 600, deps: [cursos.length] });

  // Animación de entrada del modal (overlay fade + scale del card)
  useEffect(() => {
    if (!showModal) return;
    if (overlayRef.current) {
      utils.set(overlayRef.current, { opacity: 0 });
      animate(overlayRef.current, { opacity: [0, 1], duration: 240, ease: "outQuad" });
    }
    if (modalRef.current) {
      utils.set(modalRef.current, { opacity: 0, scale: 0.94, translateY: 12 });
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.94, 1],
        translateY: [12, 0],
        duration: 480,
        ease: "outBack(1.5)",
      });
    }
  }, [showModal]);

  const closeModal = () => {
    if (modalRef.current && overlayRef.current) {
      animate(modalRef.current, {
        opacity: [1, 0],
        scale: [1, 0.96],
        translateY: [0, 8],
        duration: 200,
        ease: "outQuad",
      });
      animate(overlayRef.current, {
        opacity: [1, 0],
        duration: 220,
        ease: "outQuad",
        onComplete: () => setShowModal(false),
      });
    } else {
      setShowModal(false);
    }
  };

  const handleCreate = (e) => {
    pop(e.currentTarget, { scale: 1.04, duration: 380 });
    createCurso();
  };

  const handleDelete = (id, el) => {
    if (!el) return deleteCurso(id);
    animate(el, {
      opacity: [1, 0],
      scale: [1, 0.92],
      translateX: [0, 30],
      duration: 280,
      ease: "outQuad",
      onComplete: () => deleteCurso(id),
    });
  };

  const fi = (k) => ({
    className: "curso-modal-input",
    value: cursoForm[k] || "",
    onChange: e => setCursoForm(p => ({ ...p, [k]: e.target.value })),
  });

  const Label = ({ children, req }) => (
    <label className="curso-modal-label">
      {children} {req && <span className="curso-modal-label-req">*</span>}
    </label>
  );

  const addBtnHover = magneticHover();

  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div ref={headerRef} className="cursos-header" style={{ willChange: "transform, opacity" }}>
          <div>
            <h2 className="cursos-title">Mis Cursos</h2>
            <p className="cursos-subtitle">Gestiona los cursos que dictas para auto-llenar reportes</p>
          </div>
          <button className="cursos-add-btn" {...addBtnHover} onClick={() => setShowModal(true)}>
            + Nuevo curso
          </button>
        </div>

        {cursos.length === 0 && (
          <div className="cursos-empty">No tienes cursos guardados. Crea uno para comenzar.</div>
        )}

        <div ref={gridRef} className="cursos-grid">
          {cursos.map(c => (
            <div key={c.id} className="curso-card" style={{ willChange: "transform, opacity" }}>
              <div className="curso-card-header">
                <div className="curso-card-name">{c.nombre}</div>
                <button
                  className="curso-card-delete"
                  onClick={(e) => handleDelete(c.id, e.currentTarget.closest(".curso-card"))}
                >&times;</button>
              </div>
              <div className="curso-card-meta">{c.asignatura} — {c.grado} {c.paralelo}</div>
              <div className="curso-card-details">{c.num_estudiantes || 0} estudiantes · {c.jornada || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div ref={overlayRef} className="curso-modal-overlay" onClick={closeModal} style={{ willChange: "opacity" }}>
          <div ref={modalRef} className="curso-modal" onClick={e => e.stopPropagation()} style={{ willChange: "transform, opacity" }}>
            <h3 className="curso-modal-title">Crear nuevo curso</h3>
            <div className="curso-modal-form">
              <div>
                <Label req>Nombre del curso</Label>
                <input {...fi("nombre")} placeholder="Ej: 8vo B - Matemáticas" />
              </div>
              <div className="curso-modal-row">
                <div>
                  <Label req>Grado</Label>
                  <input {...fi("grado")} placeholder="Ej: 8vo EGB" />
                </div>
                <div>
                  <Label>Paralelo</Label>
                  <input {...fi("paralelo")} placeholder="Ej: B" />
                </div>
              </div>
              <div>
                <Label req>Asignatura</Label>
                <input {...fi("asignatura")} placeholder="Ej: Matemáticas" />
              </div>
              <div className="curso-modal-row">
                <div>
                  <Label>N° estudiantes</Label>
                  <input {...fi("num_estudiantes")} placeholder="Ej: 32" />
                </div>
                <div>
                  <Label>Jornada</Label>
                  <input {...fi("jornada")} placeholder="Ej: Matutina" />
                </div>
              </div>
              <div className="curso-modal-actions">
                <button className="curso-modal-btn-create" onClick={handleCreate}>Crear curso</button>
                <button className="curso-modal-btn-cancel" onClick={() => { closeModal(); setCursoForm({}); }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
