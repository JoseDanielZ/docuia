import HistorialItem from './HistorialItem.jsx';

export default function HistorialGroup({ label, items, onVer, onDuplicate, onDelete, useToastHook }) {
  if (!items.length) return null;
  return (
    <div className="hist-group">
      <div className="hist-group-label">{label}</div>
      {items.map(r => (
        <HistorialItem
          key={r.id}
          reporte={r}
          onVer={onVer}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          useToastHook={useToastHook}
        />
      ))}
    </div>
  );
}
