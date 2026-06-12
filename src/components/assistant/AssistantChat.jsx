import { useEffect, useRef, useState } from 'react';
import { FAQ_CATEGORIES, searchFAQ } from '../../data/assistant/faq';
import './assistant.css';

export default function AssistantChat({ onClose, initialFaqId }) {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState(FAQ_CATEGORIES[0].id);
  const [openId, setOpenId] = useState(initialFaqId || null);
  const [thumbs, setThumbs] = useState(() => {
    try {
      const stored = {};
      for (const cat of FAQ_CATEGORIES) {
        for (const q of cat.questions) {
          const v = localStorage.getItem(`lucia_thumbs_${q.id}`);
          if (v) stored[q.id] = v;
        }
      }
      return stored;
    } catch { return {}; }
  });
  const [showWelcome] = useState(() => {
    try {
      const seen = localStorage.getItem('lucia_chat_opened');
      if (!seen) { localStorage.setItem('lucia_chat_opened', '1'); return true; }
      return false;
    } catch { return false; }
  });

  const faqListRef = useRef(null);
  const openItemRef = useRef(null);

  // Scroll to initialFaqId on open
  useEffect(() => {
    if (initialFaqId && openItemRef.current) {
      setTimeout(() => openItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [initialFaqId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const searchResults = query.trim().length >= 2 ? searchFAQ(query) : null;

  const visibleQuestions = searchResults
    ? searchResults
    : FAQ_CATEGORIES.find(c => c.id === activeCat)?.questions || [];

  const toggleItem = (id) => setOpenId(prev => prev === id ? null : id);

  const handleThumb = (qId, value) => {
    setThumbs(prev => ({ ...prev, [qId]: value }));
    try { localStorage.setItem(`lucia_thumbs_${qId}`, value); } catch {}
  };

  return (
    <div
      className="lucia-chat"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lucia-chat-title"
    >
      {/* Header */}
      <div className="lucia-chat-header">
        <div className="lucia-chat-header-avatar" aria-hidden="true">🤖</div>
        <div className="lucia-chat-header-info">
          <div className="lucia-chat-header-name" id="lucia-chat-title">Lucía</div>
          <div className="lucia-chat-header-sub">Asistente de DocuIA</div>
        </div>
        <button className="lucia-chat-close" onClick={onClose} aria-label="Cerrar chat">✕</button>
      </div>

      {/* Search */}
      <div className="lucia-search">
        <input
          type="search"
          placeholder="🔍 Buscar una pregunta..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Buscar en preguntas frecuentes"
        />
      </div>

      {/* Category Pills — hide when searching */}
      {!searchResults && (
        <div className="lucia-categories" role="tablist" aria-label="Categorías">
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`lucia-cat-pill ${activeCat === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
              role="tab"
              aria-selected={activeCat === cat.id}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* FAQ List */}
      <div className="lucia-faq-list" ref={faqListRef}>
        {showWelcome && (
          <div className="lucia-welcome">
            Hola, soy Lucía 👋 Pregúntame cualquier cosa sobre DocuIA
          </div>
        )}

        {visibleQuestions.length === 0 ? (
          <div className="lucia-no-results">No encontré resultados. Intenta con otras palabras.</div>
        ) : (
          visibleQuestions.map(item => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`lucia-faq-item ${isOpen ? 'open' : ''}`}
                ref={item.id === initialFaqId ? openItemRef : null}
              >
                <button
                  className="lucia-faq-question"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="lucia-faq-chevron" aria-hidden="true">▼</span>
                </button>
                {isOpen && (
                  <div className="lucia-faq-answer">
                    {item.answer}
                    <div className="lucia-faq-feedback">
                      <span>¿Esto ayudó?</span>
                      <button
                        className={`lucia-thumb-btn ${thumbs[item.id] === 'up' ? 'active' : ''}`}
                        onClick={() => handleThumb(item.id, 'up')}
                        aria-label="Útil"
                      >👍</button>
                      <button
                        className={`lucia-thumb-btn ${thumbs[item.id] === 'down' ? 'active' : ''}`}
                        onClick={() => handleThumb(item.id, 'down')}
                        aria-label="No útil"
                      >👎</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
