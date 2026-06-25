# Diccionario de Datos — DocuIA

Base de datos: **Supabase (PostgreSQL)** · Schema completo: [`../database/schema.sql`](../database/schema.sql)

---

## Tabla: `reportes`

Almacena cada informe generado por un docente.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha y hora de creación |
| `email_docente` | TEXT | Sí | — | Email del docente (puede ser nulo para usuarios anónimos legacy) |
| `nombre_docente` | TEXT | No | — | Nombre completo del docente |
| `institucion` | TEXT | Sí | — | Nombre de la institución educativa |
| `curso` | TEXT | No | — | Nombre del curso/paralelo (ej. "8vo B — Matemáticas") |
| `periodo` | TEXT | No | — | Período académico (ej. "Primer Quimestre 2025-2026") |
| `tipo_reporte` | TEXT | No | — | Tipo: `contingencia`, `calificaciones`, `asistencia`, `informe_tutor`, `microcurricular` |
| `datos_ingresados` | JSONB | Sí | — | Datos del formulario serializado en JSON |
| `reporte_generado` | TEXT | Sí | — | Texto del informe generado por la IA |
| `fue_copiado` | BOOLEAN | No | `false` | Indica si el usuario copió el informe al portapapeles |
| `feedback` | SMALLINT | Sí | NULL | Valoración: `1` (positiva) o `-1` (negativa) |
| `feedback_nota` | TEXT | Sí | NULL | Comentario opcional del docente sobre el informe |

**RLS:** `INSERT` permitido a anónimos (para compatibilidad legacy); acceso completo solo al dueño mediante `auth.uid()`.

---

## Tabla: `visitas`

Registro de visitas anónimas a la plataforma para métricas AARRR.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha y hora de la visita |
| `referrer` | TEXT | Sí | — | URL de referencia (de dónde vino el usuario) |

**RLS:** `INSERT` abierto (telemetría anónima). Sin SELECT para usuarios normales.

---

## Tabla: `reportes_copiados`

Analytics: registra cada vez que un usuario copia un informe generado.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha y hora del evento |
| `email_docente` | TEXT | Sí | — | Email del docente (puede ser nulo) |
| `tipo` | TEXT | Sí | — | Tipo de reporte que fue copiado |

**RLS:** `INSERT` abierto (analytics anónimo).

---

## Tabla: `referrals`

Registro de referencias: cuando un usuario comparte la plataforma con otro.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha y hora del referido |
| `email_from` | TEXT | Sí | — | Email del usuario que realizó la referencia |

**RLS:** `INSERT` abierto.

---

## Tabla: `profiles`

Perfil extendido del usuario (complementa `auth.users` de Supabase).

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | — | PK = FK a `auth.users(id)` (cascade delete) |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha de creación del perfil |
| `email` | TEXT | Sí | — | Email del usuario |
| `name` | TEXT | Sí | — | Nombre completo |
| `role` | TEXT | Sí | `'Docente'` | Rol en la plataforma (Docente, Admin) |
| `institucion` | TEXT | Sí | — | Institución a la que pertenece |
| `cargo` | TEXT | Sí | `'Docente'` | Cargo institucional |

**RLS:** `INSERT` abierto; `SELECT` solo para el propietario (`auth.uid() = id`).

---

## Tabla: `cursos`

Un curso representa una materia específica impartida por un docente en un grado y paralelo.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha de creación |
| `user_id` | UUID | No | — | FK a `auth.users(id)` (cascade delete) |
| `nombre` | TEXT | No | — | Nombre descriptivo (ej. "8vo B — Matemáticas") |
| `grado` | TEXT | No | — | Nivel educativo (ej. "8vo EGB", "1ro BGU") |
| `paralelo` | TEXT | Sí | — | Paralelo (ej. "A", "B") |
| `asignatura` | TEXT | No | — | Materia impartida |
| `num_estudiantes` | INTEGER | No | `0` | Número de estudiantes en el curso |
| `jornada` | TEXT | Sí | — | Jornada escolar (Matutina, Vespertina) |
| `año_lectivo` | TEXT | Sí | — | Año lectivo (ej. "2025-2026") |
| `periodo_actual` | TEXT | Sí | — | Quimestre o período activo |
| `activo` | BOOLEAN | No | `true` | `false` = eliminación lógica (soft delete) |
| `nombres_estudiantes` | TEXT[] | Sí | — | Array con nombres de estudiantes |
| `observaciones` | TEXT | Sí | — | Notas adicionales del docente |

**Índices:** `idx_cursos_user_id` (performance), `idx_cursos_activo` (filtro de activos).  
**RLS:** CRUD completo solo para el propietario (`auth.uid() = user_id`).

---

## Tabla: `formatos_institucionales`

Almacena los PDFs o Excel institucionales subidos por el docente para personalizar la generación de reportes.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha de subida |
| `user_id` | UUID | No | — | FK a `auth.users(id)` (cascade delete) |
| `tipo_reporte` | TEXT | No | — | Tipo de reporte al que aplica este formato |
| `nombre_archivo` | TEXT | No | — | Nombre original del archivo subido |
| `tipo_archivo` | TEXT | No | — | `'pdf'` o `'excel'` |
| `contenido_extraido` | TEXT | No | — | Texto plano extraído del PDF/Excel (para el prompt de IA) |
| `es_ejemplo` | BOOLEAN | No | `false` | `true` si tiene datos de ejemplo; `false` si está vacío |
| `num_campos_detectados` | INTEGER | No | `0` | Campos detectados automáticamente en el formato |
| `activo` | BOOLEAN | No | `true` | `false` = eliminación lógica |

**Índices:** `idx_formatos_user_id`, `idx_formatos_tipo`.  
**RLS:** CRUD completo solo para el propietario.

---

## Tabla: `plantillas`

Plantillas guardadas por el docente: combinaciones de tipo de reporte + datos pre-rellenados para reutilizar.

| Campo | Tipo | Nulo | Por defecto | Descripción |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | `gen_random_uuid()` | Clave primaria |
| `created_at` | TIMESTAMPTZ | No | `now()` | Fecha de creación |
| `user_id` | UUID | No | — | FK a `auth.users(id)` |
| `nombre` | TEXT | No | — | Nombre descriptivo de la plantilla |
| `tipo_reporte` | TEXT | No | — | Tipo de reporte al que corresponde |
| `datos` | JSONB | No | — | Campos del formulario pre-rellenados (JSON) |
| `activo` | BOOLEAN | No | `true` | `false` = eliminación lógica |

**RLS:** CRUD completo solo para el propietario.

---

## Notas generales

- Todos los UUIDs se generan con `gen_random_uuid()` (PostgreSQL nativo).
- Los campos `activo` usan **eliminación lógica** (soft delete): nunca se borra un registro, solo se marca como inactivo.
- Todas las tablas tienen **RLS habilitado** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- El script completo de creación está en `../database/schema.sql`.
