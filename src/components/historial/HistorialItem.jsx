import { fechaRelativa } from '../../utils/fechaRelativa.js';
import HistorialActions from './HistorialActions.jsx';

const TIPO_CONFIG = {
  informe_tutor:   { label: 'Tutor',        badgeClass: 'hist-badge--tutor',         title: 'Informe Tutor/a' },
  contingencia:    { label: 'Contingencia',  badgeClass: 'hist-badge--contingencia',  title: 'Plan Contingencia' },
  microcurricular: { label: 'Planificación', badgeClass: 'hist-badge--planificacion', title: 'Planif. Micro' },
  calificaciones:  { label: 'Notas',         badgeClass: 'hist-badge--notas',         title: 'Calificaciones' },
  asistencia:      { label: 'Asistencia',    badgeClass: 'hist-badge--asistencia',    title: 'Asistencia' },
};

export default function HistorialItem({ reporte, onVer, onDuplicate, onDelete, useToastHook }) {
  const cfg = TIPO_CONFIG[reporte.tipo_reporte] || {
    label: reporte.tipo_reporte,
    badgeClass: 'hist-badge--notas',
    title: reporte.tipo_reporte,
  };

  const metaParts = [];
  if (reporte.periodo) metaParts.push(reporte.periodo);
  metaParts.push(fechaRelativa(reporte.created_at));

  return (
    <div className="hist-item">
      <span className={`hist-badge ${cfg.badgeClass}`}>{cfg.label}</span>
      <div className="hist-item__info">
        <div className="hist-item__title">
          {cfg.title}{reporte.curso ? ` · ${reporte.curso}` : ''}
        </div>
        <div className="hist-item__meta">{metaParts.join(' · ')}</div>
      </div>
      <HistorialActions
        reporte={reporte}
        onVer={onVer}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        useToastHook={useToastHook}
      />
    </div>
  );
}
