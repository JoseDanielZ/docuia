export default function Navbar({
  user,
  logout,
  scrollToForm,
  onLogoClick,
  cursos = [],
  onCursosClick,
  onPlantillasClick,
  onHistorialClick,
}) {
  const navBtnStyle = {
    padding: "7px 14px",
    fontSize: 12,
    border: "1px solid rgba(255,255,255,.15)",
    color: "rgba(245,241,232,.7)",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--ink)",
      borderBottom: "1px solid rgba(255,255,255,.08)",
      padding: "0",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div
          onClick={onLogoClick}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "var(--paper)", color: "var(--ink)",
            display: "grid", placeItems: "center",
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 700, fontSize: 15,
          }}>D</div>
          <span style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600, fontSize: 16,
            color: "var(--paper)", letterSpacing: ".01em",
          }}>DocuIA</span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, color: "rgba(245,241,232,.35)",
            marginLeft: 2,
          }}>Fe y Alegría</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {user && (
            <>
              <button onClick={onCursosClick} style={navBtnStyle}>
                Mis cursos {cursos.length > 0 ? `(${cursos.length})` : ""}
              </button>
              <button onClick={onPlantillasClick} style={navBtnStyle}>
                Plantillas
              </button>
              <button onClick={onHistorialClick} style={navBtnStyle}>
                Historial
              </button>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, color: "rgba(245,241,232,.45)",
                marginLeft: 4,
              }}>{user.email}</span>
            </>
          )}

          {user ? (
            <button onClick={logout} style={{ ...navBtnStyle }}>
              Salir
            </button>
          ) : (
            <a href="/login.html" style={{ ...navBtnStyle, textDecoration: "none" }}>
              Iniciar sesión
            </a>
          )}

          <button onClick={scrollToForm} className="btn btn-primary" style={{
            padding: "9px 20px",
            background: "var(--paper)",
            color: "var(--ink)",
            fontSize: 13, fontWeight: 600,
            boxShadow: "none",
          }}>
            Generar reporte
          </button>
        </div>
      </div>
    </nav>
  );
}
