import { useEffect, useRef } from 'react';
import AssistantChat from './AssistantChat';
import './assistant.css';

export default function FloatingButton({ onOpen, chatOpen, onClose, initialFaqId, badgeCount = 0 }) {
  const btnRef = useRef(null);

  // Focus management: return focus to button when chat closes
  useEffect(() => {
    if (!chatOpen && btnRef.current) btnRef.current.focus();
  }, [chatOpen]);

  return (
    <>
      <button
        ref={btnRef}
        className={`lucia-fab ${badgeCount > 0 && !chatOpen ? 'has-hint' : ''}`}
        onClick={chatOpen ? onClose : onOpen}
        aria-label={chatOpen ? 'Cerrar asistente Lucía' : 'Abrir asistente Lucía'}
        aria-expanded={chatOpen}
        aria-haspopup="dialog"
      >
        {chatOpen ? '✕' : '🤖'}
        {badgeCount > 0 && !chatOpen && (
          <span className="lucia-fab-badge" aria-hidden="true">{Math.min(badgeCount, 9)}</span>
        )}
      </button>

      {chatOpen && (
        <AssistantChat onClose={onClose} initialFaqId={initialFaqId} />
      )}
    </>
  );
}
