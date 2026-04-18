export default function Field({ label, k, ph, area, req, half, form, set }) {
  const base = {
    all: "unset",
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: "var(--text)",
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color .18s, box-shadow .18s",
    display: "block",
  };

  return (
    <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
      <label style={{
        display: "block",
        marginBottom: 5,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--muted)",
        letterSpacing: ".03em",
        textTransform: "uppercase",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}>
        {label} {req && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>

      {area ? (
        <textarea
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          rows={3}
          style={{ ...base, resize: "vertical" }}
          onFocus={e => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "var(--line)";
            e.target.style.boxShadow = "none";
          }}
        />
      ) : (
        <input
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          style={base}
          onFocus={e => {
            e.target.style.borderColor = "var(--accent)";
            e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "var(--line)";
            e.target.style.boxShadow = "none";
          }}
        />
      )}
    </div>
  );
}
