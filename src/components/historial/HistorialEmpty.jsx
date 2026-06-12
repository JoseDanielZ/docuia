export default function HistorialEmpty({ query, onGenerar }) {
  if (query) {
    return (
      <div className="hist-empty">
        <div className="hist-empty__icon">🔍</div>
        <h3>Sin resultados para "{query}"</h3>
        <p>Prueba buscando solo el nombre del curso o cambia los filtros de tipo.</p>
      </div>
    );
  }
  return (
    <div className="hist-empty">
      <div className="hist-empty__icon">📂</div>
      <h3>Aún no tienes reportes guardados</h3>
      <p>Genera tu primer documento y aparecerá aquí con todas sus acciones disponibles.</p>
      <button className="hist-empty__cta" onClick={onGenerar}>
        Generar mi primer reporte →
      </button>
    </div>
  );
}
