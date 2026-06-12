const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'informe_tutor', label: 'Informe Tutor/a' },
  { value: 'contingencia', label: 'Plan Contingencia' },
  { value: 'microcurricular', label: 'Planificación Micro' },
  { value: 'calificaciones', label: 'Calificaciones' },
  { value: 'asistencia', label: 'Asistencia' },
];

const PERIODOS = [
  { value: '', label: 'Todo el tiempo' },
  { value: 'mes', label: 'Este mes' },
  { value: 'tres_meses', label: 'Últimos 3 meses' },
];

export default function HistorialFilters({ query, tipo, periodo, onChange }) {
  return (
    <div className="hist-filters">
      <div className="hist-search">
        <span className="hist-search__icon">🔍</span>
        <input
          type="search"
          placeholder="Buscar por nombre o curso…"
          value={query}
          onChange={e => onChange({ query: e.target.value })}
        />
      </div>
      <div className="hist-filter-row">
        <select value={tipo} onChange={e => onChange({ tipo: e.target.value })}>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={periodo} onChange={e => onChange({ periodo: e.target.value })}>
          {PERIODOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
    </div>
  );
}
