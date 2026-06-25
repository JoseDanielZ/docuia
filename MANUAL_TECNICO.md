# DocuIA — Manual Técnico

---

| Campo              | Valor                                      |
|--------------------|---------------------------------------------|
| **Proyecto**       | DocuIA                                      |
| **Versión**        | 1.0.0                                       |
| **Fecha**          | Junio 2026                                  |
| **Público**        | Desarrolladores / Equipo técnico            |
| **Organización**   | Fe y Alegría Ecuador                        |

---

## Índice de Contenidos

1. [Descripción General del Sistema](#1-descripción-general-del-sistema)
2. [Arquitectura](#2-arquitectura)
3. [Estructura de Carpetas](#3-estructura-de-carpetas)
4. [Requisitos Técnicos](#4-requisitos-técnicos)
5. [Instalación y Configuración Local](#5-instalación-y-configuración-local)
6. [Archivos Importantes](#6-archivos-importantes)
7. [Endpoints API](#7-endpoints-api)
8. [Flujo de Autenticación](#8-flujo-de-autenticación)
9. [Flujo de Generación de Reportes](#9-flujo-de-generación-de-reportes)
10. [Gestión de Datos](#10-gestión-de-datos)
11. [Seguridad](#11-seguridad)
12. [Despliegue](#12-despliegue)
13. [Mantenimiento](#13-mantenimiento)
14. [Problemas Comunes y Soluciones](#14-problemas-comunes-y-soluciones)
15. [Apéndice](#15-apéndice)

---

## 1. Descripción General del Sistema

### 1.1 Objetivo de la Aplicación

DocuIA es una plataforma web que asiste a docentes de la Unidad Educativa Fiscomisional **Fe y Alegría "La Dolorosa"** en la redacción de reportes educativos institucionales. Mediante inteligencia artificial, el sistema transforma datos pedagógicos ingresados por el docente en documentos formales listos para presentar a coordinación académica, rectorado o al DECE.

El sistema reduce el tiempo de elaboración de reportes de horas a minutos, manteniendo el formato y lenguaje institucional ecuatoriano requerido.

### 1.2 Público Objetivo

- **Usuarios finales:** Docentes de Fe y Alegría Ecuador
- **Administradores técnicos:** Equipo de TI de la institución o desarrolladores externos que mantengan el sistema

### 1.3 Alcance

El sistema permite:

- Generación de reportes mediante IA con prompts estructurados
- Soporte de formatos institucionales propietarios de Fe y Alegría (Plan de Contingencia, Informe Docente Tutor/a, Planificación Microcurricular)
- Carga de formatos institucionales personalizados (PDF/Word/Excel) por parte de los docentes
- Gestión de cursos, plantillas reutilizables e historial de reportes
- Dashboard de métricas de uso por docente
- Asistente virtual "Lucía" con base de conocimiento FAQ + chat IA
- Exportación a Word (.docx), PDF y CSV

---

## 2. Arquitectura

### 2.1 Frontend

| Tecnología       | Versión  | Uso                                  |
|------------------|----------|--------------------------------------|
| React            | 18.3.1   | UI principal, SPA                    |
| Vite             | 5.4.2    | Build tool y dev server              |
| animejs          | 4.3.6    | Animaciones UI                       |
| docx             | 9.7.1    | Generación de archivos .docx         |
| docx-preview     | 0.3.7    | Vista previa de archivos .docx       |
| docxtemplater    | 3.68.7   | Renderizado de plantillas Word       |
| pizzip           | 3.2.0    | Manipulación de archivos ZIP/docx    |
| xlsx             | 0.18.5   | Exportación CSV/Excel                |
| pdf-parse        | 1.1.1    | Extracción de texto de PDFs subidos  |

La aplicación es una **SPA (Single Page Application)** que se sirve como archivos estáticos desde `dist/`. La autenticación de rutas se maneja en el cliente.

### 2.2 Backend

**En desarrollo:** servidor Express 4 (`server.js`) que expone todos los endpoints en `localhost:3000`.

**En producción:** Vercel Serverless Functions. Cada archivo en `api/` se convierte en una función independiente. El enrutamiento se configura en `vercel.json`.

| Archivo            | Entorno      | Descripción                          |
|--------------------|--------------|--------------------------------------|
| `server.js`        | Desarrollo   | Express que monta todos los handlers |
| `api/*.js / *.mjs` | Producción   | Serverless Functions (Vercel)        |

### 2.3 Base de Datos

**Supabase** (PostgreSQL gestionado) con las siguientes características:

- **Auth:** Supabase Auth para registro, login, recuperación de contraseña y refresh de tokens
- **RLS (Row Level Security):** Todas las tablas tienen políticas RLS activas para que cada usuario solo acceda a sus propios datos
- **REST API:** Las funciones serverless consultan la API REST de Supabase directamente usando `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS cuando es necesario (operaciones de servicio)

**Tablas principales:**

| Tabla         | Descripción                              |
|---------------|------------------------------------------|
| `cursos`      | Cursos creados por cada docente          |
| `plantillas`  | Plantillas de formularios guardadas      |
| `formatos`    | Archivos institucionales subidos         |
| `reportes`    | Historial de reportes generados          |
| `telemetria`  | Eventos de uso (visitas, acciones)       |

### 2.4 Inteligencia Artificial

| Parámetro          | Valor                          |
|--------------------|--------------------------------|
| Proveedor          | Groq API                       |
| Modelo primario    | `llama-3.3-70b-versatile`      |
| Modelo fallback    | `llama-3.1-8b-instant`         |
| Timeout            | 55 000 ms                      |
| Endpoint           | `https://api.groq.com/openai/v1/chat/completions` |
| Modo streaming     | SSE (`text/event-stream`)      |
| Modo no-streaming  | JSON (`application/json`)      |

El sistema detecta automáticamente si el cliente soporta SSE mediante el header `Accept: text/event-stream`. Si el modelo primario falla, se reintenta con el fallback automáticamente.

---

## 3. Estructura de Carpetas

```
docuia/
├── api/                        # Serverless Functions (Vercel) + handlers dev
│   ├── auth.js                 # Login, signup, recover, refresh token
│   ├── generate.mjs            # Generación de reporte con IA (SSE/JSON)
│   ├── chat.mjs                # Chat con asistente Lucía
│   ├── cursos.js               # CRUD de cursos
│   ├── plantillas.js           # CRUD de plantillas
│   ├── formatos.js             # Listado de formatos institucionales
│   ├── upload-formato.js       # Subida de formato institucional
│   ├── reportes.js             # Historial de reportes (paginado)
│   ├── telemetry.js            # Registro de eventos de telemetría
│   └── metricas.js             # Métricas de uso del docente
│
├── lib/
│   └── server/
│       ├── verifyUser.js       # Verificación JWT + helpers Supabase
│       ├── rateLimit.js        # Rate limiting por usuario e IP
│       ├── logger.js           # Logger JSON estructurado
│       └── securityHeaders.js  # Cabeceras de seguridad HTTP
│
├── src/
│   ├── App.jsx                 # Componente raíz, router de vistas, lógica principal
│   ├── App.css                 # Estilos globales, dark mode, animaciones
│   ├── main.jsx                # Punto de entrada React (ToastProvider + ErrorBoundary)
│   ├── global.css              # Variables CSS globales
│   ├── config.js               # Tipos de reporte, campos, constructor de prompts
│   ├── config/
│   │   ├── feAlegriaSchemas.js # Esquemas de formatos Fe y Alegría
│   │   └── formatosFeAlegria.js # Rutas de preview/template .docx
│   ├── components/
│   │   ├── Toast.jsx           # Sistema de notificaciones toast
│   │   ├── ErrorBoundary.jsx   # Error boundary React
│   │   ├── Navbar.jsx          # Barra de navegación superior
│   │   ├── LandingPage.jsx     # Vista de selección de tipo de reporte
│   │   ├── LoadingView.jsx     # Pantalla de carga durante generación
│   │   ├── ReportView.jsx      # Vista del reporte generado (modo genérico)
│   │   ├── FeAlegriaReportView.jsx  # Vista especial para formatos Fe y Alegría
│   │   ├── FormatoPreviewModal.jsx  # Modal de previsualización de .docx
│   │   ├── CursosView.jsx      # Gestión de cursos
│   │   ├── PlantillasView.jsx  # Gestión de plantillas
│   │   ├── DashboardView.jsx   # Dashboard de métricas
│   │   ├── OnboardingModal.jsx # Onboarding para nuevos usuarios
│   │   ├── historial/          # Componentes de historial de reportes
│   │   ├── metrics/            # Componentes de métricas y gráficos
│   │   └── assistant/          # Asistente virtual Lucía
│   ├── hooks/
│   │   ├── useTheme.js         # Hook de dark/light mode
│   │   └── useIdleDetector.js  # Detector de inactividad para popups
│   ├── utils/
│   │   ├── auth.js             # getToken, setSession, logout, authFetch, refreshAccessToken
│   │   ├── download.js         # Descarga de reportes (Word, PDF, CSV)
│   │   ├── docxExporter.js     # Exportación avanzada a .docx
│   │   ├── docxSanitize.js     # Sanitización de contenido .docx
│   │   ├── docxPreviewFit.js   # Ajuste de preview docx al contenedor
│   │   ├── feaRender.js        # Renderizado de formatos Fe y Alegría
│   │   ├── formatoText.js      # truncateForLLM y utilidades de texto
│   │   ├── fechaRelativa.js    # Formateo de fechas relativas
│   │   ├── telemetry.js        # Cliente de telemetría frontend
│   │   └── anim.js             # Utilidades de animación
│   └── data/
│       └── assistant/
│           ├── faq.js          # Base de conocimiento FAQ del asistente
│           └── contextHints.js # Hints contextuales para tooltips
│
├── public/
│   ├── login.html              # Página de login/signup/recover (HTML puro)
│   ├── login-main.js           # Lógica de auth para login.html
│   └── formatos/               # Archivos .docx de formatos Fe y Alegría
│       ├── plan-contingencia.docx
│       ├── plan-contingencia.template.docx
│       ├── informe-docente-tutor.docx
│       ├── informe-docente-tutor.template.docx
│       ├── planificacion-microcurricular.docx
│       └── planificacion-microcurricular.template.docx
│
├── scripts/
│   ├── build-fea-templates.mjs    # Compilación de plantillas Fe y Alegría
│   └── validate-fea-templates.mjs # Validación de plantillas Fe y Alegría
│
├── server.js                   # Servidor Express para desarrollo local
├── vercel.json                 # Configuración de despliegue Vercel
├── vite.config.js              # Configuración de Vite
├── package.json
├── database/
│   ├── schema.sql              # CREATE TABLE + RLS completo
│   ├── rls-hardening.sql       # Script de endurecimiento adicional de RLS
│   └── seed.sql                # Datos de prueba
```

---

## 4. Requisitos Técnicos

### 4.1 Node.js

| Requerimiento   | Versión mínima |
|-----------------|----------------|
| Node.js         | 18.x LTS       |
| npm             | 9.x o superior |

### 4.2 Variables de Entorno

Crear el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_ANON_KEY=<clave-anon-publica>
SUPABASE_SERVICE_ROLE_KEY=<clave-service-role-privada>

# Groq IA
GROQ_API_KEY=<clave-api-groq>

# Entorno (opcional)
PORT=3000
```

> **IMPORTANTE:** `SUPABASE_SERVICE_ROLE_KEY` y `GROQ_API_KEY` son secretos. Nunca incluirlos en el repositorio ni en el bundle del frontend. Solo deben estar en el servidor o en variables de entorno de Vercel.

### 4.3 Dependencias Clave

| Paquete           | Propósito                                    |
|-------------------|----------------------------------------------|
| `react` 18.3      | UI principal                                 |
| `vite` 5.4        | Build tool, dev server HMR                   |
| `express` 4.19    | Servidor local de desarrollo                 |
| `docx` 9.7        | Generación programática de .docx             |
| `docxtemplater` 3 | Relleno de plantillas .docx con datos        |
| `pizzip` 3.2      | Compresión de archivos Office (zip)          |
| `pdf-parse` 1.1   | Extracción de texto de PDFs subidos          |
| `xlsx` 0.18       | Exportación a Excel/CSV                      |
| `animejs` 4.3     | Animaciones de interfaz                      |
| `dotenv` 16.4     | Carga de variables de entorno en desarrollo  |

---

## 5. Instalación y Configuración Local

### 5.1 Clonar y Preparar el Proyecto

```bash
git clone <url-repositorio>
cd docuia
npm install
```

### 5.2 Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con los valores reales de Supabase y Groq
```

Contenido mínimo del `.env`:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GROQ_API_KEY=gsk_...
```

### 5.3 Aplicar Script RLS en Supabase

En el **SQL Editor** del panel de Supabase, ejecutar el contenido completo de:

```
database/rls-hardening.sql
```

Este script habilita RLS en todas las tablas y crea las políticas de acceso por `user_id`.

### 5.4 Comandos Disponibles

| Comando                        | Descripción                                                   |
|--------------------------------|---------------------------------------------------------------|
| `npm run dev`                  | Inicia el servidor de desarrollo Vite (frontend, puerto 5173) |
| `npm run api`                  | Inicia el servidor Express local (API, puerto 3000)           |
| `npm run build`                | Compila el frontend para producción en `dist/`                |
| `npm run preview`              | Vista previa del build de producción                          |
| `npm run build:templates`      | Compila/procesa las plantillas .docx de Fe y Alegría          |
| `npm run validate:templates`   | Valida que las plantillas .docx tengan los tags correctos     |

> En desarrollo, ejecutar `npm run dev` y `npm run api` en paralelo (dos terminales separadas).

---

## 6. Archivos Importantes

### 6.1 `package.json`

Define las dependencias, scripts y metadatos del proyecto. Versión: `1.0.0`. El campo `"type": "module"` indica que todo el código usa ES Modules (`import/export`).

### 6.2 `server.js`

Servidor Express para desarrollo local. Monta todos los handlers de `api/` bajo las rutas correspondientes. Aplica cabeceras de seguridad mediante `applySecurityHeaders`. Sirve los archivos estáticos de `public/`. Diferencia límites de body: `2 MB` por defecto, `12 MB` para `/api/upload-formato`.

### 6.3 `vercel.json`

Configura el despliegue en Vercel:
- **`buildCommand`:** `npm run build`
- **`outputDirectory`:** `dist/`
- **`headers`:** Aplica CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` a todas las rutas
- **`rewrites`:** Todas las rutas `/api/*` van a sus funciones serverless; el resto cae a `/index.html` (SPA routing)

### 6.4 `src/config.js`

Archivo central de configuración del frontend. Contiene:

- `REPORT_TYPES` — array de tipos de reporte disponibles
- `FORM_FIELDS` — campos de formulario por tipo de reporte
- `buildPrompt()` — constructor que ensambla el prompt para la IA
- `getSystemPrompt()` — retorna el system prompt apropiado (genérico, con formato propio, o específico Fe y Alegría)
- `SYSTEM_PROMPT_DEFAULT` — prompt para reportes genéricos
- `SYSTEM_PROMPT_CON_FORMATO` — prompt para cuando el docente subió su propio formato institucional
- `SYSTEM_PROMPTS_FEA` — prompts especializados por tipo Fe y Alegría

### 6.5 `lib/server/verifyUser.js`

Proporciona:

- `verifyBearerUser(req)` — extrae y verifica el JWT Bearer del header `Authorization`, retorna el usuario autenticado o lanza 401
- `getSupabaseEnv()` — retorna `{ url, anonKey, serviceKey }` desde variables de entorno
- `serviceRestHeaders()` — retorna los headers necesarios para llamadas a la REST API de Supabase con privilegios de servicio

### 6.6 `lib/server/rateLimit.js`

Implementa rate limiting en memoria:

- `allowRateLimit(key, limit, windowMs)` — retorna `true` si la petición está dentro del límite, `false` si lo supera
- `clientIp(req)` — extrae la IP real del cliente considerando proxies (`X-Forwarded-For`)

Límites en `api/generate.mjs`:
- Por usuario: **45 generaciones/hora**
- Por IP: **120 generaciones/hora**

### 6.7 `lib/server/logger.js`

Logger JSON estructurado para funciones serverless. Métodos: `logger.info()`, `logger.warn()`, `logger.error()`. Cada entrada incluye timestamp ISO, nivel, mensaje y datos adicionales como objeto JSON. Facilita la observabilidad en Vercel Logs.

### 6.8 `lib/server/securityHeaders.js`

Función `applySecurityHeaders(res)` que aplica las mismas cabeceras de seguridad que `vercel.json` en el servidor Express local, garantizando paridad de seguridad entre entornos.

### 6.9 `database/rls-hardening.sql`

Script SQL que endurece las políticas de Row Level Security existentes. Define restricciones adicionales que limitan las inserciones anónimas a las tablas de telemetría. Debe ejecutarse después de `schema.sql` antes del primer uso en producción.

---

## 7. Endpoints API

Todos los endpoints requieren el header:

```
Authorization: Bearer <access_token>
```

Excepto `/api/auth` para las acciones `login`, `signup` y `recover`.

### 7.1 `/api/auth`

| Método | Action    | Body                                 | Respuesta                               |
|--------|-----------|--------------------------------------|-----------------------------------------|
| POST   | `login`   | `{ email, password }`                | `{ access_token, refresh_token, user }` |
| POST   | `signup`  | `{ email, password }`                | `{ access_token, refresh_token, user }` |
| POST   | `recover` | `{ email }`                          | `{ message }`                           |
| POST   | `refresh` | `{ refresh_token }` (Auth requerida) | `{ access_token, refresh_token }`       |

### 7.2 `/api/generate`

| Método | Body                                             | Respuesta                                       |
|--------|--------------------------------------------------|-------------------------------------------------|
| POST   | `{ prompt, reportType, formatoContent? }`        | SSE stream o JSON según header `Accept`         |

- Si `Accept: text/event-stream` → chunks SSE del tipo `data: {"choices":[{"delta":{"content":"..."}}]}`
- Si no → `{ content: "..." }` al finalizar
- Fallback automático: `llama-3.3-70b-versatile` → `llama-3.1-8b-instant`
- Rate limit: 45/usuario/hora · 120/IP/hora

### 7.3 `/api/chat`

| Método | Body                                    | Respuesta           |
|--------|-----------------------------------------|---------------------|
| POST   | `{ messages: [{role, content}] }`       | `{ reply: "..." }`  |

Chat con el asistente Lucía. Usa Groq API con un system prompt de asistente educativo.

### 7.4 `/api/cursos`

| Método | Params/Body                                      | Respuesta                       |
|--------|--------------------------------------------------|---------------------------------|
| GET    | —                                                | `[{ id, nombre, grado, ... }]`  |
| POST   | `{ nombre, grado, paralelo, año_lectivo, ... }`  | `{ id, ... }`                   |
| PUT    | `{ id, nombre, grado, ... }`                     | `{ id, ... }`                   |
| DELETE | `?id=<curso_id>`                                 | `{ success: true }`             |

Borrado lógico: el DELETE marca `activo = false`, no elimina el registro físicamente.

### 7.5 `/api/upload-formato`

| Método | Body                                                    | Respuesta             |
|--------|---------------------------------------------------------|-----------------------|
| POST   | `{ nombre, contenido (base64), tipo, compartir? }`      | `{ id, nombre, ... }` |

Soporta PDF, Word y Excel. Límite: 12 MB. El campo `compartir: true` hace el formato accesible a otros docentes de la institución.

### 7.6 `/api/formatos`

| Método | Params             | Respuesta                                     |
|--------|--------------------|-----------------------------------------------|
| GET    | —                  | `{ mios: [...], compartidos: [...] }`         |
| DELETE | `?id=<formato_id>` | `{ success: true }`                           |

### 7.7 `/api/plantillas`

| Método | Params/Body               | Respuesta                |
|--------|---------------------------|--------------------------|
| GET    | —                         | `[{ id, nombre, data }]` |
| POST   | `{ nombre, data: {...} }` | `{ id, nombre }`         |
| DELETE | `?id=<plantilla_id>`      | `{ success: true }`      |

### 7.8 `/api/reportes`

| Método | Params/Body                                        | Respuesta                         |
|--------|----------------------------------------------------|-----------------------------------|
| GET    | `?limit=20&offset=0`                               | `{ reportes: [...], total: N }`   |
| POST   | `{ tipo, contenido, curso_id?, metadata? }`        | `{ id, ... }`                     |
| PUT    | `{ id, contenido, archivado? }`                    | `{ id, ... }`                     |
| DELETE | `?id=<reporte_id>`                                 | `{ success: true }`               |

Paginación con `limit` y `offset`. Máximo 20 por página por defecto.

### 7.9 `/api/telemetry`

| Método | Body                        | Respuesta           |
|--------|-----------------------------|---------------------|
| POST   | `{ evento, metadata? }`     | `{ success: true }` |

Registra eventos de uso. No bloquea la ejecución en caso de error.

### 7.10 `/api/metricas`

| Método | Params | Respuesta                                                           |
|--------|--------|---------------------------------------------------------------------|
| GET    | —      | `{ total_reportes, esta_semana, tipos: {...}, recientes: [...] }`   |

---

## 8. Flujo de Autenticación

```
Usuario          login.html        /api/auth          Supabase Auth
   │                 │                  │                    │
   │─── submit ─────►│                  │                    │
   │                 │─── POST login ──►│                    │
   │                 │                  │─── signInWithPassword ──►│
   │                 │                  │◄── { access_token,       │
   │                 │                  │     refresh_token, user } │
   │                 │◄── tokens ───────│                    │
   │                 │                  │                    │
   │                 │── setSession() ──►                    │
   │                 │   localStorage:                       │
   │                 │   · docuia_token                      │
   │                 │   · docuia_refresh                    │
   │                 │   · docuia_user                       │
   │                 │                  │                    │
   │◄── redirect ────│ (→ index.html)   │                    │
```

### 8.1 Refresh Token Automático

`authFetch()` en `src/utils/auth.js` envuelve `fetch` con reintentos:

1. Realiza la petición con el `access_token` actual
2. Si recibe **401**, llama a `refreshAccessToken()`
3. `refreshAccessToken()` llama a `POST /api/auth?action=refresh` con el `refresh_token`
4. Guarda el nuevo `access_token` en localStorage y reintenta la petición original
5. Si el refresh falla (token expirado), llama a `logout()` y redirige a `login.html`

### 8.2 Almacenamiento de Tokens

| Clave               | Contenido             |
|---------------------|-----------------------|
| `docuia_token`      | JWT access token      |
| `docuia_refresh`    | Refresh token         |
| `docuia_user`       | Objeto usuario (JSON) |

> **Pendiente de mejora:** Migrar a `httpOnly cookies` para mayor seguridad (requiere cambios en la configuración de Supabase Auth).

### 8.3 Flujos Adicionales

- **Signup:** `POST /api/auth` con `action=signup` → mismo flujo que login
- **Recover:** `POST /api/auth` con `action=recover` → Supabase envía email de recuperación automáticamente
- **Logout:** `logout()` limpia localStorage y redirige a `login.html`

---

## 9. Flujo de Generación de Reportes

```
Frontend (App.jsx)                    /api/generate              Groq API
      │                                     │                        │
      │── POST /api/generate ───────────────►│                        │
      │   Headers:                          │                        │
      │   · Authorization: Bearer <token>   │                        │
      │   · Accept: text/event-stream       │                        │
      │   Body:                             │                        │
      │   · prompt (texto del formulario)   │                        │
      │   · reportType                      │                        │
      │   · formatoContent? (texto del PDF) │                        │
      │                                     │                        │
      │                          verifyBearerUser()                  │
      │                          allowRateLimit(userId, 45/h)        │
      │                          allowRateLimit(clientIp, 120/h)     │
      │                          sanitizePrompt()                    │
      │                          getSystemPrompt()                   │
      │                                     │                        │
      │                                     │── chat.completions ───►│
      │                                     │   model: llama-3.3-70b │
      │                                     │   stream: true         │
      │                                     │                        │
      │◄──── SSE chunks ────────────────────│◄── stream chunks ──────│
      │  data: {"choices":[{"delta":{...}}]}│                        │
      │  ...                                │                        │
      │  data: [DONE]                       │                        │
      │                                     │                        │
      │  [Si llama-3.3-70b falla]           │                        │
      │                                     │── retry fallback ─────►│
      │                                     │   model: llama-3.1-8b  │
```

### 9.1 Sanitización del Prompt

`sanitizePrompt()` en `api/generate.mjs`:

1. Detecta intentos de prompt injection (patrones: `System:`, `Ignore `, `[INST]`, `<|system|>`, `###System`, `Assistant:`)
2. Registra el intento con `logger.warn('prompt_injection_attempt')`
3. Elimina el patrón detectado del prompt
4. Colapsa líneas en blanco excesivas (`\n{4,}` → `\n\n`)

### 9.2 Selección de System Prompt

| Condición                                    | System Prompt usado              |
|----------------------------------------------|----------------------------------|
| Tipo de reporte es Fe y Alegría              | `SYSTEM_PROMPTS_FEA[reportType]` |
| Docente subió formato propio (modo estricto) | `SYSTEM_PROMPT_CON_FORMATO`      |
| Ninguna de las anteriores                    | `SYSTEM_PROMPT_DEFAULT`          |

### 9.3 Límite de Caracteres

El prompt se trunca a **48 000 caracteres** máximo (`MAX_PROMPT_CHARS`) antes de enviarlo a Groq para evitar exceder el contexto del modelo.

---

## 10. Gestión de Datos

### 10.1 Cursos

Unidad organizativa principal del docente. Campos típicos: `nombre`, `grado`, `paralelo`, `año_lectivo`, número de estudiantes, asignatura. El borrado es lógico (`activo = false`).

### 10.2 Plantillas

Permiten al docente guardar un conjunto de valores de formulario para reutilizarlos en reportes futuros. Se almacenan como JSON en la tabla `plantillas`. Son privadas por usuario.

### 10.3 Formatos Institucionales

Archivos PDF/Word/Excel subidos por el docente como referencia de formato. El sistema extrae el texto del archivo y lo incluye en el prompt cuando el docente activa el "modo formato". Pueden marcarse como compartidos.

**Formatos nativos de Fe y Alegría** (precargados en `public/formatos/`):

| Tipo              | Archivo preview                        | Archivo template                              |
|-------------------|----------------------------------------|-----------------------------------------------|
| `contingencia`    | `plan-contingencia.docx`               | `plan-contingencia.template.docx`             |
| `informe_tutor`   | `informe-docente-tutor.docx`           | `informe-docente-tutor.template.docx`         |
| `microcurricular` | `planificacion-microcurricular.docx`   | `planificacion-microcurricular.template.docx` |

Los archivos `.template.docx` contienen tags `{{campo}}` que `docxtemplater` rellena con los datos generados por la IA.

### 10.4 Reportes

Cada reporte generado se guarda en la tabla `reportes` con: contenido, tipo, metadatos del curso, fecha y estado (`archivado: bool`). El historial es paginado (20 por página).

### 10.5 Telemetría

Eventos registrados desde el frontend via `POST /api/telemetry`: visitas de página, generaciones iniciadas, errores. Alimentan el dashboard de métricas del docente.

---

## 11. Seguridad

### 11.1 Row Level Security (RLS)

Todas las tablas de Supabase tienen RLS habilitado. Las políticas garantizan que `auth.uid() = user_id` para toda operación. El script `database/rls-hardening.sql` debe ejecutarse después de `database/schema.sql` antes del primer uso en producción.

### 11.2 Content Security Policy (CSP)

Configurada en `vercel.json` (producción) y `securityHeaders.js` (desarrollo):

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests
```

### 11.3 Verificación JWT

Cada endpoint llama a `verifyBearerUser(req)` antes de procesar. Extrae el token del header `Authorization: Bearer <token>`, lo verifica contra Supabase Auth y retorna el usuario. Token inválido o ausente → `401 Unauthorized`.

### 11.4 Almacenamiento de Secretos

| Secret                      | Dónde vive                             |
|-----------------------------|----------------------------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Variables de entorno del servidor      |
| `GROQ_API_KEY`              | Variables de entorno del servidor      |
| `SUPABASE_ANON_KEY`         | Variables de entorno del servidor      |

Ninguna clave privada debe incluirse en el código fuente ni en el bundle del frontend.

### 11.5 Otras Cabeceras de Seguridad

| Cabecera                  | Valor                                  |
|---------------------------|----------------------------------------|
| `X-Content-Type-Options`  | `nosniff`                              |
| `X-Frame-Options`         | `DENY`                                 |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`      |
| `Permissions-Policy`      | `camera=(), microphone=(), geolocation=()` |

---

## 12. Despliegue

### 12.1 Vercel (Producción)

1. Conectar el repositorio GitHub a Vercel
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configurar variables de entorno en el dashboard de Vercel (Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GROQ_API_KEY`

Vercel detecta automáticamente los archivos en `api/` y los despliega como Serverless Functions.

### 12.2 Consideraciones de Serverless

- **Timeout máximo:** `api/generate.mjs` declara `export const config = { maxDuration: 60 }` (60 segundos) para acomodar el timeout de Groq (55 s)
- **Cold starts:** Las funciones pueden tener latencia en el primer acceso. No hay estado persistente entre invocaciones; el rate limiter en memoria se reinicia en cada cold start.
- **Número de funciones:** 10 funciones actualmente (`auth`, `generate`, `chat`, `cursos`, `formatos`, `upload-formato`, `plantillas`, `reportes`, `telemetry`, `metricas`)
- **Límite de body en Vercel:** 4.5 MB por request por defecto. Para archivos más grandes, considerar Supabase Storage directamente desde el cliente.

---

## 13. Mantenimiento

### 13.1 Backups de Base de Datos

Supabase incluye backups automáticos en planes de pago. Para el plan gratuito, exportar periódicamente:

```bash
supabase db dump --db-url <connection-string> > backup_$(date +%Y%m%d).sql
```

### 13.2 Actualización de Dependencias

```bash
# Revisar paquetes desactualizados
npm outdated

# Actualizar dependencias menores/patch
npm update

# Actualizar una dependencia específica
npm install react@latest react-dom@latest
```

Precaución especial con `docxtemplater`, `docx-preview` y `xlsx` — cambios de versión mayor pueden afectar el renderizado de documentos.

### 13.3 Validación de Plantillas Fe y Alegría

Después de modificar cualquier archivo `.template.docx`:

```bash
npm run validate:templates
```

Este script verifica que todos los tags `{{campo}}` en los templates correspondan a los schemas en `src/config/feAlegriaSchemas.js`.

Para compilar cambios:

```bash
npm run build:templates
```

### 13.4 Rotación de API Keys

1. Generar nueva clave en Groq o Supabase
2. Actualizar en Vercel (Settings → Environment Variables)
3. Hacer un redeploy para que las funciones serverless carguen la nueva clave

---

## 14. Problemas Comunes y Soluciones

### 14.1 Errores de Autenticación

| Síntoma                            | Causa probable                        | Solución                                             |
|------------------------------------|---------------------------------------|------------------------------------------------------|
| `401 Unauthorized` en todas las APIs | Token expirado y refresh fallido    | Borrar localStorage y reloguear                     |
| Login no redirige a la app         | `SUPABASE_URL` o `ANON_KEY` incorrectos | Verificar variables de entorno en `.env`          |
| "Email not confirmed"              | Usuario no verificó su email          | Revisar spam o deshabilitar confirmación en Supabase Auth |
| Refresh token inválido             | Sesión de Supabase expirada           | Logout y nuevo login                                 |

### 14.2 Falta de Variables de Entorno

| Síntoma                                                 | Variable faltante             | Solución                              |
|---------------------------------------------------------|-------------------------------|---------------------------------------|
| `Cannot read properties of undefined (reading 'url')`  | `SUPABASE_URL`                | Agregar al `.env` y reiniciar         |
| Generación falla con `401` desde Groq                   | `GROQ_API_KEY`                | Agregar al `.env` o Vercel env vars   |
| RLS errors o `permission denied` en Supabase            | `SUPABASE_SERVICE_ROLE_KEY`   | Agregar al `.env` y reiniciar         |

### 14.3 Timeout de Groq

| Síntoma                              | Causa                          | Solución                                         |
|--------------------------------------|--------------------------------|--------------------------------------------------|
| Generación falla tras ~55 s          | Timeout de Groq API            | El sistema reintenta con fallback automáticamente. Verificar `status.groq.com` si persiste |
| Error `AbortError`                   | El cliente cerró la conexión   | Verificar conexión del usuario                   |

### 14.4 Issues de CORS en Desarrollo

En desarrollo, si el frontend (`:5173`) llama a la API (`:3000`) y hay errores CORS, agregar temporalmente en `server.js`:

```js
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
```

En producción no hay CORS porque frontend y API comparten el mismo dominio de Vercel.

### 14.5 Plantillas .docx No Renderizan Correctamente

```bash
npm run validate:templates
npm run build:templates
```

Si el preview en el modal no coincide con el resultado exportado, verificar que el archivo `.docx` de preview y el `.template.docx` estén sincronizados en contenido y estructura.

---

## 15. Apéndice

### 15.1 Comandos Útiles

```bash
# Desarrollo
npm run dev             # Frontend en http://localhost:5173
npm run api             # API en http://localhost:3000

# Build y preview
npm run build           # Compila para producción
npm run preview         # Sirve el build localmente

# Plantillas Fe y Alegría
npm run build:templates
npm run validate:templates

# Verificar variables de entorno cargadas
node -e "import('dotenv/config').then(() => console.log(process.env.SUPABASE_URL))"

# Git
git log --oneline -20
git diff HEAD
```

### 15.2 Referencias

| Recurso                     | URL                                              |
|-----------------------------|--------------------------------------------------|
| Supabase Docs               | https://supabase.com/docs                        |
| Supabase Auth               | https://supabase.com/docs/guides/auth            |
| Groq API Docs               | https://console.groq.com/docs/openai             |
| Groq Status                 | https://status.groq.com                          |
| Vercel Docs                 | https://vercel.com/docs                          |
| Vercel Serverless Functions | https://vercel.com/docs/functions                |
| Vite Docs                   | https://vite.dev/guide                           |
| React 18 Docs               | https://react.dev                                |
| docxtemplater Docs          | https://docxtemplater.com/docs                   |

### 15.3 Modelo de Datos Simplificado

```
users (Supabase Auth)
  └─► cursos          (user_id → auth.uid(), activo: bool)
  └─► plantillas      (user_id → auth.uid())
  └─► formatos        (user_id → auth.uid(), compartido: bool)
  └─► reportes        (user_id → auth.uid(), curso_id?, archivado: bool)
  └─► telemetria      (user_id → auth.uid(), evento, metadata)
```

### 15.4 Pendientes de Implementación

| Mejora                              | Estado     | Notas                                           |
|-------------------------------------|------------|-------------------------------------------------|
| Migrar tokens a `httpOnly cookies`  | Pendiente  | Requiere cambios en Supabase Auth config        |
| Tabla `instituciones` (multi-tenancy) | Pendiente | SQL pendiente de ejecutar en Supabase           |
| Tests (Vitest + Playwright)         | Pendiente  | No hay suite de tests actualmente               |
