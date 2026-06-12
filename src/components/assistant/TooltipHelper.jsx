import { useRef, useState } from 'react';
import './assistant.css';

export default function TooltipHelper({ text, position = 'top', delay = 600, children }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <span
      className="lucia-tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && text && (
        <span className={`lucia-tooltip-box ${position}`} role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
