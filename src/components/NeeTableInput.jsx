import './NeeTableInput.css';

function blankRow() {
  return { iniciales: '', necesidad: '' };
}

export default function NeeTableInput({ value, onChange, disabled }) {
  const rows = Array.isArray(value) && value.length ? value : [blankRow()];

  const updateRow = (idx, key, val) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));
  };

  const addRow = () => onChange([...rows, blankRow()]);

  const removeRow = (idx) => {
    const next = rows.filter((_, i) => i !== idx);
    onChange(next.length ? next : [blankRow()]);
  };

  return (
    <div className="nee-table" style={{ gridColumn: '1 / -1' }}>
      <div className="nee-table__header">
        <span className="nee-table__title">Adaptaciones curriculares (NEE)</span>
      </div>

      <div className="nee-table__cols-label">
        <span>Iniciales del estudiante</span>
        <span>Especificación de la necesidad educativa</span>
      </div>

      {rows.map((row, idx) => (
        <div key={idx} className="nee-table__row">
          <input
            className="nee-table__iniciales"
            type="text"
            value={row.iniciales}
            onChange={e => updateRow(idx, 'iniciales', e.target.value)}
            disabled={disabled}
            placeholder="Ej: J.P."
            maxLength={12}
          />
          <textarea
            className="nee-table__necesidad"
            value={row.necesidad}
            onChange={e => updateRow(idx, 'necesidad', e.target.value)}
            disabled={disabled}
            rows={2}
            placeholder="Tipo de NEE y ajuste curricular. Ej: TDAH Grado 2, 25% tiempo adicional…"
          />
          <button
            type="button"
            className="nee-table__remove"
            onClick={() => removeRow(idx)}
            disabled={disabled || rows.length === 1}
            aria-label="Eliminar fila"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="nee-table__add"
        onClick={addRow}
        disabled={disabled}
      >
        + Agregar estudiante NEE
      </button>
    </div>
  );
}
