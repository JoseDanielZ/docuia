import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { useTextMorph } from "../utils/anim.js";

export default function LoadingView({ loadMsg }) {
  const orbRef = useRef(null);
  const ring1 = useRef(null);
  const ring2 = useRef(null);
  const ring3 = useRef(null);
  const dotsRef = useRef(null);
  const arcRef = useRef(null);
  const titleRef = useRef(null);
  const msgRef = useRef(null);
  const microRef = useRef(null);

  // Morph del mensaje (typewriter-fade)
  useTextMorph(msgRef, loadMsg, { duration: 240 });

  useEffect(() => {
    if (!orbRef.current) return;

    // Entrada del bloque entero
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    utils.set(orbRef.current, { opacity: 0, scale: 0.85 });
    utils.set(titleRef.current, { opacity: 0, translateY: 12 });
    utils.set(msgRef.current, { opacity: 0, translateY: 8 });
    utils.set(microRef.current, { opacity: 0 });

    tl.add(orbRef.current, { opacity: [0, 1], scale: [0.85, 1], duration: 700 }, 0)
      .add(titleRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 600 }, 200)
      .add(msgRef.current, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, 350)
      .add(microRef.current, { opacity: [0, 1], duration: 500 }, 500);

    // Rotaciones orbitales de los 3 anillos a velocidades distintas
    if (ring1.current) {
      animate(ring1.current, {
        rotate: 360,
        duration: 5000,
        ease: "linear",
        loop: true,
      });
    }
    if (ring2.current) {
      animate(ring2.current, {
        rotate: -360,
        duration: 8000,
        ease: "linear",
        loop: true,
      });
    }
    if (ring3.current) {
      animate(ring3.current, {
        rotate: 360,
        duration: 12000,
        ease: "linear",
        loop: true,
      });
    }

    // Arco "barrido" — pulsa el strokeDashoffset
    if (arcRef.current) {
      const len = 188; // 2π·30
      arcRef.current.style.strokeDasharray = `${len}`;
      animate(arcRef.current, {
        strokeDashoffset: [
          { from: len, to: len * 0.18, duration: 1100, ease: "inOutSine" },
          { to: len, duration: 1100, ease: "inOutSine" },
        ],
        loop: true,
      });
    }

    // Puntos pulsantes en la base (3 dots)
    if (dotsRef.current) {
      const dots = dotsRef.current.children;
      animate(dots, {
        translateY: [0, -6, 0],
        opacity: [{ to: 1, duration: 0 }, { to: 0.4, duration: 600 }, { to: 1, duration: 600 }],
        duration: 1200,
        loop: true,
        delay: stagger(180),
        ease: "inOutSine",
      });
    }
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "80vh", background: "var(--paper)",
      padding: "40px 24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        {/* Sistema orbital */}
        <div ref={orbRef} style={{
          position: "relative",
          width: 140, height: 140,
          margin: "0 auto 36px",
          willChange: "transform, opacity",
        }}>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", inset: 0 }}>
            {/* Anillo grande exterior con tick marks */}
            <g ref={ring3} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="62" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 6" />
            </g>
            {/* Anillo medio */}
            <g ref={ring2} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="46" fill="none" stroke="var(--paper-3)" strokeWidth="1" />
              <circle cx="70" cy="24" r="3" fill="color-mix(in srgb, var(--accent) 80%, var(--ink))" />
            </g>
            {/* Anillo chico con arco animado */}
            <g ref={ring1} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="30" fill="none" stroke="var(--paper-3)" strokeWidth="1" />
              <circle
                ref={arcRef}
                cx="70"
                cy="70"
                r="30"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2"
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </g>
            {/* Núcleo */}
            <circle cx="70" cy="70" r="6" fill="var(--ink)" />
            <circle cx="70" cy="70" r="11" fill="none" stroke="color-mix(in srgb, var(--accent) 50%, var(--paper))" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        <h2 ref={titleRef} style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 400, fontSize: 26,
          color: "var(--ink)", margin: "0 0 14px",
          letterSpacing: "-.02em",
          willChange: "transform, opacity",
        }}>
          Generando su reporte
        </h2>

        {/* Mensaje con morph */}
        <p
          ref={msgRef}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "color-mix(in srgb, var(--accent) 80%, var(--ink))",
            margin: "0 0 18px",
            minHeight: 18,
            willChange: "transform, opacity",
          }}
        >
          {loadMsg}
        </p>

        {/* Dots */}
        <div ref={dotsRef} style={{
          display: "flex", justifyContent: "center", gap: 8,
          marginBottom: 22,
        }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: "inline-block",
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--ink)",
              willChange: "transform, opacity",
            }} />
          ))}
        </div>

        <p ref={microRef} style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11, color: "var(--muted)",
          letterSpacing: ".04em",
          margin: 0,
        }}>
          Esto puede tomar entre 15 y 30 segundos
        </p>
      </div>
    </div>
  );
}
