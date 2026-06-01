# DocuIA — Rediseño UX/UI Completo
### Prompt de ejecución para Claude Code · `/frontend-design`

---

## ⚠️ Regla de oro

**Solo tocar archivos de presentación.** No modificar lógica de negocio, llamadas a API, manejo de estado, auth, ni utilidades. Los archivos a modificar son exclusivamente:
- `src/App.css` — reemplazar completamente
- `src/components/*.css` · `src/components/CursosView.css` — reemplazar completamente  
- `public/login.css` — reemplazar completamente
- JSX de componentes: **solo la capa de presentación** (clases, estructura HTML, elementos decorativos)
- `index.html` — solo `<head>`: fuentes, meta tags

**NO modificar:** `App.jsx` (lógica), `api/`, `lib/`, `src/utils/`, `src/config.js`, `src/components/Toast.jsx` (lógica interna), `src/components/ErrorBoundary.jsx`.

---

## Concepto de diseño: **"Liquid Intelligence"**

DocuIA automatiza lo burocrático para que el docente se enfoque en enseñar. El diseño debe sentirse como **inteligencia fluyendo** — precisa, viva, confiable. No un formulario. No un dashboard genérico. Una herramienta que transmite: *"esto genera algo real y profesional"*.

**La emoción objetivo al entrar:** asombro tranquilo. Como abrir una aplicación de lujo que también funciona perfectamente.

**Referentes visuales de dirección:** Linear.app (precisión) + Vercel (dark elegante) + Notion (confianza) — pero con **fluidez latinoamericana**: más cálido, más vivo, menos frío.

---

## Sistema de diseño — Design Tokens

### Paleta de colores

```css
:root {
  /* === FONDOS === */
  --bg-base:        #060D1A;   /* Profundidad: azul marino casi negro */
  --bg-surface:     #0D1829;   /* Cards y paneles */
  --bg-elevated:    #14223A;   /* Modales, dropdowns */
  --bg-hover:       #1A2D4A;   /* Estados hover en superficies */

  /* === ACENTO PRIMARIO: Jade eléctrico === */
  --jade-50:        #E6FFF9;
  --jade-100:       #CCFFF3;
  --jade-400:       #2EEABC;
  --jade-500:       #00D4A8;   /* ← color principal de marca */
  --jade-600:       #00B891;
  --jade-700:       #009678;

  /* === ACENTO SECUNDARIO: Ámbar dorado === */
  --amber-400:      #FFC24A;
  --amber-500:      #F5A623;   /* ← highlights, íconos de valor */
  --amber-600:      #D4881A;

  /* === TEXTO === */
  --text-primary:   #F0F4FF;   /* Blanco azulado — no puro blanco */
  --text-secondary: #8BA3C7;   /* Subtítulos, metadatos */
  --text-muted:     #4A6080;   /* Placeholders, deshabilitados */
  --text-inverse:   #060D1A;   /* Texto sobre superficies jade */

  /* === BORDES === */
  --border-subtle:  rgba(45, 120, 200, 0.12);
  --border-default: rgba(45, 120, 200, 0.22);
  --border-strong:  rgba(0, 212, 168, 0.35);

  /* === ESTADOS === */
  --success:        #00D4A8;
  --error:          #FF5B6B;
  --warning:        #F5A623;
  --info:           #4A90E2;

  /* === GRADIENTES === */
  --grad-jade:      linear-gradient(135deg, #00D4A8 0%, #00B891 100%);
  --grad-amber:     linear-gradient(135deg, #FFC24A 0%, #F5A623 100%);
  --grad-surface:   linear-gradient(135deg, #0D1829 0%, #14223A 100%);
  --grad-hero:      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,168,0.18) 0%, transparent 70%),
                    radial-gradient(ellipse 60% 40% at 80% 50%,  rgba(245,166,35,0.08) 0%, transparent 60%),
                    #060D1A;
  --grad-glow-jade: 0 0 40px rgba(0, 212, 168, 0.25), 0 0 80px rgba(0, 212, 168, 0.10);
  --grad-glow-card: 0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255,255,255,0.05) inset;

  /* === ESPACIADO === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* === TIPOGRAFÍA === */
  --font-display: 'Syne', sans-serif;      /* Encabezados grandes — geométrico futurista */
  --font-body:    'Figtree', sans-serif;   /* UI y cuerpo — cálido, legible */
  --font-mono:    'JetBrains Mono', monospace;

  /* === BORDES REDONDEADOS === */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* === TRANSICIONES === */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in:      cubic-bezier(0.4, 0, 1, 1);
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-xslow:  600ms;
}

/* Light mode — solo si el usuario lo prefiere */
@media (prefers-color-scheme: light) {
  :root {
    --bg-base:        #F4F7FB;
    --bg-surface:     #FFFFFF;
    --bg-elevated:    #FFFFFF;
    --bg-hover:       #EEF3FA;
    --text-primary:   #0D1829;
    --text-secondary: #4A6080;
    --text-muted:     #8BA3C7;
    --border-subtle:  rgba(13, 24, 41, 0.08);
    --border-default: rgba(13, 24, 41, 0.14);
    --grad-hero:      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,168,0.12) 0%, transparent 70%), #F4F7FB;
    --grad-glow-card: 0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset;
  }
}
```

### Tipografía — agregar en `index.html`

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Figtree:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Escala tipográfica

```css
--text-xs:   11px; line-height: 1.5; letter-spacing: 0.04em;
--text-sm:   13px; line-height: 1.5;
--text-base: 15px; line-height: 1.6;
--text-lg:   17px; line-height: 1.5;
--text-xl:   20px; line-height: 1.4;
--text-2xl:  24px; line-height: 1.3;
--text-3xl:  30px; line-height: 1.2;
--text-4xl:  38px; line-height: 1.15; font-family: var(--font-display);
--text-5xl:  52px; line-height: 1.05; font-family: var(--font-display);
--text-hero: 72px; line-height: 0.95; font-family: var(--font-display); font-weight: 800;
```

---

## Componentes — Especificaciones de rediseño

### 1. `index.html` — Background global

El `<body>` tiene el background animado de la aplicación. Implementar con CSS puro:

```css
body {
  background: var(--bg-base);
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--text-primary);
  overflow-x: hidden;
}

/* Aurora de fondo — capa decorativa fija, no interfiere con contenido */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse 70% 50% at 15% 20%, rgba(0,212,168,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 70%, rgba(245,166,35,0.05) 0%, transparent 55%),
    radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,180,145,0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  animation: auroraShift 20s ease-in-out infinite alternate;
}

@keyframes auroraShift {
  0%   { opacity: 1; transform: scale(1) translateY(0); }
  50%  { opacity: 0.7; transform: scale(1.05) translateY(-20px); }
  100% { opacity: 1; transform: scale(0.97) translateY(10px); }
}

/* Todo el contenido sobre la aurora */
#root { position: relative; z-index: 1; }
```

---

### 2. `public/login.html` + `public/login.css` — Pantalla de entrada

**Es la primera impresión. Tiene que ser impactante.**

**Layout:** Split asimétrico 45/55. Lado izquierdo: branding + propuesta de valor. Lado derecho: formulario flotante.

**Lado izquierdo:**
- Background: `var(--grad-hero)` con la aurora animada
- Logo: "DocuIA" en `var(--font-display)` 800 weight, con el punto de la "i" reemplazado por un cuadrado jade `■` o con la "IA" en color jade
- Tagline grande (3xl-4xl): *"Reportes que antes tomaban horas,*  
  *ahora en segundos."*
- Tres bullet points con íconos SVG inline:
  - `⚡ Generación instantánea con IA`
  - `🏫 Diseñado para Fe y Alegría Ecuador`
  - `📄 Formatos institucionales respetados`
- En la parte inferior: logos/badges sutiles de confianza

**Decoración lado izquierdo:**
```css
/* Orb jade flotante — elemento héroe decorativo */
.hero-orb {
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,168,0.15) 0%, transparent 70%);
  filter: blur(60px);
  animation: orbFloat 8s ease-in-out infinite;
  pointer-events: none;
}
@keyframes orbFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-30px) scale(1.05); }
}
```

**Lado derecho — formulario:**
- Card glassmorphism:
```css
.login-card {
  background: rgba(13, 24, 41, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--grad-glow-card);
  padding: var(--space-10);
}
```
- Título: "Bienvenido de vuelta" (login) / "Crea tu cuenta" (signup) en Syne 700
- Inputs con borde jade al hacer focus:
```css
.input-field {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 14px 16px;
  transition: border-color var(--duration-base) var(--ease-smooth),
              box-shadow var(--duration-base) var(--ease-smooth);
}
.input-field:focus {
  border-color: var(--jade-500);
  box-shadow: 0 0 0 3px rgba(0,212,168,0.12);
  outline: none;
}
```
- Botón primario — jade con efecto shimmer al hover:
```css
.btn-primary {
  background: var(--grad-jade);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 28px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-fast) var(--ease-spring),
              box-shadow var(--duration-base) var(--ease-smooth);
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--grad-glow-jade);
}
.btn-primary:hover::after {
  transform: translateX(100%);
}
.btn-primary:active {
  transform: translateY(0);
}
```

**Animación de entrada del formulario:**
```css
.login-card {
  animation: cardReveal 0.7s var(--ease-spring) both;
}
@keyframes cardReveal {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Mobile:** stack vertical, lado izquierdo se convierte en header compacto con logo y tagline en 1 línea.

---

### 3. `Navbar.jsx` — Barra de navegación

**Concepto:** Flotante, translúcida, con blur — no pegada al top como una barra corporativa.

```css
.navbar {
  position: sticky;
  top: 12px;
  margin: 12px 24px 0;
  background: rgba(13, 24, 41, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.04) inset;
}

.navbar-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.navbar-logo span { /* el "IA" */
  color: var(--jade-500);
}

.nav-links {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.nav-link {
  padding: 7px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-smooth),
              background var(--duration-fast) var(--ease-smooth);
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.active {
  color: var(--jade-500);
  background: rgba(0, 212, 168, 0.08);
}

/* Badge de conteo (Mis cursos N) */
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--jade-500);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  margin-left: 6px;
}

/* Botón salir — ghost destructivo */
.nav-btn-logout {
  padding: 7px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  color: var(--text-muted);
  background: transparent;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}
.nav-btn-logout:hover {
  border-color: rgba(255, 91, 107, 0.3);
  color: #FF5B6B;
  background: rgba(255, 91, 107, 0.06);
}
```

---

### 4. `LandingPage.jsx` — Landing / Hero

#### HeroSection

**Layout:** Centrado, con texto en 2 líneas y orb decorativo de fondo.

```css
.hero-section {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-24) var(--space-6);
  position: relative;
}

/* Orb de fondo */
.hero-glow {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px; height: 400px;
  background: radial-gradient(ellipse, rgba(0,212,168,0.12) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  animation: orbFloat 10s ease-in-out infinite;
}

/* Pill badge de categoría */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 14px;
  background: rgba(0, 212, 168, 0.08);
  border: 1px solid rgba(0, 212, 168, 0.25);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--jade-500);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: var(--space-6);
  animation: badgeReveal 0.5s var(--ease-spring) 0.2s both;
}
.hero-badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--jade-500);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(42px, 7vw, 80px);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  animation: titleReveal 0.7s var(--ease-spring) 0.3s both;
}

/* La palabra "segundos" en jade con underline decorativo */
.hero-title .highlight {
  color: var(--jade-500);
  position: relative;
  display: inline-block;
}
.hero-title .highlight::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0; right: 0;
  height: 3px;
  background: var(--grad-jade);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  animation: underlineReveal 0.5s var(--ease-spring) 1s both;
}
@keyframes underlineReveal {
  to { transform: scaleX(1); }
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 520px;
  margin: 0 auto var(--space-10);
  line-height: 1.6;
  animation: subtitleReveal 0.6s var(--ease-smooth) 0.5s both;
}
```

#### StatsSection

Tres stat cards en una fila horizontal con animación count-up (Anime.js ya lo hace):

```css
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  max-width: 700px;
  margin: 0 auto var(--space-16);
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-base) var(--ease-spring),
              border-color var(--duration-base) var(--ease-smooth),
              box-shadow var(--duration-base) var(--ease-smooth);
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad-jade);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-smooth);
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: 0 8px 32px rgba(0,212,168,0.15);
}
.stat-card:hover::before { opacity: 0.03; }

.stat-number {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 800;
  color: var(--jade-500);
  line-height: 1;
  margin-bottom: var(--space-2);
}
.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

#### HowItWorksSection

3 pasos con línea conectora entre ellos:

```css
.how-it-works {
  padding: var(--space-20) var(--space-6);
  max-width: 900px;
  margin: 0 auto;
}

.steps-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: start;
  gap: 0;
}

.step-connector {
  height: 2px;
  background: linear-gradient(90deg, var(--jade-500), var(--amber-500));
  margin-top: 28px; /* alineado con centro del step-icon */
  opacity: 0.3;
}

.step-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  transition: transform var(--duration-base) var(--ease-spring);
}
.step-card:hover { transform: translateY(-6px); }

.step-icon {
  width: 56px; height: 56px;
  border-radius: var(--radius-lg);
  background: rgba(0, 212, 168, 0.1);
  border: 1px solid rgba(0, 212, 168, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-size: 24px;
}
/* Cada paso tiene color diferente */
.step-card:nth-child(1) .step-icon { background: rgba(0,212,168,0.1); border-color: rgba(0,212,168,0.2); }
.step-card:nth-child(3) .step-icon { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.2); }
.step-card:nth-child(5) .step-icon { background: rgba(74,144,226,0.1); border-color: rgba(74,144,226,0.2); }
```

#### FormSection (bloque principal de generación)

Esta es la sección más importante — el formulario de generación.

```css
.form-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-20);
}

/* Selector de tipo de reporte — pills horizontales */
.report-type-selector {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
  padding: var(--space-2);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.report-type-pill {
  flex: 1;
  min-width: 100px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
  text-align: center;
  white-space: nowrap;
}
.report-type-pill:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}
.report-type-pill.active {
  background: var(--grad-jade);
  color: var(--text-inverse);
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0,212,168,0.3);
}

/* Card principal del formulario */
.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--grad-glow-card);
  position: relative;
  overflow: hidden;
}

/* Línea decorativa superior */
.form-card::before {
  content: '';
  position: absolute;
  top: 0; left: var(--space-8); right: var(--space-8);
  height: 2px;
  background: var(--grad-jade);
  border-radius: 0 0 2px 2px;
}

/* Grid de campos */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}
.form-grid .full-width { grid-column: 1 / -1; }

/* Selector de curso — bloque compacto antes del formulario */
.curso-selector {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: rgba(0, 212, 168, 0.04);
  border: 1px solid rgba(0, 212, 168, 0.12);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}
.curso-selector label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}
.curso-selector select {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  cursor: pointer;
  outline: none;
}

/* Botón generar — CTA principal */
.btn-generate {
  width: 100%;
  margin-top: var(--space-6);
  padding: 16px 32px;
  background: var(--grad-jade);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 700;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-fast) var(--ease-spring),
              box-shadow var(--duration-base) var(--ease-smooth);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}
.btn-generate:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,212,168,0.4), 0 0 0 1px rgba(0,212,168,0.2);
}
.btn-generate:active { transform: translateY(-1px); }
.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Shimmer en el botón */
.btn-generate::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; right: auto; bottom: 0;
  width: 60%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg);
  animation: btnShimmer 3s ease-in-out infinite;
}
@keyframes btnShimmer {
  0%   { left: -100%; }
  100% { left: 200%; }
}
```

---

### 5. `Field.jsx` — Inputs del formulario

```css
.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  transition: color var(--duration-fast);
}
.field-wrapper:focus-within .field-label {
  color: var(--jade-500);
}

.field-input,
.field-textarea {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  padding: 12px 14px;
  width: 100%;
  transition: border-color var(--duration-base) var(--ease-smooth),
              box-shadow var(--duration-base) var(--ease-smooth),
              background var(--duration-base) var(--ease-smooth);
}
.field-input:focus,
.field-textarea:focus {
  border-color: var(--jade-500);
  box-shadow: 0 0 0 3px rgba(0, 212, 168, 0.12);
  background: rgba(0, 212, 168, 0.03);
  outline: none;
}
.field-input::placeholder,
.field-textarea::placeholder {
  color: var(--text-muted);
}

/* Estado de error */
.field-input.error,
.field-textarea.error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(255, 91, 107, 0.12);
}

/* Mensaje de error */
.field-error {
  font-size: var(--text-xs);
  color: var(--error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Tags/chips de opciones rápidas */
.field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.field-tag {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}
.field-tag:hover {
  border-color: var(--jade-500);
  color: var(--jade-500);
  background: rgba(0, 212, 168, 0.06);
}
.field-tag.selected {
  background: rgba(0, 212, 168, 0.1);
  border-color: var(--jade-500);
  color: var(--jade-500);
}
```

---

### 6. `LoadingView.jsx` — Estado de generación

**Este es el momento mágico. Tiene que verse espectacular.**

Reemplazar cualquier spinner genérico con:

```css
.loading-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--space-8);
  padding: var(--space-12);
}

/* Orb de carga animado */
.loading-orb {
  position: relative;
  width: 120px; height: 120px;
}
.loading-orb-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--jade-400), var(--jade-700));
  animation: orbPulse 2s ease-in-out infinite;
  box-shadow: 0 0 60px rgba(0,212,168,0.4), 0 0 120px rgba(0,212,168,0.15);
}
@keyframes orbPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(0,212,168,0.4); }
  50%       { transform: scale(1.08); box-shadow: 0 0 80px rgba(0,212,168,0.6), 0 0 140px rgba(0,212,168,0.2); }
}

/* Anillos orbitales */
.loading-orb::before,
.loading-orb::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(0, 212, 168, 0.3);
}
.loading-orb::before {
  inset: -16px;
  animation: orbit1 3s linear infinite;
}
.loading-orb::after {
  inset: -32px;
  border-color: rgba(245, 166, 35, 0.2);
  animation: orbit2 5s linear infinite reverse;
}
@keyframes orbit1 { to { transform: rotate(360deg); } }
@keyframes orbit2 { to { transform: rotate(360deg); } }

/* Texto de carga rotativo */
.loading-message {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  animation: messageFloat 0.5s var(--ease-spring);
}
.loading-submessage {
  font-size: var(--text-base);
  color: var(--text-secondary);
  text-align: center;
}

/* Barra de progreso indeterminada */
.loading-bar {
  width: 280px;
  height: 3px;
  background: var(--bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}
.loading-bar-fill {
  height: 100%;
  background: var(--grad-jade);
  border-radius: 3px;
  animation: loadingSlide 1.8s ease-in-out infinite;
}
@keyframes loadingSlide {
  0%   { transform: translateX(-100%); }
  60%  { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}
```

---

### 7. `ReportView.jsx` — Vista del reporte generado

```css
.report-view {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  animation: reportReveal 0.5s var(--ease-spring);
}
@keyframes reportReveal {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header del reporte: tipo + metadatos + acciones */
.report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.report-type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 14px;
  background: rgba(0, 212, 168, 0.08);
  border: 1px solid rgba(0, 212, 168, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--jade-500);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}

.report-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.report-meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Toolbar de acciones (descargar, copiar, etc.) */
.report-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

.btn-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}
.btn-action:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* Botón copiar — se vuelve jade al copiar */
.btn-action.copied {
  border-color: var(--jade-500);
  color: var(--jade-500);
  background: rgba(0, 212, 168, 0.06);
}

/* Contenido del reporte — editable */
.report-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  min-height: 400px;
  position: relative;
  transition: border-color var(--duration-base) var(--ease-smooth);
}
.report-content:focus-within {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px rgba(0,212,168,0.08);
}

/* Indicador de edición activa */
.report-content.editing::before {
  content: 'Modo edición';
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-size: var(--text-xs);
  color: var(--jade-500);
  font-weight: 600;
  padding: 3px 10px;
  background: rgba(0,212,168,0.1);
  border-radius: var(--radius-full);
  border: 1px solid rgba(0,212,168,0.2);
}

/* Cursor de streaming (el que ya existe en el proyecto) */
.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--jade-500);
  border-radius: 1px;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursorBlink 0.8s step-end infinite;
}
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* Tipografía del reporte generado */
.report-content h1, .report-content h2, .report-content h3 {
  font-family: var(--font-display);
  color: var(--text-primary);
  margin: var(--space-6) 0 var(--space-3);
}
.report-content h1 { font-size: var(--text-2xl); font-weight: 700; }
.report-content h2 { font-size: var(--text-xl); font-weight: 600; }
.report-content p  { margin-bottom: var(--space-4); line-height: 1.7; color: var(--text-primary); }
.report-content ul, .report-content ol {
  padding-left: var(--space-6);
  margin-bottom: var(--space-4);
}
.report-content li { margin-bottom: var(--space-2); line-height: 1.6; }

/* Widget feedback 👍👎 */
.feedback-widget {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-subtle);
}
.feedback-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.feedback-buttons {
  display: flex;
  gap: var(--space-2);
}
.feedback-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  background: transparent;
  font-size: var(--text-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}
.feedback-btn:hover { transform: scale(1.15); border-color: var(--border-strong); }
.feedback-btn.positive.active { background: rgba(0,212,168,0.1); border-color: var(--jade-500); }
.feedback-btn.negative.active { background: rgba(255,91,107,0.1); border-color: #FF5B6B; }
```

---

### 8. `CursosView.jsx` · `PlantillasView.jsx` · `HistorialView.jsx`

**Grid consistente para las tres vistas.**

```css
/* Encabezado de vista */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}
.view-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.view-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

/* === CARDS — CursosView === */
.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-5);
}

.curso-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-spring),
              border-color var(--duration-base) var(--ease-smooth),
              box-shadow var(--duration-base) var(--ease-smooth);
  position: relative;
  overflow: hidden;
}
.curso-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--grad-jade);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-smooth);
}
.curso-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: 0 8px 32px rgba(0,212,168,0.12);
}
.curso-card:hover::before { transform: scaleX(1); }

.curso-name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.curso-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin-bottom: var(--space-5);
}
.curso-pill {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: rgba(0,212,168,0.08);
  color: var(--jade-500);
  font-size: var(--text-xs);
  font-weight: 600;
}

/* Estado vacío de las vistas */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) var(--space-6);
  text-align: center;
  gap: var(--space-4);
}
.empty-state-icon {
  font-size: 52px;
  opacity: 0.6;
  animation: emptyFloat 4s ease-in-out infinite;
}
@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.empty-state-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
}
.empty-state-desc {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 360px;
}

/* === HISTORIAL — lista paginada === */
.historial-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.historial-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-4);
  align-items: center;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
}
.historial-item:hover {
  border-color: var(--border-strong);
  background: var(--bg-elevated);
  transform: translateX(4px);
}

/* Indicador de tipo de reporte */
.historial-tipo-indicator {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
/* Colores por tipo */
.tipo-semanal     { background: rgba(0,212,168,0.1); }
.tipo-calificaciones { background: rgba(245,166,35,0.1); }
.tipo-asistencia  { background: rgba(74,144,226,0.1); }
.tipo-dece        { background: rgba(167,139,250,0.1); }
.tipo-planificacion { background: rgba(52,211,153,0.1); }

.historial-info-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--text-base);
  margin-bottom: 2px;
}
.historial-info-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--space-3);
}

/* Barra de filtros */
.historial-filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-wrap: wrap;
}
.filter-select,
.filter-input {
  padding: 9px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast) var(--ease-smooth);
}
.filter-select:focus,
.filter-input:focus {
  border-color: var(--jade-500);
  outline: none;
}
```

---

### 9. `DashboardView.jsx` — Métricas

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.metric-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-base) var(--ease-spring);
}
.metric-card:hover { transform: translateY(-3px); }

/* Degradado sutil en esquina */
.metric-card::after {
  content: '';
  position: absolute;
  top: -20px; right: -20px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,168,0.12), transparent 70%);
  pointer-events: none;
}

.metric-value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 800;
  color: var(--jade-500);
  line-height: 1;
  margin-bottom: var(--space-2);
}
.metric-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}
.metric-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

/* Barra de desglose por tipo */
.breakdown-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}
.breakdown-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.breakdown-bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 40px;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.breakdown-bar-label { font-size: var(--text-sm); color: var(--text-secondary); }
.breakdown-bar-track {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.breakdown-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--grad-jade);
  transition: width 1s var(--ease-spring);
}
.breakdown-bar-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: right;
}
```

---

### 10. `Toast.jsx` — Notificaciones (solo estilos, NO lógica)

```css
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset;
  min-width: 300px;
  max-width: 420px;
  backdrop-filter: blur(20px);
  animation: toastSlideIn 0.35s var(--ease-spring);
}
@keyframes toastSlideIn {
  from { transform: translateX(100%) scale(0.9); opacity: 0; }
  to   { transform: translateX(0) scale(1); opacity: 1; }
}
.toast.dismissing {
  animation: toastSlideOut 0.25s var(--ease-in) forwards;
}
@keyframes toastSlideOut {
  to { transform: translateX(120%); opacity: 0; }
}

/* Borde izquierdo de color por tipo */
.toast.success { border-left: 3px solid var(--success); }
.toast.error   { border-left: 3px solid var(--error); }
.toast.warning { border-left: 3px solid var(--warning); }
.toast.info    { border-left: 3px solid var(--info); }

.toast-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.toast-title { font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); }
.toast-message { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 2px; }
.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
  transition: color var(--duration-fast);
}
.toast-close:hover { color: var(--text-primary); }
```

---

### 11. Onboarding modal (nuevo componente)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 13, 26, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  animation: overlayIn 0.25s var(--ease-smooth);
}
@keyframes overlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-10);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  animation: modalReveal 0.4s var(--ease-spring);
  position: relative;
  overflow: hidden;
}
.modal-card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 2px;
  background: var(--grad-jade);
}
@keyframes modalReveal {
  from { opacity: 0; transform: scale(0.93) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Pasos del onboarding */
.onboarding-step-icon {
  width: 72px; height: 72px;
  border-radius: var(--radius-xl);
  background: rgba(0,212,168,0.08);
  border: 1px solid rgba(0,212,168,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto var(--space-6);
}

.onboarding-dots {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-8);
}
.onboarding-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--bg-hover);
  transition: all var(--duration-base) var(--ease-smooth);
}
.onboarding-dot.active {
  background: var(--jade-500);
  width: 24px;
  border-radius: 4px;
}
```

---

### 12. Banner de advertencia de inconsistencia

```css
.inconsistency-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: rgba(245, 166, 35, 0.08);
  border: 1px solid rgba(245, 166, 35, 0.25);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-5);
  animation: bannerSlideDown 0.35s var(--ease-spring);
}
@keyframes bannerSlideDown {
  from { opacity: 0; transform: translateY(-12px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 120px; }
}
.inconsistency-banner-icon { font-size: 20px; flex-shrink: 0; }
.inconsistency-banner-text { font-size: var(--text-sm); color: var(--text-primary); flex: 1; }
.inconsistency-banner-close {
  background: none; border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  transition: color var(--duration-fast);
}
.inconsistency-banner-close:hover { color: var(--text-primary); }
```

---

## Animaciones globales con Anime.js

Preservar todos los hooks existentes en `src/utils/anim.js`. **Solo actualizar los parámetros de animación** para que sean más fluidos:

```javascript
// Parámetros recomendados para useEnter
duration: 700,
easing: 'spring(1, 80, 10, 0)',  // spring más suave
delay: anime.stagger(80),         // stagger reducido para más fluidez

// Para useCountUp
duration: 1200,
easing: 'easeOutExpo',
round: 1,

// Para scroll-reveal
translateY: [24, 0],
opacity: [0, 1],
duration: 600,
easing: 'easeOutCubic',
delay: anime.stagger(100, { start: 150 }),
```

---

## Responsive — Breakpoints

```css
/* Mobile first */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */

@media (max-width: 768px) {
  .navbar { margin: 8px 12px 0; padding: 8px 14px; }
  .form-grid { grid-template-columns: 1fr; }
  .stats-section { grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
  .report-actions { gap: var(--space-2); }
  .btn-action span { display: none; } /* Solo íconos en mobile */
  .historial-item { grid-template-columns: auto 1fr; }
  .historial-item > *:last-child { grid-column: 2; } /* acciones debajo */
}

@media (max-width: 480px) {
  .hero-title { font-size: 38px; }
  .stats-section { grid-template-columns: 1fr; max-width: 280px; }
  .report-type-selector { flex-direction: column; }
  .report-type-pill { text-align: left; }
}
```

---

## Checklist de validación visual

- [ ] Login page — split asimétrico funciona en desktop, stack en mobile
- [ ] Aurora animada de fondo no causa jank (usar `will-change: transform` solo en elementos animados)
- [ ] Navbar flotante visible y funcional en todas las vistas
- [ ] Formulario → tipo de reporte pills funcionan, campos se reorganizan sin flash
- [ ] LoadingView → orb animado visible, texto rotativo funciona
- [ ] ReportView → streaming cursor jade visible durante generación
- [ ] Dark mode default · light mode respeta prefers-color-scheme
- [ ] Fuentes Syne y Figtree cargan correctamente (verificar en DevTools → Network)
- [ ] Sin scroll horizontal en ningún breakpoint
- [ ] Estados vacíos presentes en Cursos, Plantillas e Historial
- [ ] `prefers-reduced-motion` desactiva todas las animaciones decorativas
- [ ] Contrast ratio AA mínimo en texto secundario sobre fondos de surface

---

## Dependencias de fuentes — confirmar en `index.html`

```html
<!-- Reemplazar cualquier Google Fonts existente con: -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Sin dependencias nuevas de npm.** Todo el diseño usa CSS puro + las variables definidas arriba + Anime.js ya instalado.
