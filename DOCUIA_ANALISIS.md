# DocuIA — Análisis de Fallas y Plan de Mejoras

> Generado: junio 2026  
> Contexto: deploy a 10 docentes de prueba en ~48 h · sin usuarios activos aún

---

## 1. Fallas Críticas (🔴 Bloquean producción)

### 1.1 Rate Limiting en Memoria — Falso Positivo de Seguridad

- **Problema:** `rateLimit.js` guarda contadores en memoria del proceso Node. En Vercel Serverless cada cold start reinicia la memoria → los límites (45/hora/usuario, 120/hora/IP) nunca se cumplen realmente.
- **Impacto real:** Sin rate limiting efectivo. Un usuario puede hacer requests ilimitados y generar costos en Groq.
- **Contexto:** No ha habido abuso aún, pero el deploy a 10 docentes en 48 h hace esto urgente.
- **Fix requerido:** Persistir contadores en Supabase o Vercel KV. Tabla `rate_limit` con `(key TEXT, count INT, window_start TIMESTAMPTZ)`.

---

### 1.2 `buildPrompt()` en el Cliente — Prioridad del Prompt del Cliente

- **Problema:** `buildPrompt()` vive en `src/config.js` (frontend). El usuario puede inspeccionar y modificar la estructura antes de enviarse.
- **Contexto aclarado:** El servidor **debe priorizar el prompt que llega del cliente** como base de construcción, no ignorarlo.
- **Implicación:** El servidor debe recibir el prompt del cliente, validarlo (sanitizar inyecciones), enriquecerlo con el `system prompt` y contexto institucional, y solo entonces enviarlo a Groq. El cliente nunca debe controlar el `system`.
- **Fix requerido:**
  - Validación y sanitización en `generate.mjs` antes de usar el prompt del cliente.
  - El `system prompt` permanece 100% server-side.
  - Documentar el contrato: cliente envía `userPrompt`, servidor construye `systemPrompt`.

---

### 1.3 Tokens en `localStorage` — XSS crítico

- **Problema:** `docuia_token`, `docuia_refresh`, `docuia_user` en `localStorage` son accesibles por cualquier script inyectado.
- **Estado:** En roadmap sin fecha.
- **Prioridad:** Alta dado el deploy inminente con datos de docentes reales.
- **Fix requerido:** Migrar a cookies `httpOnly; Secure; SameSite=Strict`. Requiere cambio en `api/auth.js` y en `login-main.js`.

---

## 2. Fallas Funcionales (🟡 Afectan experiencia)

### 2.1 Sin Paginación en Cursos y Plantillas

- **Problema:** `GET /api/cursos` y `GET /api/plantillas` devuelven todos los registros sin `limit/offset`.
- **Impacto:** Con docentes que acumulen 20+ cursos o plantillas, el payload crece innecesariamente.
- **Fix:** Agregar `?limit=&offset=` igual que en `reportes`. Cargar más con botón o scroll infinito.

---

### 2.2 Borrado Lógico sin Estrategia de Purga

- **Problema:** `activo = false` en `cursos`, `plantillas`, `formatos_institucionales`, `reportes` acumula filas indefinidamente.
- **Impacto:** Queries lentas a mediano plazo; costos de almacenamiento en Supabase.
- **Fix:** Scheduled function (Supabase Edge Function con cron) que purga registros `activo = false` con más de 90 días. Opcional: dar al usuario opción de "vaciar papelera".

---

### 2.3 Sin Versionado de Ediciones en Reportes

- **Problema:** `PATCH /api/reportes` sobrescribe `reporte_generado` directamente. No hay forma de recuperar una versión anterior.
- **Contexto aclarado:** Los docentes sí editan los reportes post-generación → necesitan historial.
- **Fix requerido:**
  - Nueva tabla `reporte_versiones (id, reporte_id, contenido, created_at, autor)`.
  - Antes de cada `PATCH`, guardar snapshot de la versión actual.
  - En `ReportView.jsx`: botón "Ver versiones anteriores" → modal con lista de snapshots restaurables.

---

### 2.4 `nombres_estudiantes TEXT[]` sin Límite de Tamaño

- **Problema:** El array de nombres de estudiantes se inyecta al prompt sin validación de longitud.
- **Impacto:** Prompts inflados → más tokens → más costo → posible superación del límite de 48 000 caracteres.
- **Fix:** Validar en `generate.mjs`: máximo 40 nombres; si excede, truncar y advertir al usuario.

---

### 2.5 Dashboard Calculado en Cliente con Datos Paginados

- **Problema:** Las métricas del dashboard se calculan en frontend a partir de `GET /api/reportes`, pero ese endpoint devuelve solo 20 por página. Las métricas son incorrectas para usuarios con más de 20 reportes.
- **Fix:** Endpoint dedicado `GET /api/metricas` que calcule agregaciones en PostgreSQL (`COUNT`, `GROUP BY`) y devuelva el resultado directo. Sin paginación.

---

## 3. Mejoras de Producto (🟢 Post-deploy)

### 3.1 Panel Institucional — Multi-tenancy

- **Contexto aclarado:** Fe y Alegría requiere dos niveles de acceso:
  - **Panel Docente:** el actual, ya funcional.
  - **Panel Institución:** vista administrativa para coordinadores/directivos.

- **Arquitectura requerida:**

```sql
-- Nueva tabla instituciones
CREATE TABLE instituciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  red         TEXT,          -- ej: "Fe y Alegría Ecuador"
  ciudad      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  activo      BOOLEAN DEFAULT true
);

-- Relación profiles → institución
ALTER TABLE profiles ADD COLUMN institucion_id UUID REFERENCES instituciones(id);
ALTER TABLE profiles ADD COLUMN rol_institucional TEXT DEFAULT 'docente'; 
-- valores: 'docente' | 'coordinador' | 'admin_red'
```

- **Panel Institución mostraría:**
  - Total de reportes generados por docente (tabla).
  - Tipos de reporte más usados en la institución.
  - Docentes activos vs inactivos.
  - Exportar resumen CSV/Excel para autoridades.
  - Gestión de formatos institucionales compartidos (ya existe el campo `compartido`).

- **Acceso:** Ruta protegida `/admin` visible solo si `rol_institucional = 'coordinador' | 'admin_red'`.

---

### 3.2 CI/CD — Pipeline de Deploy

- **Estado actual:** Deploy manual `npx vercel --prod`. Sin tests automáticos.
- **Riesgo:** Deploy a docentes de prueba sin red de seguridad.
- **Propuesta mínima (GitHub Actions):**

```yaml
# .github/workflows/deploy.yml
on: [push to main]
jobs:
  test:
    - npm run test        # Vitest (pendiente implementar)
  deploy:
    needs: test
    - npx vercel --prod --token $VERCEL_TOKEN
```

---

### 3.3 Observabilidad — Alerting Real

- **Estado actual:** Logger JSON estructurado sin destino de alertas.
- **Fix mínimo:** Integrar Sentry (free tier) para captura de errores en serverless + frontend. Una línea en `generate.mjs` y en `ErrorBoundary.jsx`.

---

### 3.4 Fallback Model no Documentado

- **Problema:** `generate.mjs` tiene lógica de fallback de modelo no documentada en README ni en `config.js`.
- **Fix:** Documentar en README qué modelo es el fallback, en qué condición se activa (error 429 de Groq, timeout) y si el usuario recibe notificación.

---

## 4. Resuelto (✅ Cerrado)

| # | Ítem | Estado |
|---|------|--------|
| 5 | Export Word — whitespace excesivo al inicio del `.doc` | ✅ Corregido |

---

## 5. Priorización para Deploy en 48 h

| Prioridad | Ítem | Esfuerzo estimado |
|-----------|------|-------------------|
| 🔴 P0 | Rate limiting real (Supabase tabla) | 3–4 h |
| 🔴 P0 | Sanitización del prompt del cliente en `generate.mjs` | 1–2 h |
| 🟡 P1 | Versionado de reportes (tabla + UI básica) | 4–6 h |
| 🟡 P1 | Paginación cursos y plantillas | 2–3 h |
| 🟡 P1 | Endpoint `/api/metricas` server-side | 2 h |
| 🟢 P2 | Panel institucional (arquitectura + tabla `instituciones`) | 8–12 h |
| 🟢 P2 | Tokens → cookies httpOnly | 3–4 h |
| 🟢 P3 | CI/CD GitHub Actions | 1–2 h |
| 🟢 P3 | Sentry | 1 h |
| 🟢 P3 | Purga de borrado lógico (cron) | 2 h |

---

## 6. Contrato de Arquitectura — Prompt (Aclaración)

```
Cliente (src/config.js)
  └─ buildPrompt(type, form) → userPrompt (texto del formulario)
       └─ POST /api/generate { userPrompt, formatoId? }

Servidor (api/generate.mjs)
  └─ 1. Recibe userPrompt
  └─ 2. Sanitiza (strip inyecciones, validar longitud)
  └─ 3. Construye systemPrompt (server-only, nunca expuesto al cliente)
  └─ 4. Si formatoId: inyecta contenido del formato institucional
  └─ 5. Envía a Groq: { system: systemPrompt, user: userPrompt }
```

**Regla:** El cliente controla QUÉ datos envía. El servidor controla CÓMO se construye el prompt para la IA.
