import { useEffect, useState } from 'react';
import { CONTEXT_HINTS } from '../../data/assistant/contextHints';
import './assistant.css';

export default function ContextualPopup({ currentView, onCTAClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hint = CONTEXT_HINTS[currentView];
    if (!hint) { setVisible(false); return; }

    const lsKey = `lucia_seen_${currentView}`;
    if (hint.showOnlyOnce) {
      try {
        if (localStorage.getItem(lsKey)) return;
      } catch {}
    }

    const timer = setTimeout(() => setVisible(true), hint.delay);
    return () => { clearTimeout(timer); setVisible(false); };
  }, [currentView]);

  const dismiss = () => {
    const hint = CONTEXT_HINTS[currentView];
    if (hint?.showOnlyOnce) {
      try { localStorage.setItem(`lucia_seen_${currentView}`, '1'); } catch {}
    }
    setVisible(false);
  };

  const handleCTA = () => {
    const hint = CONTEXT_HINTS[currentView];
    dismiss();
    if (hint?.faqId) onCTAClick(hint.faqId);
  };

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  if (!visible) return null;

  const hint = CONTEXT_HINTS[currentView];
  if (!hint) return null;

  return (
    <div
      className="lucia-ctx-popup"
      role="dialog"
      aria-labelledby="lucia-ctx-title"
      aria-live="polite"
    >
      <div className="lucia-ctx-header">
        <span className="lucia-ctx-title" id="lucia-ctx-title">🤖 Lucía</span>
        <button className="lucia-ctx-close" onClick={dismiss} aria-label="Cerrar sugerencia">✕</button>
      </div>
      <p className="lucia-ctx-message">{hint.message}</p>
      <button className="lucia-ctx-cta" onClick={handleCTA}>
        {hint.cta} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
