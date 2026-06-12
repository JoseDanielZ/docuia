# DocuIA — Plan de Implementación: Bot Asistente "Lucía"

> Feature: Asistente virtual contextual para docentes  
> Versión: junio 2026  
> Preparado para: Claude Code  
> Stack: React + Vite · API Serverless (`api/generate.mjs`) · Supabase  

---

## 0. Resumen Ejecutivo

Implementar un bot asistente llamado **"Lucía"** que aparece en 4 modalidades:

| Modalidad | Trigger | Descripción |
|---|---|---|
| **Flotante** | Siempre visible | Botón fijo esquina inferior derecha. Abre chat de FAQ |
| **Contextual** | Cambio de pantalla | Pop-up proactivo según la vista activa del docente |
| **Tooltip** | Hover sobre botones | Descripción corta al pasar el mouse por elementos de UI |
| **Idle** | 30 s sin interacción | Pop-up suave si el usuario está perdido en la pantalla |

**Inteligencia:** FAQ estático — sin llamadas a API, sin costo, respuestas instantáneas.  
**Personaje:** Lucía — asistente amigable de Fe y Alegría, tono cálido, lenguaje simple para docentes.

---

## 1. Estructura de Archivos a Crear

```
src/
├── components/
│   └── assistant/
│       ├── AssistantBot.jsx          ← Componente raíz (orquesta todo)
│       ├── FloatingButton.jsx        ← Botón flotante + burbuja de chat
│       ├── ContextualPopup.jsx       ← Pop-up proactivo por vista
│       ├── IdlePopup.jsx             ← Pop-up tras 30 s sin interacción
│       ├── TooltipHelper.jsx         ← Wrapper de tooltip para cualquier elemento
│       └── AssistantChat.jsx         ← Ventana de chat con FAQ interactivo
├── data/
│   └── assistant/
│       ├── faq.js                    ← Base de conocimiento completa del sistema
│       └── contextHints.js          ← Mensajes proactivos por vista/pantalla
└── hooks/
    └── useIdleDetector.js            ← Hook para detectar inactividad
```

**Archivos a modificar:**
```
src/App.jsx                           ← Montar <AssistantBot /> globalmente
src/components/[cada vista].jsx       ← Agregar atributo data-view="nombre"
```

---

## 2. Base de Conocimiento — `src/data/assistant/faq.js`

Crear el archivo con esta estructura. Claude Code debe completar TODAS las respuestas basándose en los documentos de contexto del proyecto.

```js
// src/data/assistant/faq.js

export const FAQ_CATEGORIES = [
  {
    id: 'inicio',
    label: '¿Por dónde empiezo?',
    icon: '🚀',
    questions: [
      {
        id: 'q_inicio_1',
        question: '¿Qué es DocuIA?',
        answer: 'DocuIA es tu asistente para generar documentos oficiales de Fe y Alegría con inteligencia artificial. En lugar de escribir desde cero, tú llenas un formulario y la IA genera el documento completo listo para entregar.'
      },
      {
        id: 'q_inicio_2',
        question: '¿Cómo genero mi primer documento?',
        answer: 'Es simple: 1) Haz clic en "Nuevo Reporte" en el menú. 2) Elige el tipo de documento que necesitas. 3) Llena el formulario con tus datos reales. 4) Haz clic en "Generar" y espera unos segundos. 5) Revisa, edita si necesitas, y descarga en Word.'
      },
      {
        id: 'q_inicio_3',
        question: '¿Necesito saber de tecnología para usar esto?',
        answer: 'No. Si sabes usar WhatsApp, puedes usar DocuIA. Solo llena formularios como si fuera papel, pero en la pantalla.'
      }
    ]
  },
  {
    id: 'documentos',
    label: 'Tipos de documentos',
    icon: '📄',
    questions: [
      {
        id: 'q_doc_1',
        question: '¿Qué documentos puedo generar?',
        answer: 'Actualmente puedes generar: 1) Informe Académico y Comportamental del Docente Tutor/a. 2) Plan de Contingencia para Estudiantes. 3) Planificación Microcurricular — Bachillerato Técnico. También puedes ver tu Reporte de Calificaciones y Asistencia.'
      },
      {
        id: 'q_doc_2',
        question: '¿Qué es el Informe Docente Tutor/a?',
        answer: 'Es el informe trimestral donde reportas el estado académico y comportamental de tu curso. Incluye datos de matrícula, asignaturas con estudiantes en riesgo, situaciones de convivencia, casos de vulnerabilidad y sugerencias a los diferentes estamentos.'
      },
      {
        id: 'q_doc_3',
        question: '¿Qué es el Plan de Contingencia?',
        answer: 'Es el plan de actividades para estudiantes que no pueden asistir normalmente a clases. Incluye el tema, objetivos, instrucciones claras para el estudiante, actividades y material de apoyo.'
      },
      {
        id: 'q_doc_4',
        question: '¿Qué es la Planificación Microcurricular?',
        answer: 'Es la planificación detallada por semanas de tu módulo en Bachillerato Técnico. Incluye contenidos procedimentales, conceptuales y actitudinales, recursos, criterios de evaluación, adaptaciones curriculares y estrategias metodológicas.'
      }
    ]
  },
  {
    id: 'formulario',
    label: 'Cómo llenar el formulario',
    icon: '✏️',
    questions: [
      {
        id: 'q_form_1',
        question: '¿Qué pasa si dejo un campo vacío?',
        answer: 'Si dejas un campo vacío, la IA escribirá "Sin novedad" o "No aplica" en esa sección del documento. Es mejor llenarlo aunque sea brevemente para que el documento refleje la realidad de tu curso.'
      },
      {
        id: 'q_form_2',
        question: '¿Cómo ingreso los nombres de estudiantes?',
        answer: 'Escribe un nombre por línea, así:\nJuan Pérez\nMaría López\nCarlos Torres\nNo uses comas ni puntos. Solo nombre y apellido en cada línea.'
      },
      {
        id: 'q_form_3',
        question: '¿Puedo generar el mismo documento varias veces?',
        answer: 'Sí. Puedes generar, revisar, y si no quedó bien, ajustar los datos del formulario y generar nuevamente. Cada generación queda guardada en tu historial.'
      },
      {
        id: 'q_form_4',
        question: '¿Cuántos estudiantes puedo ingresar máximo?',
        answer: 'Puedes ingresar hasta 40 estudiantes por documento. Si tienes más, divide en dos generaciones separadas.'
      }
    ]
  },
  {
    id: 'historial',
    label: 'Historial y edición',
    icon: '📋',
    questions: [
      {
        id: 'q_hist_1',
        question: '¿Dónde están mis documentos guardados?',
        answer: 'En el menú lateral, haz clic en "Historial". Ahí aparecen todos los documentos que has generado, ordenados del más reciente al más antiguo.'
      },
      {
        id: 'q_hist_2',
        question: '¿Puedo editar un documento después de generarlo?',
        answer: 'Sí. Abre el documento desde el historial y haz clic en el botón de edición. Puedes modificar el texto directamente. Los cambios quedan guardados automáticamente.'
      },
      {
        id: 'q_hist_3',
        question: '¿Puedo recuperar una versión anterior de un documento?',
        answer: 'Sí. En la vista del documento busca el botón "Ver versiones anteriores". Ahí puedes ver todos los cambios y restaurar cualquier versión previa.'
      },
      {
        id: 'q_hist_4',
        question: '¿Cómo busco un documento específico?',
        answer: 'En el historial puedes filtrar por tipo de documento, fecha o trimestre. Usa los filtros en la parte superior de la pantalla.'
      }
    ]
  },
  {
    id: 'descarga',
    label: 'Descargar documentos',
    icon: '⬇️',
    questions: [
      {
        id: 'q_desc_1',
        question: '¿En qué formato descargo los documentos?',
        answer: 'Los documentos se descargan en formato Word (.docx), el mismo que usan todos en la institución. Puedes abrirlo con Microsoft Word, Google Docs o LibreOffice.'
      },
      {
        id: 'q_desc_2',
        question: '¿El documento descargado tiene el formato oficial de Fe y Alegría?',
        answer: 'Sí. El documento usa exactamente el formato y estructura oficial de la institución, incluyendo el encabezado "Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa — Ser más para servir mejor".'
      },
      {
        id: 'q_desc_3',
        question: '¿Puedo imprimir directamente?',
        answer: 'Sí. Descarga el documento y ábrelo en Word o Google Docs. Desde ahí puedes imprimir normalmente con Ctrl+P.'
      }
    ]
  },
  {
    id: 'plantillas',
    label: 'Plantillas',
    icon: '⭐',
    questions: [
      {
        id: 'q_plant_1',
        question: '¿Qué son las plantillas?',
        answer: 'Las plantillas son formularios pre-llenados que tú guardas. Por ejemplo, si siempre trabajas con el mismo grado y paralelo, puedes guardar esos datos como plantilla y no tener que escribirlos cada vez.'
      },
      {
        id: 'q_plant_2',
        question: '¿Cómo guardo una plantilla?',
        answer: 'Después de llenar un formulario, antes de generar, busca el botón "Guardar como plantilla". Ponle un nombre y guárdala. La próxima vez aparecerá en tu lista de plantillas.'
      }
    ]
  },
  {
    id: 'problemas',
    label: 'Algo no funciona',
    icon: '🔧',
    questions: [
      {
        id: 'q_prob_1',
        question: 'El documento generado tiene errores o inventó información',
        answer: 'Revisa que llenaste todos los campos del formulario correctamente. La IA usa exactamente lo que tú escribes — si un dato falta, lo omite o pone "Sin novedad". Vuelve al formulario, corrige los datos y genera nuevamente.'
      },
      {
        id: 'q_prob_2',
        question: 'La generación tarda mucho o no termina',
        answer: 'Espera hasta 30 segundos — es normal para documentos largos como la Planificación Microcurricular. Si pasa de 1 minuto, recarga la página e intenta de nuevo. Si el problema persiste, avisa al coordinador.'
      },
      {
        id: 'q_prob_3',
        question: 'No puedo iniciar sesión',
        answer: 'Verifica que estás usando el correo y contraseña exactos que te asignaron. Si no recuerdas tu contraseña, usa el enlace "¿Olvidé mi contraseña?" en la pantalla de inicio. Si el problema continúa, contacta al administrador del sistema.'
      },
      {
        id: 'q_prob_4',
        question: 'El botón de descargar no funciona',
        answer: 'Verifica que tu navegador no esté bloqueando descargas. En Chrome, mira si aparece un aviso en la barra de dirección. Haz clic en "Permitir" y vuelve a intentar la descarga.'
      }
    ]
  }
];

// Búsqueda simple por texto
export function searchFAQ(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const item of cat.questions) {
      if (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      ) {
        results.push({ ...item, categoryLabel: cat.label });
      }
    }
  }
  return results.slice(0, 5);
}
```

---

## 3. Mensajes Contextuales — `src/data/assistant/contextHints.js`

```js
// src/data/assistant/contextHints.js
// Un mensaje proactivo por vista. Se muestra solo UNA VEZ por sesión por vista.

export const CONTEXT_HINTS = {
  dashboard: {
    message: '¡Hola! 👋 Soy Lucía. ¿Es tu primera vez aquí? Puedo ayudarte a crear tu primer documento en menos de 5 minutos.',
    cta: 'Muéstrame cómo',
    faqId: 'q_inicio_2',
    delay: 4000,       // ms antes de aparecer
    showOnlyOnce: true // clave en localStorage: 'lucia_seen_dashboard'
  },
  nuevo_reporte: {
    message: '📝 Para generar un buen documento, llena todos los campos aunque sea brevemente. Los campos vacíos quedan como "Sin novedad".',
    cta: '¿Qué documentos puedo generar?',
    faqId: 'q_doc_1',
    delay: 3000,
    showOnlyOnce: false // Aparece siempre que entras a nuevo reporte
  },
  historial: {
    message: '📋 Aquí están todos tus documentos. Puedes editar cualquiera o descargarlo nuevamente cuando quieras.',
    cta: '¿Cómo edito un documento?',
    faqId: 'q_hist_2',
    delay: 2000,
    showOnlyOnce: true
  },
  informe_tutor: {
    message: '🧠 Para el Informe Tutor, recuerda ingresar los nombres de los estudiantes reincidentes uno por línea. La IA los organiza automáticamente.',
    cta: '¿Cómo ingreso los nombres?',
    faqId: 'q_form_2',
    delay: 3000,
    showOnlyOnce: false
  },
  contingencia: {
    message: '📋 El Plan de Contingencia debe tener instrucciones claras para que el estudiante pueda trabajar solo en casa. Sé específico en las actividades.',
    cta: '¿Qué es el Plan de Contingencia?',
    faqId: 'q_doc_3',
    delay: 3000,
    showOnlyOnce: false
  },
  microcurricular: {
    message: '📄 Para la Planificación Microcurricular, puedes describir el contenido semanal en texto libre. La IA construirá la tabla por ti.',
    cta: '¿Qué es la Planificación Microcurricular?',
    faqId: 'q_doc_4',
    delay: 3000,
    showOnlyOnce: false
  },
  plantillas: {
    message: '⭐ Las plantillas te ahorran tiempo. Guarda los datos de tu grado y paralelo una sola vez y úsalos en futuros documentos.',
    cta: '¿Cómo uso las plantillas?',
    faqId: 'q_plant_1',
    delay: 2000,
    showOnlyOnce: true
  }
};

// Mensajes idle (cuando el usuario lleva 30 s sin interactuar)
export const IDLE_HINTS = [
  { message: '¿Necesitas ayuda? Estoy aquí para guiarte 😊', cta: 'Sí, ayúdame' },
  { message: '¿Tienes dudas sobre cómo llenar el formulario?', cta: 'Ver consejos' },
  { message: '¿No sabes qué documento generar? Te explico cada uno.', cta: 'Ver documentos' }
];
```

---

## 4. Hook de Detección de Inactividad — `src/hooks/useIdleDetector.js`

```js
// src/hooks/useIdleDetector.js
import { useEffect, useRef, useState } from 'react';

export function useIdleDetector(timeoutMs = 30000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const reset = () => {
    setIsIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // iniciar timer al montar
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      clearTimeout(timerRef.current);
    };
  }, []);

  return isIdle;
}
```

---

## 5. Componentes a Implementar

### 5.1 `AssistantBot.jsx` — Orquestador raíz

```jsx
// src/components/assistant/AssistantBot.jsx
// Monta todos los sub-componentes. Se importa una sola vez en App.jsx.
// Props: currentView (string) — la vista activa del router

import { useState } from 'react';
import FloatingButton from './FloatingButton';
import ContextualPopup from './ContextualPopup';
import IdlePopup from './IdlePopup';
import { useIdleDetector } from '../../hooks/useIdleDetector';
import { IDLE_HINTS } from '../../data/assistant/contextHints';

export default function AssistantBot({ currentView }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [initialFaqId, setInitialFaqId] = useState(null);
  const isIdle = useIdleDetector(30000);

  const openChat = (faqId = null) => {
    setInitialFaqId(faqId);
    setChatOpen(true);
  };

  return (
    <>
      <FloatingButton onOpen={() => openChat(null)} chatOpen={chatOpen} onClose={() => setChatOpen(false)} initialFaqId={initialFaqId} />
      <ContextualPopup currentView={currentView} onCTAClick={(faqId) => openChat(faqId)} />
      {isIdle && !chatOpen && (
        <IdlePopup hints={IDLE_HINTS} onOpen={() => openChat(null)} />
      )}
    </>
  );
}
```

### 5.2 `FloatingButton.jsx` — Botón flotante + chat

**Comportamiento:**
- Botón circular fijo `bottom: 24px; right: 24px` con avatar de Lucía (emoji 🤖 o SVG simple)
- Al hacer clic abre `AssistantChat` como panel lateral o modal flotante
- Muestra badge con número de sugerencias no vistas (máximo 3)
- Animación suave de entrada con `transform + opacity`

**Especificaciones visuales:**
```
Botón:        56×56px, border-radius: 50%
Color fondo:  var(--color-background-info) o azul institucional Fe y Alegría
Ícono:        🤖 24px o SVG de personaje simple
Sombra:       box-shadow: 0 4px 16px rgba(0,0,0,0.15)  ← ÚNICA excepción de sombra permitida en UI flotante
Z-index:      9999
Chat panel:   360px ancho, altura auto max 520px, border-radius: 16px
              Posición: bottom: 90px; right: 24px
              Fondo: var(--color-background-primary)
              Borde: 1px solid var(--color-border-tertiary)
```

### 5.3 `AssistantChat.jsx` — Panel de FAQ

**Estructura del panel:**

```
┌─────────────────────────────┐
│  🤖 Lucía                 ✕ │  ← Header con nombre + close
│  Asistente de DocuIA        │
├─────────────────────────────┤
│  [ 🔍 Buscar una pregunta ] │  ← Input de búsqueda
├─────────────────────────────┤
│  Categorías:                │
│  [🚀 Inicio] [📄 Docs] ... │  ← Pills horizontales scrollables
├─────────────────────────────┤
│  ▼ ¿Qué es DocuIA?          │  ← Accordion por pregunta
│    Respuesta aquí...        │
│  ▼ ¿Cómo genero...?         │
│    ...                      │
└─────────────────────────────┘
```

**Comportamiento:**
- Si `initialFaqId` viene del padre, hacer scroll y abrir ese acordeón automáticamente
- Búsqueda en tiempo real usando `searchFAQ()` del FAQ, sin API
- Cambio de categoría filtra la lista de preguntas
- Cada respuesta tiene botón "¿Esto ayudó? 👍 / 👎" (solo UI, guardar en localStorage para análisis futuro)
- Mensaje de bienvenida al abrir por primera vez: *"Hola, soy Lucía 👋 Pregúntame cualquier cosa sobre DocuIA"*

### 5.4 `ContextualPopup.jsx` — Pop-up por vista

**Comportamiento:**
- Aparece en la esquina inferior izquierda (o centrado inferior) para no colisionar con el botón flotante
- Solo aparece si `CONTEXT_HINTS[currentView]` existe
- Si `showOnlyOnce: true`, verificar en localStorage `lucia_seen_{currentView}` — si existe, no mostrar
- Delay configurable por vista (ver `contextHints.js`)
- Botón X para cerrar + guardar en localStorage que ya se vio
- CTA al hacer clic abre el chat con el `faqId` correspondiente

**Especificaciones visuales:**
```
Ancho:        280px
Fondo:        var(--color-background-secondary)
Borde:        1px solid var(--color-border-tertiary)
Border-left:  3px solid var(--color-border-info)  ← acento azul
Border-radius: var(--border-radius-lg)
Posición:     bottom: 24px; left: 24px
Animación:    slideInUp 0.3s ease-out
Z-index:      9998
```

```
┌───────────────────────────┐
│ 🤖 Lucía              ✕  │
│ ─────────────────────── │
│ [Mensaje contextual aquí ]│
│                           │
│ [Ver cómo →]              │  ← CTA
└───────────────────────────┘
```

### 5.5 `IdlePopup.jsx` — Pop-up de inactividad

**Comportamiento:**
- Aparece solo si `isIdle === true` Y el chat NO está abierto
- Selecciona un mensaje de `IDLE_HINTS` al azar
- Se descarta automáticamente después de 8 segundos si el usuario no interactúa
- Al reanudar actividad (cualquier evento), desaparece con fade-out
- Máximo 2 veces por sesión (guardar contador en `sessionStorage`)
- CTA abre el chat completo

**Posición:** Centro inferior de la pantalla, más llamativo que el contextual

### 5.6 `TooltipHelper.jsx` — Wrapper de tooltip

```jsx
// Uso en cualquier componente:
// <TooltipHelper text="Genera el documento con IA basándose en tus datos">
//   <button>Generar</button>
// </TooltipHelper>

// Props:
// text: string — texto del tooltip
// position: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
// delay: número en ms antes de mostrar (default: 600)
```

**Especificaciones visuales:**
```
Fondo:        var(--color-text-primary) con opacity 0.9
Texto:        var(--color-background-primary), 12px
Border-radius: var(--border-radius-md)
Max-width:    200px
Padding:      6px 10px
Z-index:      10000
Animación:    fade-in 0.15s
```

---

## 6. Integración en `App.jsx`

```jsx
// En App.jsx — agregar después de los imports existentes:
import AssistantBot from './components/assistant/AssistantBot';

// Dentro del componente, justo antes del </div> de cierre raíz:
// Necesita saber la vista activa para los mensajes contextuales.
// Usar el mismo state/context que ya maneja la navegación.

<AssistantBot currentView={currentView} />
```

---

## 7. Integración de Tooltips en Vistas Existentes

Agregar `<TooltipHelper>` en los elementos clave de cada vista. Mínimo requerido:

| Elemento UI | Tooltip a mostrar |
|---|---|
| Botón "Generar" | "La IA creará tu documento con los datos del formulario" |
| Botón "Guardar plantilla" | "Guarda estos datos para reutilizarlos la próxima vez" |
| Selector de tipo de reporte | "Elige el tipo de documento oficial que necesitas crear" |
| Botón "Descargar Word" | "Descarga el documento en formato .docx compatible con Word" |
| Botón "Ver versiones" | "Recupera versiones anteriores de este documento" |
| Campo "Estudiantes reincidentes" | "Escribe un apellido y nombre por línea" |
| Campo "Contenido semanal" | "Describe brevemente cada semana, la IA organiza la tabla" |
| Toggle de trimestre | "Selecciona el trimestre al que corresponde este informe" |

---

## 8. Atributos `data-view` en Vistas

Para que `ContextualPopup` sepa en qué pantalla está el docente, agregar el atributo al componente raíz de cada vista:

```jsx
// DashboardView.jsx
<div data-view="dashboard" ...>

// NuevoReporteView.jsx
<div data-view="nuevo_reporte" ...>

// HistorialView.jsx
<div data-view="historial" ...>

// Formulario informe tutor:
<div data-view="informe_tutor" ...>

// Formulario contingencia:
<div data-view="contingencia" ...>

// Formulario microcurricular:
<div data-view="microcurricular" ...>

// PlantillasView.jsx
<div data-view="plantillas" ...>
```

O alternativamente pasar `currentView` desde el estado del router directamente a `AssistantBot`.

---

## 9. Estilos CSS — `src/components/assistant/assistant.css`

Crear archivo CSS dedicado (o usar CSS modules). Reglas clave:

```css
/* Animaciones */
@keyframes slideInUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

/* Botón flotante — pulsa suavemente cuando hay sugerencia nueva */
.lucia-float-btn.has-hint {
  animation: pulse 2s ease-in-out infinite;
}

/* Respetar preferencias de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Almacenamiento Local (sin API)

Usar `localStorage` solo para preferencias del asistente (no datos sensibles — los tokens ya se migrarán a cookies httpOnly según el plan de seguridad):

| Clave | Tipo | Propósito |
|---|---|---|
| `lucia_seen_dashboard` | boolean | Ya vio el pop-up contextual del dashboard |
| `lucia_seen_historial` | boolean | Ya vio el pop-up del historial |
| `lucia_seen_plantillas` | boolean | Ya vio el pop-up de plantillas |
| `lucia_thumbs_{faqId}` | `'up'/'down'` | Feedback de utilidad por pregunta |
| `lucia_chat_opened` | boolean | Primera apertura del chat (mensaje bienvenida) |

Usar `sessionStorage` para:

| Clave | Tipo | Propósito |
|---|---|---|
| `lucia_idle_count` | number | Veces que apareció el idle popup esta sesión (máx 2) |

---

## 11. Accesibilidad (a11y)

- Todo el bot debe ser operable con teclado (Tab, Enter, Escape cierra modales)
- El botón flotante debe tener `aria-label="Abrir asistente Lucía"`
- Los popups usan `role="dialog"` con `aria-labelledby`
- El acordeón de FAQ usa `aria-expanded` en cada pregunta
- Focus trap dentro del chat cuando está abierto
- Esc cierra cualquier elemento del asistente

---

## 12. Orden de Implementación para Claude Code

| Paso | Archivo | Prioridad |
|---|---|---|
| 1 | `src/data/assistant/faq.js` — base de conocimiento completa | Primero |
| 2 | `src/data/assistant/contextHints.js` — mensajes por vista | Primero |
| 3 | `src/hooks/useIdleDetector.js` | Primero |
| 4 | `TooltipHelper.jsx` — más simple, sin dependencias | Segundo |
| 5 | `AssistantChat.jsx` — núcleo del FAQ interactivo | Segundo |
| 6 | `FloatingButton.jsx` + integrar chat | Tercero |
| 7 | `ContextualPopup.jsx` | Tercero |
| 8 | `IdlePopup.jsx` | Tercero |
| 9 | `AssistantBot.jsx` — orquestador | Cuarto |
| 10 | Integrar `<AssistantBot>` en `App.jsx` | Cuarto |
| 11 | Agregar `<TooltipHelper>` en vistas existentes | Quinto |
| 12 | Agregar atributos `data-view` o pasar `currentView` | Quinto |
| 13 | CSS de animaciones | Quinto |
| 14 | Prueba con datos reales de los 10 docentes piloto | Último |

---

## 13. Criterios de Validación (QA)

- [ ] El botón flotante aparece en todas las pantallas sin tapar botones clave del formulario
- [ ] El chat abre y cierra con animación suave
- [ ] La búsqueda en el FAQ encuentra resultados al escribir al menos 2 caracteres
- [ ] El pop-up contextual del dashboard aparece solo la primera vez por sesión
- [ ] El pop-up de `nuevo_reporte` aparece cada vez que se entra al formulario
- [ ] El idle popup aparece tras 30 s de inactividad y desaparece al moverse el mouse
- [ ] Los tooltips aparecen al hacer hover después de 600 ms y no bloquean el click
- [ ] Todo el bot es cerrable con tecla Escape
- [ ] En móvil (< 768px), el chat ocupa 100% del ancho de pantalla
- [ ] No hay llamadas a API — todo es local y sin latencia

---

## 14. Notas para el Piloto con 10 Docentes

- Agregar feedback simple en cada respuesta del FAQ (👍/👎) para saber qué preguntas son más útiles
- Revisar los datos de `lucia_thumbs_*` en localStorage después de la primera semana
- Priorizar completar el FAQ de "Algo no funciona" antes del deploy — los docentes reportarán problemas técnicos primero
- Considerar agregar un campo `"¿No encontraste tu respuesta?"` con un input simple que guarde la pregunta sin respuesta en Supabase para iterar el FAQ en la siguiente versión

