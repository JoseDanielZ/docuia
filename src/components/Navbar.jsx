import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { animate, stagger, utils } from "animejs";
import { magneticHover } from "../utils/anim.js";
import "./Navbar.css";

function Navbar({
  user,
  logout,
  scrollToForm,
  onLogoClick,
  cursos = [],
  onCursosClick,
  onPlantillasClick,
  onHistorialClick,
  onDashboardClick,
}) {
  const navRef   = useRef(null);
  const logoRef  = useRef(null);
  const itemsRef = useRef(null);

  /* Animación de entrada — solo al montar */
  useEffect(() => {
    if (!navRef.current) return;
    utils.set(navRef.current, { translateY: -48, opacity: 0 });
    if (logoRef.current)  utils.set(logoRef.current,  { opacity: 0, translateX: -8 });
    if (itemsRef.current) utils.set(itemsRef.current.children, { opacity: 0, translateY: -6 });

    animate(navRef.current, { translateY: [-48, 0], opacity: [0, 1], duration: 720, ease: "outExpo" });
    if (logoRef.current) {
      animate(logoRef.current, { opacity: [0, 1], translateX: [-8, 0], duration: 700, delay: 180, ease: "outExpo" });
    }
    if (itemsRef.current) {
      animate(itemsRef.current.children, {
        opacity: [0, 1], translateY: [-6, 0],
        duration: 550, delay: stagger(55, { start: 260 }), ease: "outExpo",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const primaryHover = magneticHover();

  return (
    <nav ref={navRef} className="navbar" style={{ willChange: "transform, opacity" }}>
      <button ref={logoRef} className="navbar__logo" onClick={onLogoClick} style={{ willChange: "transform, opacity" }}>
        <span className="navbar__logo-text">
          Docu<span className="navbar__logo-accent">IA</span>
        </span>
      </button>

      <div ref={itemsRef} className="navbar__items">
        {user && (
          <>
            <button className="navbar__link" onClick={onCursosClick}>
              Mis cursos
              {cursos.length > 0 && (
                <span className="navbar__badge">{cursos.length}</span>
              )}
            </button>
            <button className="navbar__link" onClick={onPlantillasClick}>Plantillas</button>
            <button className="navbar__link" onClick={onHistorialClick}>Historial</button>
            <button className="navbar__link" onClick={onDashboardClick}>Métricas</button>
            <span className="navbar__email">{user.email}</span>
          </>
        )}

        {user ? (
          <button className="navbar__link navbar__link--logout" onClick={logout}>
            Salir
          </button>
        ) : (
          <a href="/login.html" className="navbar__link">
            Iniciar sesión
          </a>
        )}

        <button
          className="btn btn-primary"
          onClick={scrollToForm}
          style={{ padding: "9px 18px", fontSize: 13, fontWeight: 600, willChange: "transform" }}
          {...primaryHover}
        >
          Generar reporte
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user:              PropTypes.object,
  logout:            PropTypes.func.isRequired,
  scrollToForm:      PropTypes.func.isRequired,
  onLogoClick:       PropTypes.func.isRequired,
  cursos:            PropTypes.arrayOf(PropTypes.object),
  onCursosClick:     PropTypes.func.isRequired,
  onPlantillasClick: PropTypes.func.isRequired,
  onHistorialClick:  PropTypes.func.isRequired,
  onDashboardClick:  PropTypes.func.isRequired,
};

Navbar.defaultProps = { user: null, cursos: [] };

export default Navbar;
