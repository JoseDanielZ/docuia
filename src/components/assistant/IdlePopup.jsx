import { useEffect, useRef, useState } from 'react';
import './assistant.css';

export default function IdlePopup({ hints, onOpen }) {
  const [hiding, setHiding] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dismissTimer = useRef(null);

  const hint = useRef(hints[Math.floor(Math.random() * hints.length)]).current;

  // Check session limit (max 2 times)
  const allowed = (() => {
    try {
      const count = parseInt(sessionStorage.getItem('lucia_idle_count') || '0', 10);
      if (count >= 2) return false;
      sessionStorage.setItem('lucia_idle_count', String(count + 1));
      return true;
    } catch { return true; }
  })();

  const dismiss = () => {
    setHiding(true);
    clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setDismissed(true), 250);
  };

  // Auto-dismiss after 8s
  useEffect(() => {
    if (!allowed) return;
    dismissTimer.current = setTimeout(dismiss, 8000);
    return () => clearTimeout(dismissTimer.current);
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!allowed || dismissed) return null;

  const handleCTA = () => {
    dismiss();
    setTimeout(onOpen, 260);
  };

  return (
    <div
      className={`lucia-idle-popup ${hiding ? 'hiding' : ''}`}
      role="dialog"
      aria-live="polite"
      aria-label="Sugerencia de Lucía"
    >
      <p className="lucia-idle-message">{hint.message}</p>
      <button className="lucia-idle-cta" onClick={handleCTA}>{hint.cta}</button>
    </div>
  );
}
