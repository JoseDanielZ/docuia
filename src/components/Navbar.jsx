import { useEffect, useRef } from "react";
import { animate, stagger, utils } from "animejs";
import { magneticHover } from "../utils/anim.js";

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
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const itemsRef = useRef(null);

  // Solo se anima UNA vez al montar. No se vuelve a disparar con re-renders
  // ni cuando cambia `user` (login/logout) ni cuando cambian props como cursos.
  useEffect(() => {
    if (!navRef.current) return;

    utils.set(navRef.current, { translateY: -64, opacity: 0 });
    if (logoRef.current) utils.set(logoRef.current, { opacity: 0, translateX: -10 });
    if (itemsRef.current) {
      utils.set(itemsRef.current.children, { opacity: 0, translateY: -8 });
    }

    animate(navRef.current, {
      translateY: [-64, 0],
      opacity: [0, 1],
      duration: 720,
      ease: "outExpo",
    });
    if (logoRef.current) {
      animate(logoRef.current, {
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 700,
        delay: 220,
        ease: "outExpo",
      });
    }
    if (itemsRef.current) {
      animate(itemsRef.current.children, {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 600,
        delay: stagger(60, { start: 280 }),
        ease: "outExpo",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navBtnStyle = {
    padding: "7px 14px",
    fontSize: 12,
    border: "1px solid rgba(255,255,255,.15)",
    color: "rgba(245,241,232,.7)",
    background: "transparent",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: "border-color .2s, color .2s, background .2s",
  };

  const handleBtnEnter = (e) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,.32)";
    e.currentTarget.style.color = "var(--paper)";
    e.currentTarget.style.background = "rgba(255,255,255,.04)";
    animate(e.currentTarget, { translateY: -2, duration: 240, ease: "outQuart" });
  };
  const handleBtnLeave = (e) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,.15)";
    e.currentTarget.style.color = "rgba(245,241,232,.7)";
    e.currentTarget.style.background = "transparent";
    animate(e.currentTarget, { translateY: 0, duration: 320, ease: "outQuart" });
  };

  const primaryHover = magneticHover();

  return (
    <nav ref={navRef} style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--ink)",
      borderBottom: "1px solid rgba(255,255,255,.08)",
      padding: "0",
      willChange: "transform, opacity",
    }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto", padding: "16px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div
          ref={logoRef}
          onClick={onLogoClick}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", willChange: "transform, opacity" }}
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
        </div>

        <div ref={itemsRef} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {user && (
            <>
              <button onClick={onCursosClick} style={navBtnStyle} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                Mis cursos {cursos.length > 0 ? `(${cursos.length})` : ""}
              </button>
              <button onClick={onPlantillasClick} style={navBtnStyle} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
                Plantillas
              </button>
              <button onClick={onHistorialClick} style={navBtnStyle} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
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
            <button onClick={logout} style={navBtnStyle} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
              Salir
            </button>
          ) : (
            <a href="/login.html" style={{ ...navBtnStyle, textDecoration: "none" }} onMouseEnter={handleBtnEnter} onMouseLeave={handleBtnLeave}>
              Iniciar sesión
            </a>
          )}

          <button
            onClick={scrollToForm}
            className="btn btn-primary"
            {...primaryHover}
            style={{
              padding: "9px 20px",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 13, fontWeight: 600,
              boxShadow: "none",
              willChange: "transform",
            }}
          >
            Generar reporte
          </button>
        </div>
      </div>
    </nav>
  );
}
