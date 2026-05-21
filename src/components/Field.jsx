import PropTypes from "prop-types";

export default function Field({ label, k, ph, area, req, half, form, set, group, type, min, max, pattern, hint }) {
  if (typeof k === "string" && k.startsWith("_")) {
    if (!group) return null;
    return (
      <div
        style={{
          gridColumn: "1 / -1",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--muted)",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          marginTop: 18,
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {group}
      </div>
    );
  }

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

  const focusHandlers = {
    onFocus: e => {
      e.target.style.borderColor = "var(--accent)";
      e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)";
    },
    onBlur: e => {
      e.target.style.borderColor = "var(--line)";
      e.target.style.boxShadow = "none";
    },
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
        {label} {req && <span style={{ color: "var(--danger)" }} title="Campo obligatorio">*</span>}
      </label>

      {area ? (
        <textarea
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          required={req}
          rows={3}
          style={{ ...base, resize: "vertical" }}
          {...focusHandlers}
        />
      ) : (
        <input
          type={type}
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          required={req}
          min={min}
          max={max}
          pattern={pattern}
          style={base}
          {...focusHandlers}
        />
      )}

      {hint && (
        <p style={{
          margin: "5px 0 0",
          fontSize: 11,
          color: "var(--muted)",
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

Field.propTypes = {
  label:   PropTypes.string,
  k:       PropTypes.string,
  ph:      PropTypes.string,
  area:    PropTypes.bool,
  req:     PropTypes.bool,
  half:    PropTypes.bool,
  form:    PropTypes.object,
  set:     PropTypes.func,
  group:   PropTypes.string,
  type:    PropTypes.string,
  min:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pattern: PropTypes.string,
  hint:    PropTypes.string,
};

Field.defaultProps = {
  type: "text",
};
