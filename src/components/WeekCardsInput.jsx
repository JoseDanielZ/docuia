import { useEffect } from 'react';
import './WeekCardsInput.css';

const SEMANA_FIELDS = [
  { key: 'proc',        label: 'Contenidos Procedimentales' },
  { key: 'conc',        label: 'Contenidos Conceptuales' },
  { key: 'act',         label: 'Contenidos Actitudinales' },
  { key: 'actividades', label: 'Actividades de Aprendizaje' },
  { key: 'recursos',    label: 'Recursos' },
  { key: 'criterios',   label: 'Criterios de Evaluación' },
  { key: 'tecnicas',    label: 'Técnicas e Instrumentos de Evaluación' },
];

function blankWeek() {
  return { proc: '', conc: '', act: '', actividades: '', recursos: '', criterios: '', tecnicas: '' };
}

export default function WeekCardsInput({ numSemanas, value, onChange, disabled }) {
  const n = Math.max(0, Math.min(12, parseInt(numSemanas, 10) || 0));

  useEffect(() => {
    if (!n) return;
    const current = Array.isArray(value) ? value : [];
    if (current.length === n) return;
    const next = n > current.length
      ? [...current, ...Array.from({ length: n - current.length }, blankWeek)]
      : current.slice(0, n);
    onChange(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  if (!n) {
    return (
      <div className="week-cards week-cards--empty" style={{ gridColumn: '1 / -1' }}>
        Ingresa el número de semanas para configurar el desarrollo semanal.
      </div>
    );
  }

  const weeks = Array.isArray(value) ? value : [];

  const updateWeek = (idx, key, val) => {
    const next = Array.from({ length: n }, (_, i) => {
      const w = weeks[i] || blankWeek();
      return i === idx ? { ...w, [key]: val } : w;
    });
    onChange(next);
  };

  return (
    <div className="week-cards" style={{ gridColumn: '1 / -1' }}>
      <div className="week-cards__header">
        <span className="week-cards__title">Desarrollo semanal</span>
        <span className="week-cards__badge">{n} {n === 1 ? 'semana' : 'semanas'}</span>
      </div>

      {Array.from({ length: n }, (_, i) => {
        const week = weeks[i] || blankWeek();
        return (
          <div key={i} className="week-cards__card">
            <div className="week-cards__card-header">
              Semana {i + 1}
            </div>
            <div className="week-cards__fields">
              {SEMANA_FIELDS.map(f => (
                <label key={f.key} className="week-cards__field">
                  <span className="week-cards__field-label">{f.label}</span>
                  <textarea
                    className="week-cards__textarea"
                    value={week[f.key] ?? ''}
                    onChange={e => updateWeek(i, f.key, e.target.value)}
                    disabled={disabled}
                    rows={2}
                    placeholder={`${f.label}…`}
                  />
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
