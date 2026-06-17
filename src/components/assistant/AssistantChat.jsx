import { useEffect, useRef, useState } from 'react';
import { FAQ_CATEGORIES, searchFAQ } from '../../data/assistant/faq';
import './assistant.css';

const SUGGESTIONS = [
  '¿Cómo genero mi primer documento?',
  '¿Cómo ingreso los nombres de estudiantes?',
  '¿Por qué el documento tarda mucho?',
  '¿Qué es el Plan de Contingencia?',
];

function ChatTab({ currentView, onSwitchToFaq }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: currentView }),
      });

      const data = await res.json();
      const reply = res.ok
        ? (data.reply || 'No tengo respuesta para eso.')
        : (data.error || 'Ups, no pude responder ahora. Prueba con las preguntas frecuentes.');

      setMessages(prev => [...prev, { role: 'lucia', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'lucia',
        text: 'No pude conectarme. Revisa tu conexión o usa las preguntas frecuentes. 😊',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      <div className="lucia-chat-messages">
        {messages.length === 0 ? (
          <div className="lucia-chat-empty">
            <span className="lucia-chat-empty-icon">💬</span>
            <span>Escríbeme lo que necesitas saber sobre DocuIA</span>
            <div className="lucia-chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="lucia-suggestion-btn"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`lucia-bubble ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="lucia-bubble lucia loading">Lucía está escribiendo…</div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="lucia-chat-input-bar">
        <textarea
          ref={inputRef}
          className="lucia-chat-input"
          placeholder="Escribe tu pregunta…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          aria-label="Pregunta a Lucía"
          disabled={loading}
        />
        <button
          className="lucia-send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          aria-label="Enviar"
        >
          ↑
        </button>
      </div>
    </>
  );
}

export default function AssistantChat({ onClose, initialFaqId, currentView }) {
  const [activeTab, setActiveTab] = useState(initialFaqId ? 'faq' : 'faq');
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

  const openItemRef = useRef(null);

  useEffect(() => {
    if (initialFaqId && openItemRef.current) {
      setTimeout(() => openItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [initialFaqId]);

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

      {/* Tabs */}
      <div className="lucia-tabs" role="tablist">
        <button
          className={`lucia-tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
          role="tab"
          aria-selected={activeTab === 'faq'}
        >
          📚 Preguntas frecuentes
        </button>
        <button
          className={`lucia-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          role="tab"
          aria-selected={activeTab === 'chat'}
        >
          💬 Pregunta a Lucía
        </button>
      </div>

      {/* Chat IA tab */}
      {activeTab === 'chat' && (
        <ChatTab currentView={currentView} onSwitchToFaq={() => setActiveTab('faq')} />
      )}

      {/* FAQ tab */}
      {activeTab === 'faq' && (
        <>
          <div className="lucia-search">
            <input
              type="search"
              placeholder="🔍 Buscar una pregunta..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Buscar en preguntas frecuentes"
            />
          </div>

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

          <div className="lucia-faq-list">
            {showWelcome && (
              <div className="lucia-welcome">
                Hola, soy Lucía 👋 Pregúntame cualquier cosa sobre DocuIA
              </div>
            )}

            {visibleQuestions.length === 0 ? (
              <div className="lucia-no-results">
                No encontré resultados. Prueba en la pestaña{' '}
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--jade-500)', cursor: 'pointer', fontSize: 13, padding: 0 }}
                  onClick={() => setActiveTab('chat')}
                >
                  💬 Pregunta a Lucía
                </button>
              </div>
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
        </>
      )}
    </div>
  );
}
