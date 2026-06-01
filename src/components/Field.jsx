import PropTypes from "prop-types";
import "./Field.css";

export default function Field({ label, k, ph, area, req, half, form, set, group, type, min, max, pattern, hint, error }) {
  if (typeof k === "string" && k.startsWith("_")) {
    if (!group) return null;
    return <div className="field-section-label">{group}</div>;
  }

  /* Solo el borde cambia dinámicamente según el estado de error */
  const borderColor = error ? "var(--error)" : "var(--border-subtle)";
  const focusBorder = error ? "var(--error)" : "var(--jade-500)";
  const focusShadow = error
    ? "0 0 0 3px rgba(255,91,107,0.12)"
    : "0 0 0 3px rgba(0,212,168,0.12)";

  const focusHandlers = {
    onFocus: e => {
      e.target.style.borderColor = focusBorder;
      e.target.style.boxShadow   = focusShadow;
      e.target.style.background  = error ? "rgba(255,91,107,0.02)" : "rgba(0,212,168,0.03)";
    },
    onBlur: e => {
      e.target.style.borderColor = borderColor;
      e.target.style.boxShadow   = "none";
      e.target.style.background  = "rgba(255,255,255,0.03)";
    },
  };

  return (
    <div
      className={`field-group${half ? "" : " field-group--full"}`}
      style={{ gridColumn: half ? undefined : "1 / -1" }}
    >
      <label
        className="field-label"
        style={{ color: error ? "var(--error)" : "var(--text-secondary)" }}
      >
        {label} {req && <span style={{ color: "var(--error)" }}>*</span>}
      </label>

      {area ? (
        <textarea
          className="field-textarea"
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          required={req}
          rows={3}
          data-field={k}
          style={{ border: `1px solid ${borderColor}` }}
          {...focusHandlers}
        />
      ) : (
        <input
          className="field-input"
          type={type}
          value={form[k] || ""}
          onChange={e => set(k, e.target.value)}
          placeholder={ph}
          required={req}
          min={min}
          max={max}
          pattern={pattern}
          data-field={k}
          style={{ border: `1px solid ${borderColor}` }}
          {...focusHandlers}
        />
      )}

      {error && <p className="field-error-msg">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
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
  error:   PropTypes.string,
};

Field.defaultProps = { type: "text" };
