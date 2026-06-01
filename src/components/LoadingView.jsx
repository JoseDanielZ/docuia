import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";
import { useTextMorph } from "../utils/anim.js";
import "./LoadingView.css";

export default function LoadingView({ loadMsg }) {
  const wrapRef  = useRef(null);
  const orbRef   = useRef(null);
  const ring1    = useRef(null);
  const ring2    = useRef(null);
  const ring3    = useRef(null);
  const dotsRef  = useRef(null);
  const arcRef   = useRef(null);
  const titleRef = useRef(null);
  const msgRef   = useRef(null);
  const barRef   = useRef(null);
  const microRef = useRef(null);

  useTextMorph(msgRef, loadMsg, { duration: 240 });

  useEffect(() => {
    if (!orbRef.current) return;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    utils.set(orbRef.current,   { opacity: 0, scale: 0.8 });
    utils.set(titleRef.current, { opacity: 0, translateY: 16 });
    utils.set(msgRef.current,   { opacity: 0, translateY: 8 });
    utils.set(barRef.current,   { opacity: 0 });
    utils.set(microRef.current, { opacity: 0 });

    tl.add(orbRef.current,   { opacity: [0, 1], scale: [0.8, 1], duration: 800 }, 0)
      .add(titleRef.current, { opacity: [0, 1], translateY: [16, 0], duration: 650 }, 200)
      .add(msgRef.current,   { opacity: [0, 1], translateY: [8, 0], duration: 500 }, 380)
      .add(barRef.current,   { opacity: [0, 1], duration: 400 }, 480)
      .add(microRef.current, { opacity: [0, 1], duration: 400 }, 560);

    if (ring1.current) animate(ring1.current, { rotate: 360, duration: 4000, ease: "linear", loop: true });
    if (ring2.current) animate(ring2.current, { rotate: -360, duration: 7000, ease: "linear", loop: true });
    if (ring3.current) animate(ring3.current, { rotate: 360, duration: 11000, ease: "linear", loop: true });

    if (arcRef.current) {
      const len = 188;
      arcRef.current.style.strokeDasharray = `${len}`;
      animate(arcRef.current, {
        strokeDashoffset: [
          { from: len, to: len * 0.15, duration: 1100, ease: "inOutSine" },
          { to: len, duration: 1100, ease: "inOutSine" },
        ],
        loop: true,
      });
    }

    if (dotsRef.current) {
      animate(dotsRef.current.children, {
        translateY: [0, -7, 0], opacity: [1, 0.3, 1],
        duration: 1200, loop: true, delay: stagger(180), ease: "inOutSine",
      });
    }
  }, []);

  return (
    <div ref={wrapRef} className="loading-view">
      <div className="loading-inner">

        {/* Sistema orbital */}
        <div ref={orbRef} className="loading-orb-wrap" style={{ willChange: "transform, opacity" }}>
          <div className="loading-orb-glow" />
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "relative", zIndex: 1 }}>
            <g ref={ring3} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(0,212,168,0.15)" strokeWidth="1" strokeDasharray="3 7" />
            </g>
            <g ref={ring2} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="46" fill="none" stroke="rgba(0,212,168,0.12)" strokeWidth="1" />
              <circle cx="70" cy="24" r="4" fill="var(--amber-500)" opacity="0.8" />
            </g>
            <g ref={ring1} style={{ transformOrigin: "70px 70px" }}>
              <circle cx="70" cy="70" r="30" fill="none" stroke="rgba(0,212,168,0.2)" strokeWidth="1" />
              <circle ref={arcRef} cx="70" cy="70" r="30" fill="none" stroke="var(--jade-500)" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 70 70)" />
            </g>
            <circle cx="70" cy="70" r="14" fill="rgba(0,212,168,0.15)" stroke="rgba(0,212,168,0.4)" strokeWidth="1" />
            <circle cx="70" cy="70" r="7" fill="var(--jade-500)" />
            <circle cx="70" cy="70" r="3" fill="rgba(255,255,255,0.8)" />
          </svg>
        </div>

        <h2 ref={titleRef} className="loading-title" style={{ willChange: "transform, opacity" }}>
          Generando tu reporte
        </h2>

        <p ref={msgRef} className="loading-message" style={{ willChange: "transform, opacity" }}>
          {loadMsg}
        </p>

        <div ref={barRef} className="loading-bar-track" style={{ willChange: "opacity" }}>
          <div className="loading-bar-fill" />
        </div>

        <div ref={dotsRef} className="loading-dots">
          {[0, 1, 2].map(i => (
            <span key={i} className="loading-dot" style={{ willChange: "transform, opacity" }} />
          ))}
        </div>

        <p ref={microRef} className="loading-footer" style={{ willChange: "opacity" }}>
          Esto puede tomar entre 15 y 30 segundos
        </p>
      </div>
    </div>
  );
}
