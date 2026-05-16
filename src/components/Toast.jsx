import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

let _id = 0;

const TYPE_STYLES = {
  success: { bg: "var(--ok)",     text: "#fff" },
  error:   { bg: "var(--danger)", text: "#fff" },
  warning: { bg: "#92400e",       text: "#fff" },
  info:    { bg: "var(--ink)",    text: "var(--paper)" },
};

function ToastItem({ id, message, type, onDismiss }) {
  const s = TYPE_STYLES[type] ?? TYPE_STYLES.info;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: s.bg, color: s.text,
        borderRadius: 10, padding: "12px 40px 12px 16px",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: 14, lineHeight: 1.5,
        boxShadow: "0 4px 20px rgba(0,0,0,.3)",
        animation: "toast-in .22s ease",
        maxWidth: 380, position: "relative",
        wordBreak: "break-word",
      }}
    >
      {message}
      <button
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        style={{
          position: "absolute", top: 10, right: 10,
          background: "none", border: "none", cursor: "pointer",
          color: s.text, opacity: 0.65, fontSize: 20, lineHeight: 1,
          padding: "2px 4px", fontFamily: "inherit",
        }}
      >×</button>
    </div>
  );
}

function ConfirmDialog({ message, confirmLabel, cancelLabel, isPrompt, placeholder, danger, onResult }) {
  const [val, setVal] = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onResult(isPrompt ? null : false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isPrompt, onResult]);

  const handleConfirm = () => onResult(isPrompt ? (val.trim() || null) : true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dlg-msg"
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
        background: "rgba(11,31,58,.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={() => onResult(isPrompt ? null : false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--paper)", borderRadius: 14,
          padding: "28px 28px 24px",
          maxWidth: 420, width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,.28)",
          border: "1px solid var(--line)",
        }}
      >
        <p id="dlg-msg" style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          fontSize: 15, color: "var(--ink)",
          margin: "0 0 18px", lineHeight: 1.55,
        }}>{message}</p>

        {isPrompt && (
          <input
            autoFocus
            type="text"
            placeholder={placeholder}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleConfirm(); }}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8,
              border: "1px solid var(--line)",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 14, color: "var(--ink)", background: "var(--paper)",
              marginBottom: 16, outline: "none", boxSizing: "border-box",
            }}
          />
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => onResult(isPrompt ? null : false)}
            style={{
              padding: "9px 18px", borderRadius: 8,
              border: "1px solid var(--line)", cursor: "pointer",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13, background: "transparent", color: "var(--ink)",
            }}
          >{cancelLabel}</button>
          <button
            autoFocus={!isPrompt}
            onClick={handleConfirm}
            style={{
              padding: "9px 18px", borderRadius: 8,
              border: "none", cursor: "pointer",
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 13, fontWeight: 500,
              background: danger ? "var(--danger)" : "var(--ink)",
              color: "var(--paper)",
            }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const [dlg, setDlg] = useState(null);
  const resolveRef = useRef(null);

  const dismiss = useCallback((id) => setList(p => p.filter(t => t.id !== id)), []);

  const add = useCallback((message, type, duration = 4500) => {
    const id = ++_id;
    setList(p => [...p, { id, message, type }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = {
    success: (m, d) => add(m, "success", d),
    error:   (m, d) => add(m, "error",   d ?? 6000),
    warning: (m, d) => add(m, "warning", d),
    info:    (m, d) => add(m, "info",    d),
    confirm: (message, opts = {}) => new Promise(resolve => {
      resolveRef.current = resolve;
      setDlg({
        message,
        confirmLabel: opts.confirmLabel ?? "Confirmar",
        cancelLabel:  opts.cancelLabel  ?? "Cancelar",
        danger:       opts.danger       ?? false,
        isPrompt: false,
      });
    }),
    prompt: (message, opts = {}) => new Promise(resolve => {
      resolveRef.current = resolve;
      setDlg({
        message,
        placeholder:  opts.placeholder  ?? "",
        confirmLabel: opts.confirmLabel ?? "Guardar",
        cancelLabel:  opts.cancelLabel  ?? "Cancelar",
        isPrompt: true,
      });
    }),
  };

  const handleResult = (val) => {
    resolveRef.current?.(val);
    setDlg(null);
  };

  return (
    <Ctx.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 10000,
          display: "flex", flexDirection: "column", gap: 10,
          pointerEvents: "none", maxWidth: 380,
        }}
      >
        {list.map(t => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      {dlg && <ConfirmDialog {...dlg} onResult={handleResult} />}
    </Ctx.Provider>
  );
}
