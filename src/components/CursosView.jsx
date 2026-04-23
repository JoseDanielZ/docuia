import "./CursosView.css";

export default function CursosView({ cursos, showModal, setShowModal, cursoForm, setCursoForm, createCurso, deleteCurso }) {
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

  return (
    <section className="cursos-section">
      <div className="cursos-container">
        <div className="cursos-header">
          <div>
            <h2 className="cursos-title">Mis Cursos</h2>
            <p className="cursos-subtitle">Gestiona los cursos que dictas para auto-llenar reportes</p>
          </div>
          <button className="cursos-add-btn" onClick={() => setShowModal(true)}>
            + Nuevo curso
          </button>
        </div>

        {cursos.length === 0 && (
          <div className="cursos-empty">No tienes cursos guardados. Crea uno para comenzar.</div>
        )}

        <div className="cursos-grid">
          {cursos.map(c => (
            <div key={c.id} className="curso-card">
              <div className="curso-card-header">
                <div className="curso-card-name">{c.nombre}</div>
                <button className="curso-card-delete" onClick={() => deleteCurso(c.id)}>&times;</button>
              </div>
              <div className="curso-card-meta">{c.asignatura} — {c.grado} {c.paralelo}</div>
              <div className="curso-card-details">{c.num_estudiantes || 0} estudiantes · {c.jornada || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="curso-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="curso-modal" onClick={e => e.stopPropagation()}>
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
                <button className="curso-modal-btn-create" onClick={createCurso}>Crear curso</button>
                <button className="curso-modal-btn-cancel" onClick={() => { setShowModal(false); setCursoForm({}); }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
