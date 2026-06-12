export function fechaRelativa(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000); // minutos
  if (diff < 1)   return 'ahora mismo';
  if (diff < 60)  return `hace ${diff} minuto${diff !== 1 ? 's' : ''}`;
  const h = Math.floor(diff / 60);
  if (h < 24)     return `hace ${h} hora${h !== 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  if (d < 7)      return `hace ${d} día${d !== 1 ? 's' : ''}`;
  return new Date(dateStr).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

export function daysDiff(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
