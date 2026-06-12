import { useState } from 'react';
import FloatingButton from './FloatingButton';
import ContextualPopup from './ContextualPopup';
import IdlePopup from './IdlePopup';
import { useIdleDetector } from '../../hooks/useIdleDetector';
import { IDLE_HINTS } from '../../data/assistant/contextHints';

export default function AssistantBot({ currentView }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [initialFaqId, setInitialFaqId] = useState(null);
  const isIdle = useIdleDetector(30000);

  const openChat = (faqId = null) => {
    setInitialFaqId(faqId);
    setChatOpen(true);
  };

  const closeChat = () => {
    setChatOpen(false);
    setInitialFaqId(null);
  };

  return (
    <>
      <FloatingButton
        onOpen={() => openChat(null)}
        chatOpen={chatOpen}
        onClose={closeChat}
        initialFaqId={initialFaqId}
      />
      <ContextualPopup
        currentView={currentView}
        onCTAClick={(faqId) => openChat(faqId)}
      />
      {isIdle && !chatOpen && (
        <IdlePopup hints={IDLE_HINTS} onOpen={() => openChat(null)} />
      )}
    </>
  );
}
