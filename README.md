# DocuIA — Reportes inteligentes para docentes

Plataforma web que convierte datos del docente en informes institucionales completos usando IA generativa. Diseñada para docentes de Fe y Alegría Ecuador.

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite 5 |
| **Estilos** | CSS puro con variables nativas (sin frameworks) |
| **Backend local** | Express 4 (servidor de desarrollo) |
| **Backend producción** | Vercel Serverless Functions |
| **Base de datos** | Supabase (PostgreSQL + Auth) |
| **IA generativa** | Groq API — modelo `llama-3.3-70b-versatile` |
| **Auth** | Supabase Auth (JWT) |

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

> La `SUPABASE_SERVICE_KEY` (service_role) es necesaria en el servidor para crear usuarios y acceder a la tabla `profiles` sin RLS.

**Comportamiento de seguridad (resumen):** la generación con IA (`POST /api/generate`) exige JWT válido; el mensaje `system` lo define solo el servidor (no se acepta desde el cliente). Visitas y analítica ligera van a **`POST /api/telemetry`** con `kind: 'visita' | 'reporte_copiado' | 'referral'` (en lugar de escribir con la anon key desde el navegador). El historial se guarda con `POST /api/reportes` usando el `user_id` del token.

**Vercel Hobby (límite 12 Serverless Functions):** el proyecto expone **8** funciones en `/api` (`auth`, `generate`, `cursos`, `upload-formato`, `formatos`, `plantillas`, `reportes`, `telemetry`). Los helpers compartidos están en `lib/server/` (no cuentan como función). Auth unificado: **`POST /api/auth`** con `action: 'login'|'signup'|'recover'`.

### 3. Configurar Supabase

> Si ya tenías la base anterior, ejecuta el archivo `migrations.sql` (en la raíz del repo) en el SQL Editor de Supabase. Trae los cambios para **formatos compartidos por institución**, **plantillas** e **historial por usuario**.

Si parten de cero, ejecuta también el siguiente bootstrap en el SQL Editor:

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
  email_docente    TEXT,
  nombre_docente   TEXT NOT NULL,
  institucion      TEXT,
  curso            TEXT NOT NULL,
  periodo          TEXT NOT NULL,
  tipo_reporte     TEXT NOT NULL,
  datos_ingresados JSONB,
  reporte_generado TEXT,
  fue_copiado      BOOLEAN DEFAULT false
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
  jornada         TEXT
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
  es_ejemplo            BOOLEAN DEFAULT false
);

-- Políticas de acceso
ALTER TABLE visitas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_copiados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE formatos_institucionales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert"  ON visitas           FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON reportes          FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON reportes_copiados FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert"  ON referrals         FOR INSERT WITH CHECK (true);

CREATE POLICY "user_manage"  ON profiles          FOR ALL  USING (auth.uid() = id);
CREATE POLICY "user_manage"  ON cursos            FOR ALL  USING (auth.uid() = user_id);
CREATE POLICY "user_manage"  ON formatos_institucionales FOR ALL USING (auth.uid() = user_id);
```

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

---

## Scripts npm

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Vite (frontend + proxy /api) |
| `npm run api` | Inicia Express local para las rutas de API |
| `npm run build` | Compila el frontend para producción |
| `npm run preview` | Previsualiza el build de producción |

---

## Estructura del proyecto

```
docuia/
├── index.html                  ← entrada HTML, carga fuentes Google y monta React
├── vite.config.js              ← Vite config con proxy /api → localhost:3000
├── server.js                   ← servidor Express local (desarrollo) — envuelve los
│                                  handlers serverless para ejecutarlos en Node
├── package.json                ← dependencias y scripts npm
├── .env                        ← claves privadas (no se sube al repo)
│
├── public/
│   ├── login.html              ← autenticación SPA (login / signup / recuperar)
│   │                              · Registro incluye institución y cargo
│   │                              · Validación de token JWT antes de redirigir
│   │                                (evita redirecciones por tokens expirados)
│   └── login.css               ← estilos del login (separados del HTML)
│
├── api/                        ← handlers serverless (Vercel en prod, Express en dev)
│   ├── generate.mjs            ← recibe prompt + system, llama a Groq API (llama-3.3-70b)
│   │                              y devuelve el reporte generado
│   ├── cursos.js               ← CRUD de cursos del docente (lista/crea/borrado lógico)
│   ├── upload-formato.js       ← recibe PDF o Excel en base64, extrae contenido,
│   │                              guarda en formatos_institucionales con la
│   │                              institución del docente y el flag `compartido`
│   ├── formatos.js             ← lista de formatos disponibles
│   │                              GET: { mios, compartidos } (compartidos = mismos
│   │                                    de mi institución)
│   │                              PATCH ?id=: alternar `compartido`
│   │                              DELETE ?id=: borrado lógico
│   ├── plantillas.js           ← plantillas privadas de reporte
│   │                              GET / POST { nombre, tipo_reporte, datos } / DELETE
│   ├── reportes.js             ← historial de reportes (por usuario autenticado)
│   │                              GET: lista
│   │                              GET ?id=: obtener reporte completo
│   │                              PATCH ?id=: actualizar `reporte_generado`
│   │                              DELETE ?id=: archivar
│   └── auth/
│       ├── login.js            ← verifica credenciales con Supabase Auth,
│       │                          devuelve access_token + refresh_token + user
│       ├── signup.js           ← registra usuario en Supabase Auth y crea fila
│       │                          en profiles (name, role, institucion, cargo)
│       └── recover.js          ← envía email de recuperación vía Supabase
│
└── src/
    ├── main.jsx                ← monta App en el DOM
    ├── App.jsx                 ← orquestador central de vistas y estado:
    │                              · Vistas: landing, form, cursos, plantillas,
    │                                historial, loading, report
    │                              · Estado: formulario, tipo de reporte, cursos,
    │                                plantillas, historial, formato institucional
    │                              · CRUD de cursos (loadCursos, createCurso,
    │                                deleteCurso, selectCurso)
    │                              · Upload de formato institucional (PDF/Excel)
    │                              · Inyección del formato al prompt de generación
    │                              · Validación de campos requeridos por tipo
    ├── App.css                 ← sistema de diseño:
    │                              · Variables CSS (--ink, --paper, --accent, etc.)
    │                              · Animaciones (fadeUp, spin, pulse)
    │                              · Clases utilitarias (.btn, .btn-primary, .btn-ghost,
    │                                .card, .dl-btn, .app-root)
    │                              · Breakpoints responsivos
    ├── config.js               ← toda la lógica de dominio educativo:
    │                              · SYSTEM_PROMPT (instrucciones institucionales para la IA)
    │                              · REPORT_TYPES (5 tipos: semanal, calificaciones,
    │                                asistencia, dece, planificacion)
    │                              · FORM_FIELDS (campos por tipo con placeholders,
    │                                hints y grupos)
    │                              · getRequiredFields(type): campos obligatorios por tipo
    │                              · buildPrompt(type, data): construye el prompt final
    │                                con estructura obligatoria por tipo de reporte
    ├── utils/
    │   ├── telemetry.js        ← recordVisita() vía POST /api/telemetry
    │   ├── auth.js             ← getUser(): lee usuario del localStorage
    │   │                          logout(): limpia sesión → /login.html
    │   └── download.js         ← downloadWord, downloadPDF, downloadExcel, printReport
    └── components/
        ├── Navbar.jsx          ← barra superior; muestra "Mis cursos (N)" si hay cursos
        ├── Field.jsx           ← campo reutilizable (input / textarea) con label y hint
        ├── CursosView.jsx      ← vista completa de gestión de cursos:
        │                          · Grid de tarjetas de cursos guardados
        │                          · Modal para crear nuevo curso
        │                          · Eliminar curso
        ├── PlantillasView.jsx  ← vista de plantillas guardadas (cargar/eliminar)
        ├── HistorialView.jsx   ← vista del historial de reportes generados
        ├── CursosView.css      ← estilos compartidos por Cursos/Plantillas/Historial
        ├── LandingPage.jsx     ← página principal:
        │                          · HeroSection, StatsSection, HowItWorksSection
        │                          · FormSection con selector de curso guardado,
        │                            upload de formato institucional y formulario
        │                          · QuoteSection, CtaSection, Footer
        ├── LoadingView.jsx     ← spinner + mensajes animados durante generación
        └── ReportView.jsx      ← reporte generado con descarga Word/PDF/Excel/Imprimir,
                                   copia al portapapeles y botón de compartir
```

---

## Flujo de autenticación

```
/login.html
  └─ Al cargar: verifica JWT en localStorage
       ├─ Token válido (no expirado) → redirige a /
       ├─ Token expirado → limpia localStorage, muestra formulario
       └─ Sin token → muestra formulario

  └─ Login: POST /api/auth  body: { action: 'login', email, password } → Supabase Auth
       └─ Éxito: guarda token + user en localStorage → redirige a /

  └─ Signup: POST /api/auth  body: { action: 'signup', ... } → crea usuario Auth + fila en profiles
       └─ Éxito con sesión: redirige a /
       └─ Éxito sin sesión (email no confirmado): muestra mensaje → pantalla login
```

---

## Flujo de generación de reportes

```
Formulario → buildPrompt(type, form)
  └─ Si hay formato institucional subido: inyecta contenido extraído al prompt
  └─ POST /api/generate → Groq API (llama-3.3-70b-versatile)
  └─ Éxito: muestra ReportView → descarga Word / PDF / Excel / Imprimir
  └─ POST /api/reportes guarda en historial (user_id del token)
```

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

## Equipo
Piñero · Heredia · Zumárraga · Iza
PUCE — Emprendimiento Tecnológico 2026
