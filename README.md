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

---

## Funcionalidades

### Generación de reportes con IA

- **5 tipos de reporte:** Semanal, Calificaciones, Asistencia, DECE, Planificación
- Formulario dinámico con campos condicionales según el tipo seleccionado
- Prompt construido en el servidor (el cliente nunca controla el `system`)
- Respuesta en **streaming SSE** (`Accept: text/event-stream`) con cursor animado, o JSON como fallback
- Límites: 45 generaciones/usuario/hora · 120/IP/hora · 48 000 caracteres de prompt

### Gestión de cursos

- CRUD completo de cursos: nombre, grado, paralelo, asignatura, número de estudiantes, jornada
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
- Exportar: Word (`.doc`), PDF (diálogo de impresión), CSV (`.csv`)
- Copiar al portapapeles
- Guardar ediciones en el historial (`PATCH /api/reportes`)

### Dashboard de métricas

- Reportes generados (total y último mes)
- Cursos registrados · Reportes copiados
- Tipo de reporte más usado
- Barras de desglose por tipo (porcentaje relativo al máximo)
- Todo calculado en el cliente a partir de los datos del usuario autenticado

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

### Diseño y accesibilidad

- **Dark mode** automático vía `@media (prefers-color-scheme: dark)`
- Respeta `prefers-reduced-motion`
- Diseño responsive (mobile-first)
- Atributos ARIA en componentes críticos
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
  archivado        BOOLEAN DEFAULT false
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

> **Vercel Hobby (límite 12 Serverless Functions):** el proyecto expone **8** funciones en `/api`. Los helpers compartidos están en `lib/server/` y no cuentan como función.

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
├── api/                        ← 8 handlers serverless (Vercel en prod, Express en dev)
│   ├── auth.js                 ← POST { action: 'login'|'signup'|'recover'|'refresh' }
│   ├── generate.mjs            ← POST → Groq (streaming SSE o JSON)
│   ├── cursos.js               ← GET / POST / DELETE (borrado lógico)
│   ├── upload-formato.js       ← POST base64 PDF/Excel → extrae texto
│   ├── formatos.js             ← GET { mios, compartidos } / PATCH / DELETE
│   ├── plantillas.js           ← GET / POST / DELETE
│   ├── reportes.js             ← GET (paginado) / POST / PATCH / DELETE
│   └── telemetry.js            ← POST { kind: 'visita'|'reporte_copiado'|'referral' }
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
    ├── App.css                 ← design system: variables CSS, dark mode, animaciones
    ├── config.js               ← REPORT_TYPES, FORM_FIELDS, buildPrompt(), SYSTEM_PROMPT
    ├── utils/
    │   ├── auth.js             ← getUser/getToken, setSession, logout, authFetch (auto-refresh 401)
    │   ├── telemetry.js        ← recordVisita()
    │   ├── download.js         ← downloadWord / downloadPDF / downloadExcel / printReport
    │   ├── formatoText.js      ← cleanFormatoText, getFormatoPreview, truncateForLLM
    │   └── anim.js             ← hooks Anime.js: useEnter, useStaggerChildren, useCountUp,
    │                              useSplitWordsEnter, useScrollReveal, magneticHover, pop
    └── components/
        ├── Navbar.jsx          ← barra superior: Mis cursos (N), Plantillas, Historial, Métricas, Salir
        ├── LandingPage.jsx     ← HeroSection, StatsSection, HowItWorksSection,
        │                          FormSection (cursos, formato, borrador), CtaSection, Footer
        ├── Field.jsx           ← input/textarea reutilizable con label, hint y grupos de tags
        ├── CursosView.jsx      ← grid de cursos + modal de creación
        ├── CursosView.css      ← estilos compartidos: Cursos, Plantillas, Historial, Dashboard
        ├── PlantillasView.jsx  ← plantillas guardadas (cargar / eliminar)
        ├── HistorialView.jsx   ← lista paginada de reportes (carga más, ARIA)
        ├── DashboardView.jsx   ← métricas: tarjetas + barras por tipo
        ├── LoadingView.jsx     ← spinner + mensajes rotativos durante generación
        ├── ReportView.jsx      ← reporte final: edición inline, descarga, copiar, guardar
        ├── Toast.jsx           ← sistema de notificaciones: success/error/warn/info + confirm/prompt
        └── ErrorBoundary.jsx   ← captura crashes de React y muestra fallback
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
| `GET` | `/api/cursos` | Lista cursos del usuario |
| `POST` | `/api/cursos` | Crear curso |
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
| `PATCH` | `/api/reportes?id=` | Actualizar `reporte_generado` |
| `DELETE` | `/api/reportes?id=` | Archivar reporte |
| `POST` | `/api/telemetry` | `kind: visita\|reporte_copiado\|referral` |

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
