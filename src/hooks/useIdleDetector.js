import { useEffect, useRef, useState } from 'react';

export function useIdleDetector(timeoutMs = 30000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const reset = () => {
    setIsIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, []);

  return isIdle;
}
