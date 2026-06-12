import { useState, useMemo } from 'react';
import './historial.css';
import HistorialFilters from './HistorialFilters.jsx';
import HistorialGroup from './HistorialGroup.jsx';
import HistorialEmpty from './HistorialEmpty.jsx';
import { daysDiff } from '../../utils/fechaRelativa.js';

const TIPO_LABELS = {
  informe_tutor:   'Informe Tutor/a',
  contingencia:    'Plan Contingencia',
  microcurricular: 'Planificación Micro',
  calificaciones:  'Calificaciones',
  asistencia:      'Asistencia',
};

function agrupar(reportes) {
  const hoy = [], semana = [], mes = [], antes = [];
  for (const r of reportes) {
    const d = daysDiff(r.created_at);
    if (d === 0) hoy.push(r);
    else if (d <= 7) semana.push(r);
    else if (d <= 30) mes.push(r);
    else antes.push(r);
  }
  return { hoy, semana, mes, antes };
}

function filterByPeriodo(reportes, periodo) {
  if (!periodo) return reportes;
  const maxDays = periodo === 'mes' ? 30 : 90;
  return reportes.filter(r => daysDiff(r.created_at) <= maxDays);
}

export default function HistorialViewNew({
  reportes = [],
  loading,
  onGenerar,
  openReport,
  deleteReport,
  onDuplicateReport,
  useToastHook,
}) {
  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState('');
  const [periodo, setPeriodo] = useState('');

  function handleFilterChange(patch) {
    if ('query'  in patch) setQuery(patch.query);
    if ('tipo'   in patch) setTipo(patch.tipo);
    if ('periodo' in patch) setPeriodo(patch.periodo);
  }

  const filtered = useMemo(() => {
    let r = [...reportes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    r = filterByPeriodo(r, periodo);
    if (tipo) r = r.filter(x => x.tipo_reporte === tipo);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(x =>
        (x.curso || '').toLowerCase().includes(q) ||
        (TIPO_LABELS[x.tipo_reporte] || x.tipo_reporte || '').toLowerCase().includes(q)
      );
    }
    return r;
  }, [reportes, query, tipo, periodo]);

  const grupos = useMemo(() => agrupar(filtered), [filtered]);

  return (
    <div className="hist-page">
      <div className="hist-header">
        <div className="hist-header__titles">
          <h2>Historial de reportes</h2>
          <p>{reportes.length} documento{reportes.length !== 1 ? 's' : ''} generado{reportes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="hist-header__new" onClick={onGenerar}>
          + Nuevo reporte
        </button>
      </div>

      {reportes.length > 0 && (
        <HistorialFilters
          query={query}
          tipo={tipo}
          periodo={periodo}
          onChange={handleFilterChange}
        />
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>
          Cargando historial…
        </div>
      ) : filtered.length === 0 ? (
        <HistorialEmpty query={query} onGenerar={onGenerar} />
      ) : (
        <>
          <HistorialGroup label="Hoy"          items={grupos.hoy}    onVer={openReport} onDuplicate={onDuplicateReport} onDelete={deleteReport} useToastHook={useToastHook} />
          <HistorialGroup label="Esta semana"  items={grupos.semana} onVer={openReport} onDuplicate={onDuplicateReport} onDelete={deleteReport} useToastHook={useToastHook} />
          <HistorialGroup label="Este mes"     items={grupos.mes}    onVer={openReport} onDuplicate={onDuplicateReport} onDelete={deleteReport} useToastHook={useToastHook} />
          <HistorialGroup label="Antes"        items={grupos.antes}  onVer={openReport} onDuplicate={onDuplicateReport} onDelete={deleteReport} useToastHook={useToastHook} />
        </>
      )}
    </div>
  );
}
