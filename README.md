# DocuIA — Reportes inteligentes para docentes

Plataforma web que convierte datos del docente en informes institucionales completos usando IA generativa. Diseñada para docentes de Fe y Alegría Ecuador.

## Stack

| Capa | Tecnología |
| --- | --- |
| **Frontend** | React 18 + Vite 5 |
| **Estilos** | CSS puro con variables nativas (sin frameworks) |
| **Animaciones** | Anime.js v4 |
| **Backend local** | Express 4 (servidor de desarrollo) |
| **Backend producción** | Vercel Serverless Functions |
| **Base de datos** | Supabase (PostgreSQL + Auth) |
| **IA generativa** | Groq API — modelo `llama-3.3-70b-versatile` |
| **Auth** | Supabase Auth (JWT + refresh token) |
| **Tipografías** | Syne · Figtree · JetBrains Mono (Google Fonts) |
| **Validación** | prop-types (type checking en componentes React) |

---

## Funcionalidades

### Generación de reportes con IA

- **5 tipos de reporte institucionales Fe y Alegría:**

| ID | Label | Descripción |
| --- | --- | --- |
| `contingencia` | Plan de Contingencia | Plan pedagógico para estudiantes suspendidos, hospitalizados o en vulnerabilidad |
| `calificaciones` | Reporte de Calificaciones | Rendimiento cuantitativo + análisis cualitativo + estrategias de refuerzo |
| `asistencia` | Registro de Asistencia | Asistencia, tardanzas, patrones y prevención de deserción |
| `informe_tutor` | Informe Docente Tutor/a | Informe trimestral académico y comportamental con estructura oficial Fe y Alegría |
| `microcurricular` | Planificación Microcurricular | Planificación semanal de módulo formativo para Bachillerato Técnico |

> Los tipos `informe_tutor`, `contingencia` y `microcurricular` reemplazaron a `dece`, `semanal` y `planificacion` (tipos genéricos) al integrar los formatos oficiales entregados por los docentes de la institución. La migración en Supabase actualiza los registros existentes con los nuevos IDs.

- Formulario dinámico con campos condicionales según el tipo seleccionado
- Prompt del cliente sanitizado en el servidor (strip de patrones de inyección: `System:`, `Ignore`, `[INST]`, etc.) antes de enviarlo a Groq; el `system prompt` es 100% server-side
- Respuesta en **streaming SSE** (`Accept: text/event-stream`) con cursor animado, o JSON como fallback
- **Modelo primario:** `llama-3.3-70b-versatile` · **Fallback automático:** `llama-3.1-8b-instant` (activado si timeout >30 s o error 5xx de Groq) · Header `X-Model-Used` en la respuesta para debugging
- **Rate limit persistente:** 45 generaciones/usuario/hora verificadas contra la tabla `reportes` en Supabase (efectivo en serverless) · 120/IP/hora por capa in-memory · 48 000 caracteres de prompt

### Gestión de cursos

- CRUD completo de cursos: nombre, grado, paralelo, asignatura, número de estudiantes, jornada
- Botón ✎ en cada tarjeta abre el modal pre-relleno con los datos del curso para editar
- Modal dual: "Crear nuevo curso" / "Editar curso" según el modo activo; botón cambia a "Guardar cambios"
- Seleccionar un curso auto-rellena los campos del formulario
- Borrado lógico (`activo = false`)

### Plantillas de reporte

- Guardar el estado del formulario como plantilla reutilizable con nombre
- Cargar plantilla → rellena automáticamente todos los campos
- Agrupadas por tipo de reporte · borrado lógico

### Historial de reportes

- Lista paginada de reportes generados (20 por página, botón "Cargar más")
- Abrir cualquier reporte anterior para visualizarlo o editarlo
- Archivar reportes (borrado lógico)
- Metadatos visibles: tipo, curso, periodo, institución, fecha, fue_copiado

### Formatos institucionales

- Subir plantilla PDF o Excel de la institución
- Extracción automática de texto y detección de campos
- Compartir el formato con compañeros de la misma institución
- Cuando hay formato activo, el `system prompt` instruye a la IA a respetar su estructura
- Tamaño máximo: 10 MB

### Borrador automático

- Guardado en `localStorage` (`docuia_draft`) con debounce de 800 ms
- Restauración al recargar (excluye nombre y email que vienen del perfil)
- Banner con opción de descartar · se limpia al generar reporte exitosamente

### Vista de reporte generado

- Visualización completa del reporte
- Edición inline con soporte Markdown
- **Toolbar de formato:** Negrita (`**`), cursiva (`*`), título de sección (`##`), línea separadora
- **Detección de inconsistencias:** alerta automática si el reporte contiene datos que no coinciden con el formulario (ej. grado distinto)
- **Regeneración parcial:** selecciona una sección → modal con instrucción opcional → la IA regenera solo esa sección sin tocar el resto
- **Feedback del reporte:** 👍 / 👎 al finalizar; el 👎 abre un campo de nota libre. Guardado como `feedback` (1/-1) y `feedback_nota` en historial
- Exportar: Word (`.doc`), PDF (diálogo de impresión), CSV (`.csv`)
- Copiar al portapapeles
- Guardar ediciones en el historial (`PATCH /api/reportes`)
- Compartir enlace de referido (copia URL al portapapeles y registra el referral)

### Dashboard de métricas

- Reportes generados (total y último mes)
- Cursos registrados · Reportes copiados
- Tipo de reporte más usado
- Barras de desglose por tipo (porcentaje relativo al máximo)
- Totales obtenidos de `GET /api/metricas` (agregaciones server-side sobre todos los reportes, no solo los 20 paginados)
- Fallback: si la llamada falla, calcula localmente sobre los reportes ya cargados en memoria

### Asistente virtual Lucía

- Botón flotante fijo (esquina inferior derecha) visible en todas las vistas
- **Tab FAQ:** 28 preguntas organizadas en 7 categorías, búsqueda en tiempo real sin API, acordeón con feedback 👍/👎 por pregunta (guardado en `localStorage`)
- **Tab Chat IA:** chat libre conectado a Groq con system prompt contextual de DocuIA; muestra sugerencias iniciales; manejo de errores con mensaje amigable
- Pop-up contextual (esquina inferior izquierda) que aparece al cambiar de vista con un consejo relevante; `showOnlyOnce` configurable por vista usando `localStorage`
- Pop-up de inactividad tras 30 s sin interacción; máximo 2 veces por sesión (`sessionStorage`); auto-dismiss a los 8 s
- Tooltips con delay de 600 ms en elementos clave del formulario (botón Generar, Guardar plantilla, botones de descarga)
- Accesible: `aria-label`, `role="dialog"`, `aria-expanded` en acordeón, Escape para cerrar cualquier elemento
- `api/chat.mjs`: endpoint Groq dedicado para Lucía — sin logging en Supabase, sin SSE (respuestas cortas ≤ 300 tokens), rate-limit 120 msg/IP/hora, fallback de modelo automático

### Onboarding para nuevos usuarios

- Modal de 3 pasos que se muestra la primera vez que el usuario accede a la app
- Pasos: "Agrega tu curso" → "Elige el tipo de reporte" → "Genera con IA"
- Se persiste en `localStorage` (`docuia_onboarding_done`) para no repetirse
- Dots de progreso animados · botones Anterior / Siguiente / Comenzar · accesible (`role="dialog"`, `aria-modal`)

### Sistema de notificaciones Toast

- Tipos: `success`, `error`, `warning`, `info`
- Diálogos `confirm` (reemplaza `window.confirm`) con botones personalizables
- Diálogos `prompt` (reemplaza `window.prompt`) con campo de texto
- Auto-dismiss con botón de cierre · accesible (ARIA live region)

### Autenticación completa

- Login, registro y recuperación de contraseña
- Registro incluye: nombre, email, contraseña, rol, institución y cargo
- **Refresh token automático:** `authFetch()` reintenta en 401 antes de redirigir al login
- Sesión persistida en `localStorage` (`docuia_token`, `docuia_refresh`, `docuia_user`)
- **Enriquecimiento de perfil en login:** al iniciar sesión, el servidor fusiona los datos de la tabla `profiles` (name, role, institucion, cargo) en `user_metadata`, cubriendo usuarios registrados antes de que se añadiera el campo institución

### Diseño y accesibilidad

- **Design token system** en `src/global.css`: paleta Superman (Tory Blue `#0e4da4`, Brick Red `#c92c3c`, Buttercup `#f5a524`, Concrete `#f2f2f2`, Mine Shaft `#3b3b3b`), escala de espaciado, radios, easings y duraciones como variables CSS
- **Prefijos vendor CSS:** `-webkit-user-select` y `-webkit-mask-image` añadidos para compatibilidad con Safari/Chrome
- **Tipografías:** Syne (display), Figtree (body), JetBrains Mono (mono) — cargadas vía Google Fonts
- **Dark mode** automático vía `@media (prefers-color-scheme: dark)` · variables de light mode en `@media (prefers-color-scheme: light)`
- Respeta `prefers-reduced-motion`
- Diseño responsive (mobile-first)
- Atributos ARIA en componentes críticos · heurísticas Nielsen H1–H9
- Animaciones con Anime.js (fade-up, stagger, count-up, word-by-word, scroll-reveal, magnetic hover)

### Seguridad

- Content Security Policy (CSP) en `vercel.json` + `lib/server/securityHeaders.js`
- `X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff`
- JWT verificado en cada endpoint del servidor
- RLS en Supabase (service role solo en backend, anon key solo en frontend)
- Rate limiting en memoria por IP y por usuario
- El `system prompt` lo define únicamente el servidor

### Observabilidad

- Logger JSON estructurado (`lib/server/logger.js`) en todas las funciones serverless
- Telemetría de visitas, reportes copiados y referrals (`POST /api/telemetry`)

---

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...          # anon key (frontend)
SUPABASE_SERVICE_KEY=eyJhbGci...       # service_role key (backend)
GROQ_API_KEY=gsk_...
```

> La `SUPABASE_SERVICE_KEY` (service_role) es necesaria en el servidor para crear usuarios y acceder a tablas protegidas sin RLS.

### 3. Configurar Supabase

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Tabla de visitas anónimas
CREATE TABLE visitas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  referrer    TEXT
);

-- Tabla de reportes generados
CREATE TABLE reportes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now(),
  user_id          UUID REFERENCES auth.users(id),
  email_docente    TEXT,
  nombre_docente   TEXT NOT NULL,
  institucion      TEXT,
  curso            TEXT NOT NULL,
  periodo          TEXT NOT NULL,
  tipo_reporte     TEXT NOT NULL,
  datos_ingresados JSONB,
  reporte_generado TEXT,
  fue_copiado      BOOLEAN DEFAULT false,
  archivado        BOOLEAN DEFAULT false,
  feedback         SMALLINT,          -- 1 = positivo, -1 = negativo, NULL = sin feedback
  feedback_nota    TEXT               -- nota libre cuando feedback = -1
);

-- Tabla de reportes copiados (analítica)
CREATE TABLE reportes_copiados (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  email_docente TEXT,
  tipo          TEXT
);

-- Tabla de referidos (analítica)
CREATE TABLE referrals (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email_from TEXT
);

-- Tabla de perfiles de usuario (se llena al registrarse)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT,
  name        TEXT,
  role        TEXT DEFAULT 'Docente',
  institucion TEXT,
  cargo       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tabla de cursos guardados por docente
CREATE TABLE cursos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  user_id         UUID REFERENCES auth.users(id),
  nombre          TEXT NOT NULL,
  grado           TEXT NOT NULL,
  paralelo        TEXT,
  asignatura      TEXT NOT NULL,
  num_estudiantes INT,
  jornada         TEXT,
  año_lectivo     TEXT,
  periodo_actual  TEXT,
  nombres_estudiantes TEXT[],
  observaciones   TEXT,
  activo          BOOLEAN DEFAULT true
);

-- Tabla de formatos institucionales subidos
CREATE TABLE formatos_institucionales (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT now(),
  user_id               UUID REFERENCES auth.users(id),
  nombre_archivo        TEXT,
  tipo_reporte          TEXT,
  contenido_extraido    TEXT,
  num_campos_detectados INT DEFAULT 0,
  compartido            BOOLEAN DEFAULT false,
  institucion           TEXT,
  es_ejemplo            BOOLEAN DEFAULT false,
  activo                BOOLEAN DEFAULT true
);

-- Tabla de plantillas de reporte
CREATE TABLE plantillas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID REFERENCES auth.users(id),
  nombre      TEXT NOT NULL,
  tipo_reporte TEXT,
  datos       JSONB,
  activo      BOOLEAN DEFAULT true
);

-- Políticas de acceso (RLS)
ALTER TABLE visitas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_copiados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE formatos_institucionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert"  ON visitas           FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON reportes          FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON reportes_copiados FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON referrals         FOR INSERT WITH CHECK (true);

CREATE POLICY "user_manage"  ON profiles          FOR ALL USING (auth.uid() = id);
CREATE POLICY "user_manage"  ON cursos            FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_manage"  ON formatos_institucionales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_manage"  ON plantillas        FOR ALL USING (auth.uid() = user_id);
```

Luego ejecuta `supabase-rls-hardening.sql` para cerrar inserciones anónimas en tablas que solo debe escribir el backend.

### 4. Correr en desarrollo (dos terminales)

```bash
# Terminal 1 — servidor Express para las rutas /api (puerto 3000)
npm run api

# Terminal 2 — Vite dev server con proxy hacia el Express (puerto 5173)
npm run dev
```

Vite proxea automáticamente cualquier request a `/api/*` al servidor Express en `localhost:3000`.

### 5. Deploy en Vercel

```bash
npx vercel --prod
```

O conectar el repo en [vercel.com](https://vercel.com) y agregar las variables de entorno en Settings → Environment Variables.

> **Vercel Hobby (límite 12 Serverless Functions):** el proyecto expone **9** funciones en `/api`. Los helpers compartidos están en `lib/server/` y no cuentan como función.

---

## Scripts npm

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite (frontend + proxy /api) |
| `npm run api` | Inicia Express local para las rutas de API |
| `npm run build` | Compila el frontend para producción |
| `npm run preview` | Previsualiza el build de producción |

---

## Estructura del proyecto

```text
docuia/
├── index.html                  ← entrada HTML, carga fuentes Google y monta React
├── vite.config.js              ← Vite config con proxy /api → localhost:3000
├── server.js                   ← servidor Express local (desarrollo)
├── package.json
├── vercel.json                 ← CSP, cabeceras de seguridad, rutas
├── supabase-rls-hardening.sql  ← cierra inserciones anónimas en tablas protegidas
├── .env                        ← claves privadas (no se sube al repo)
│
├── public/
│   ├── login.html              ← SPA de autenticación (login / signup / recuperar)
│   ├── login-main.js           ← lógica de auth: guarda access_token + refresh_token
│   └── login.css
│
├── api/                        ← 9 handlers serverless (Vercel en prod, Express en dev)
│   ├── auth.js                 ← POST { action: 'login'|'signup'|'recover'|'refresh' }
│   ├── generate.mjs            ← POST → Groq (streaming SSE o JSON)
│   ├── chat.mjs                ← POST → Groq para asistente Lucía (JSON, ≤300 tokens, sin Supabase)
│   ├── cursos.js               ← GET / POST / PATCH / DELETE (borrado lógico)
│   ├── upload-formato.js       ← POST base64 PDF/Excel → extrae texto
│   ├── formatos.js             ← GET { mios, compartidos } / PATCH / DELETE
│   ├── plantillas.js           ← GET / POST / DELETE
│   ├── reportes.js             ← GET (paginado) / POST / PATCH / DELETE
│   ├── telemetry.js            ← POST { kind: 'visita'|'reporte_copiado'|'referral' }
│   └── metricas.js             ← GET agregaciones server-side (evita cálculo sobre 20 reportes paginados)
│
├── lib/server/
│   ├── verifyUser.js           ← verifyBearerUser(), serviceRestHeaders()
│   ├── rateLimit.js            ← allowRateLimit() por IP y por usuario
│   ├── logger.js               ← logger JSON estructurado (info/warn/error)
│   └── securityHeaders.js      ← CSP, X-Frame-Options, etc.
│
└── src/
    ├── main.jsx                ← monta App dentro de ToastProvider + ErrorBoundary
    ├── App.jsx                 ← orquestador: vistas, estado, CRUD, draft, streaming
    ├── App.css                 ← animaciones globales y estilos de layout de la SPA
    ├── global.css              ← design tokens: paleta, tipografía, espaciado, easings (importado en main.jsx)
    ├── config.js               ← REPORT_TYPES, FORM_FIELDS, buildPrompt(), SYSTEM_PROMPT
    ├── utils/
    │   ├── auth.js             ← getUser/getToken, setSession, logout, authFetch (auto-refresh 401)
    │   ├── telemetry.js        ← recordVisita()
    │   ├── download.js         ← downloadWord / downloadPDF / downloadExcel / printReport
    │   ├── formatoText.js      ← cleanFormatoText, getFormatoPreview, truncateForLLM
    │   └── anim.js             ← hooks Anime.js: useEnter, useStaggerChildren, useCountUp,
    │                              useSplitWordsEnter, useScrollReveal, magneticHover, pop
    ├── hooks/
    │   └── useIdleDetector.js  ← detecta N ms sin interacción del usuario
    ├── data/assistant/
    │   ├── faq.js              ← 28 preguntas en 7 categorías + searchFAQ()
    │   └── contextHints.js     ← mensajes proactivos por vista + idle hints
    └── components/
        ├── assistant/
        │   ├── AssistantBot.jsx    ← orquestador: FloatingButton + ContextualPopup + IdlePopup
        │   ├── FloatingButton.jsx  ← botón circular fijo + monta AssistantChat
        │   ├── AssistantChat.jsx   ← panel con tabs FAQ / Chat IA (Groq)
        │   ├── ContextualPopup.jsx ← pop-up por vista con delay y showOnlyOnce
        │   ├── IdlePopup.jsx       ← pop-up tras inactividad, auto-dismiss 8 s, máx 2/sesión
        │   ├── TooltipHelper.jsx   ← wrapper de tooltip con delay configurable
        │   └── assistant.css       ← estilos de todos los componentes del asistente
        ├── Navbar.jsx          ← barra superior: Mis cursos (N), Plantillas, Historial, Métricas, Salir
        ├── Navbar.css
        ├── LandingPage.jsx     ← HeroSection, StatsSection, HowItWorksSection,
        │                          FormSection (cursos, formato, borrador), CtaSection, Footer
        ├── LandingPage.css
        ├── Field.jsx           ← input/textarea reutilizable con label, hint y grupos de tags
        ├── Field.css
        ├── CursosView.jsx      ← grid de cursos + modal crear/editar (CRUD completo)
        ├── CursosView.css      ← estilos compartidos: Cursos, Plantillas, Historial, Dashboard
        ├── PlantillasView.jsx  ← plantillas guardadas (cargar / eliminar)
        ├── HistorialView.jsx   ← lista paginada de reportes (carga más, ARIA)
        ├── DashboardView.jsx   ← métricas: tarjetas + barras por tipo
        ├── LoadingView.jsx     ← spinner + mensajes rotativos durante generación
        ├── LoadingView.css
        ├── ReportView.jsx      ← reporte final: toolbar formato, detección inconsistencias,
        │                          regeneración parcial, feedback 👍/👎, descarga, copiar, guardar
        ├── ReportView.css
        ├── OnboardingModal.jsx ← tutorial 3 pasos para primeros usuarios (se muestra una vez)
        ├── OnboardingModal.css
        ├── Toast.jsx           ← sistema de notificaciones: success/error/warn/info + confirm/prompt
        ├── ErrorBoundary.jsx   ← captura crashes de React y muestra fallback
        └── ErrorBoundary.css
```

---

## Flujo de autenticación

```text
/login.html
  └─ Al cargar: verifica JWT en localStorage
       ├─ Token válido → redirige a /
       ├─ Token expirado → limpia localStorage, muestra formulario
       └─ Sin token → muestra formulario

  └─ Login:   POST /api/auth { action: 'login', email, password }
                → guarda access_token + refresh_token + user → redirige a /

  └─ Signup:  POST /api/auth { action: 'signup', email, password, name, role, institucion, cargo }
                → crea usuario Auth + fila en profiles
                → con sesión: redirige a /  · sin sesión: pantalla de confirmación email

  └─ Recover: POST /api/auth { action: 'recover', email }
                → envía email de reseteo (responde 200 siempre por seguridad)

  └─ Refresh: POST /api/auth { action: 'refresh', refresh_token }
                → renueva access_token sin necesidad de re-login
                → authFetch() lo hace automáticamente en cualquier 401
```

---

## Flujo de generación de reportes

```text
Formulario → buildPrompt(type, form)
  └─ Si hay formato institucional activo: inyecta contenido extraído al prompt
  └─ POST /api/generate (Accept: text/event-stream para SSE, o JSON)
       ├─ Streaming SSE: ReportView recibe chunks en tiempo real, cursor animado
       └─ JSON: respuesta completa en una sola llamada
  └─ Éxito: muestra ReportView + POST /api/reportes (guarda en historial)
  └─ localStorage.removeItem('docuia_draft')
```

---

## API — Referencia rápida

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth` | `action: login\|signup\|recover\|refresh` |
| `POST` | `/api/generate` | Generación IA (streaming SSE o JSON) |
| `POST` | `/api/chat` | Chat con asistente Lucía (JSON, ≤300 tokens) |
| `GET` | `/api/cursos` | Lista cursos del usuario |
| `POST` | `/api/cursos` | Crear curso |
| `PATCH` | `/api/cursos?id=` | Actualizar datos del curso |
| `DELETE` | `/api/cursos?id=` | Borrado lógico |
| `POST` | `/api/upload-formato` | Subir PDF/Excel institucional |
| `GET` | `/api/formatos` | `{ mios, compartidos, institucion }` |
| `PATCH` | `/api/formatos?id=` | Alternar flag `compartido` |
| `DELETE` | `/api/formatos?id=` | Borrado lógico |
| `GET` | `/api/plantillas` | Lista plantillas del usuario |
| `POST` | `/api/plantillas` | Guardar plantilla |
| `DELETE` | `/api/plantillas?id=` | Borrado lógico |
| `GET` | `/api/reportes` | Lista paginada (`limit`, `offset`) |
| `GET` | `/api/reportes?id=` | Obtener reporte completo |
| `POST` | `/api/reportes` | Guardar reporte en historial |
| `PATCH` | `/api/reportes?id=` | Actualizar `reporte_generado`, `feedback` y/o `feedback_nota` |
| `DELETE` | `/api/reportes?id=` | Archivar reporte |
| `POST` | `/api/telemetry` | `kind: visita\|reporte_copiado\|referral` |
| `GET` | `/api/metricas` | Totales server-side: reportes, copiados, por tipo, cursos activos |

---

## Dashboard de métricas del docente

Accesible desde **Navbar → Métricas**. Estadísticas calculadas en el cliente a partir de los datos del usuario autenticado:

| Métrica | Fuente |
| --- | --- |
| Reportes generados (total y último mes) | `GET /api/reportes` |
| Cursos registrados | `GET /api/cursos` |
| Reportes copiados | campo `fue_copiado` en `reportes` |
| Tipo de reporte más usado | agrupación por `tipo_reporte` |
| Barras de desglose por tipo | porcentaje relativo al máximo |

---

## Métricas AARRR — Supabase SQL Editor

```sql
-- Adquisición
SELECT COUNT(*) AS visitas FROM visitas;
SELECT referrer, COUNT(*) FROM visitas GROUP BY referrer ORDER BY 2 DESC;

-- Activación
SELECT COUNT(*) AS reportes_generados FROM reportes;
SELECT tipo_reporte, COUNT(*) FROM reportes GROUP BY tipo_reporte ORDER BY 2 DESC;

-- Retención
SELECT email_docente, COUNT(*) AS reportes FROM reportes
  GROUP BY email_docente HAVING COUNT(*) > 1 ORDER BY 2 DESC;

-- Referidos
SELECT COUNT(*) AS compartidos FROM referrals;

-- Cursos guardados (engagement)
SELECT COUNT(*) AS cursos_creados FROM cursos;
SELECT COUNT(DISTINCT user_id) AS docentes_con_cursos FROM cursos;
```

---

## Pendientes / Roadmap

- Migrar tokens de `localStorage` a cookies `httpOnly` (requiere cambios en Supabase Auth config)
- Tabla `instituciones` para multi-tenancy
- Tests con Vitest + Playwright

---

## Equipo

Piñero · Heredia · Zumárraga · Iza
PUCE — Emprendimiento Tecnológico 2026

## Redes sociales

[![Instagram](https://img.shields.io/badge/Instagram-%40docu__ia-E4405F?logo=instagram&logoColor=white)](https://www.instagram.com/docu_ia?igsh=OXZ2dWw2aDJxYzFj&utm_source=qr)
