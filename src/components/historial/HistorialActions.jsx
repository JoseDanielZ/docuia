import { useState, useRef, useEffect } from 'react';
import { authFetch } from '../../utils/auth.js';
import { downloadWord } from '../../utils/download.js';

export default function HistorialActions({ reporte, onVer, onDuplicate, onDelete, useToastHook }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const menuRef = useRef(null);
  const toast = useToastHook();

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await authFetch(`/api/reportes?id=${reporte.id}`);
      const data = await res.json();
      if (data.reporte?.reporte_generado) {
        const filename = `${reporte.tipo_reporte}_${reporte.curso || 'reporte'}.docx`;
        downloadWord(data.reporte.reporte_generado, filename);
      } else {
        toast.error('No se pudo obtener el contenido del reporte.');
      }
    } catch {
      toast.error('Error al descargar el reporte.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleDuplicate() {
    setMenuOpen(false);
    try {
      await onDuplicate(reporte.id);
      toast.success('Reporte duplicado correctamente.');
    } catch {
      toast.error('Error al duplicar el reporte.');
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    const confirmed = await toast.confirm(`¿Eliminar este reporte? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    try {
      await onDelete(reporte.id);
    } catch {
      toast.error('Error al eliminar el reporte.');
    }
  }

  return (
    <div className="hist-actions">
      <button className="hist-actions__btn hist-actions__btn--primary" onClick={() => onVer(reporte)}>
        Ver
      </button>
      <button
        className="hist-actions__btn hist-actions__btn--icon"
        title="Descargar Word"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? '…' : '⬇'}
      </button>
      <div className="hist-menu-wrap" ref={menuRef}>
        <button
          className="hist-actions__btn hist-actions__btn--icon"
          title="Más acciones"
          onClick={() => setMenuOpen(o => !o)}
        >
          ···
        </button>
        {menuOpen && (
          <div className="hist-menu">
            <button className="hist-menu__item" onClick={() => { setMenuOpen(false); onVer(reporte); }}>
              ✏️ Editar
            </button>
            <button className="hist-menu__item" onClick={handleDuplicate}>
              📋 Duplicar
            </button>
            <div className="hist-menu__divider" />
            <button className="hist-menu__item hist-menu__item--danger" onClick={handleDelete}>
              🗑️ Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
