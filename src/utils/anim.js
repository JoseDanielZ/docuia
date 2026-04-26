// ═══════════════════════════════════════════════════════════════════════════════
// DocuIA — Animation utilities (anime.js v4)
// Hooks declarativos para animaciones consistentes en todo el proyecto.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger, utils } from "animejs";

// Respeta la preferencia del usuario por menos movimiento
const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ── Entrada simple (fade-up al montar) ───────────────────────────────────────
export function useEnter(ref, opts = {}) {
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { delay = 0, y = 16, duration = 700, ease = "outExpo" } = opts;
    utils.set(ref.current, { opacity: 0, translateY: y });
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [y, 0],
      duration,
      delay,
      ease,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Stagger sobre hijos directos (o selector) ────────────────────────────────
export function useStaggerChildren(parentRef, opts = {}) {
  const {
    selector,
    y = 18,
    duration = 650,
    delay = 80,
    start = 0,
    ease = "outExpo",
    deps = [],
  } = opts;

  useEffect(() => {
    const root = parentRef.current;
    if (!root || reducedMotion()) return;
    const targets = selector ? root.querySelectorAll(selector) : Array.from(root.children);
    if (!targets.length) return;
    utils.set(targets, { opacity: 0, translateY: y });
    animate(targets, {
      opacity: [0, 1],
      translateY: [y, 0],
      duration,
      delay: stagger(delay, { start }),
      ease,
    });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Count-up de un número (con sufijo opcional, ej "%") ───────────────────────
export function useCountUp(ref, target, opts = {}) {
  const {
    duration = 1400,
    delay = 0,
    suffix = "",
    decimals = 0,
    ease = "outExpo",
  } = opts;

  useEffect(() => {
    if (!ref.current) return;
    if (reducedMotion()) {
      ref.current.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const obj = { value: 0 };
    animate(obj, {
      value: target,
      duration,
      delay,
      ease,
      onUpdate: () => {
        if (ref.current) ref.current.textContent = obj.value.toFixed(decimals) + suffix;
      },
    });
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Split de texto en palabras y stagger entrance ─────────────────────────────
// (Implementación propia para evitar depender del wrapping de splitText() del SDK,
// y para que respete el HTML existente como <em>.)
export function useSplitWordsEnter(ref, opts = {}) {
  const {
    delay = 0,
    perWord = 45,
    y = 24,
    duration = 900,
    ease = "outExpo",
    deps = [],
  } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    if (el.dataset.splitDone === "1") return;

    // Recorre nodos texto y los divide en spans por palabra preservando otros nodes
    const wrapWords = (root) => {
      const out = [];
      root.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement("span");
              span.className = "anim-word";
              span.style.display = "inline-block";
              span.style.willChange = "transform, opacity";
              span.textContent = part;
              frag.appendChild(span);
              out.push(span);
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          out.push(...wrapWords(node));
        }
      });
      return out;
    };

    const words = wrapWords(el);
    el.dataset.splitDone = "1";
    if (!words.length) return;

    utils.set(words, { opacity: 0, translateY: y });
    animate(words, {
      opacity: [0, 1],
      translateY: [y, 0],
      duration,
      delay: stagger(perWord, { start: delay }),
      ease,
    });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Reveal al hacer scroll (IntersectionObserver) ─────────────────────────────
export function useScrollReveal(ref, opts = {}) {
  const {
    selector,
    y = 22,
    duration = 800,
    delay = 80,
    ease = "outExpo",
    threshold = 0.18,
  } = opts;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = selector ? root.querySelectorAll(selector) : [root];
    if (!targets.length) return;
    if (reducedMotion()) return;

    utils.set(targets, { opacity: 0, translateY: y });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = selector ? entry.target.querySelectorAll(selector) : [entry.target];
          animate(items, {
            opacity: [0, 1],
            translateY: [y, 0],
            duration,
            delay: stagger(delay),
            ease,
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });

    observer.observe(root);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Pop / pulse para feedback (ej. botón "copiado") ──────────────────────────
export function pop(target, opts = {}) {
  if (!target || reducedMotion()) return;
  const { scale = 1.06, duration = 380, ease = "outElastic(1, .6)" } = opts;
  animate(target, {
    scale: [1, scale, 1],
    duration,
    ease,
  });
}

// ── Hover lift (devuelve handlers para onMouseEnter/Leave) ───────────────────
export function magneticHover() {
  let current = null;
  return {
    onMouseEnter: (e) => {
      if (reducedMotion()) return;
      current = e.currentTarget;
      animate(current, { translateY: -4, duration: 320, ease: "outQuart" });
    },
    onMouseLeave: () => {
      if (!current || reducedMotion()) return;
      animate(current, { translateY: 0, duration: 380, ease: "outQuart" });
      current = null;
    },
  };
}

// ── Fade morph entre dos valores de texto ─────────────────────────────────────
export function useTextMorph(ref, value, opts = {}) {
  const { duration = 220 } = opts;
  const prev = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || prev.current === value) {
      el.textContent = value;
      prev.current = value;
      return;
    }
    animate(el, {
      opacity: [1, 0],
      translateY: [0, -4],
      duration,
      ease: "outQuad",
      onComplete: () => {
        el.textContent = value;
        animate(el, {
          opacity: [0, 1],
          translateY: [4, 0],
          duration,
          ease: "outQuad",
        });
        prev.current = value;
      },
    });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Helper: timeline con defaults razonables ─────────────────────────────────
export function timeline(opts = {}) {
  return createTimeline({
    defaults: { duration: 700, ease: "outExpo" },
    ...opts,
  });
}
