# DocuIA — Plan de Integración de Formatos Institucionales Fe y Alegría

> Versión: junio 2026  
> Alcance: reemplazar los tipos de reporte genéricos de la PPT por los 3 formatos reales entregados por los docentes

---

## 1. Contexto y Decisión

Los docentes de Fe y Alegría entregaron 3 formatos oficiales que **reemplazan** a los tipos de reporte genéricos actuales:

| Formato Real | Reemplaza a (config actual) |
|---|---|
| Informe Académico y Comportamental del Docente Tutor/a | `DECE` (Informe DECE) |
| Plan de Contingencia para Estudiantes | `SEMANAL` (Reporte Semanal) |
| Planificación Microcurricular — Bachillerato Técnico | `PLANIFICACION` (Planificación Docente) |

> **Nota:** Reporte de Calificaciones y Reporte de Asistencia se mantienen con su estructura actual hasta recibir formato oficial de la institución.

---

## 2. Cambios en `src/config.js`

### 2.1 Actualizar `REPORT_TYPES`

```js
// ANTES
{ id: 'dece',          label: 'Informe DECE',        icon: '🧠' }
{ id: 'semanal',       label: 'Reporte Semanal',      icon: '📋' }
{ id: 'planificacion', label: 'Planificación Docente', icon: '📄' }

// DESPUÉS
{ id: 'informe_tutor',    label: 'Informe Docente Tutor/a',         icon: '🧠' }
{ id: 'contingencia',     label: 'Plan de Contingencia',            icon: '📋' }
{ id: 'microcurricular',  label: 'Planificación Microcurricular',   icon: '📄' }
```

### 2.2 Nuevos `FORM_FIELDS` por tipo

#### `informe_tutor`
```js
{
  trimestre:              { type: 'select', options: ['I', 'II', 'III'] },
  fecha:                  { type: 'date' },
  grado_curso:            { type: 'text', placeholder: 'Ej: 3° BT "A"' },
  paralelo:               { type: 'text' },
  num_matriculados:       { type: 'number' },
  num_asisten:            { type: 'number' },
  num_retirados:          { type: 'number' },
  motivos_desercion:      { type: 'textarea' },
  // Académico
  asignaturas_reporte:    { type: 'textarea', hint: 'Una por línea: asignatura, docente, N° estudiantes en riesgo' },
  compromisos_docentes:   { type: 'textarea' },
  compromisos_estudiantes:{ type: 'textarea' },
  estudiantes_reincidentes:{ type: 'textarea', hint: 'Apellido Nombre, uno por línea' },
  // Comportamental
  convivencia_general:    { type: 'textarea' },
  normas_institucionales: { type: 'textarea' },
  seguimiento_tutorial:   { type: 'textarea', hint: 'Estudiante — motivo, uno por línea' },
  // Jóvenes en Movimiento
  temas_trabajados:       { type: 'textarea' },
  temas_sugeridos:        { type: 'textarea' },
  // Complementarios
  estudiantes_convivencia:{ type: 'textarea' },
  casos_vulnerabilidad:   { type: 'textarea', hint: 'Caso 1: descripción...' },
  sugerencias_dece:       { type: 'textarea' },
  sugerencias_inspeccion: { type: 'textarea' },
  sugerencias_vicerrectorado: { type: 'textarea' },
  sugerencias_rectorado:  { type: 'textarea' },
  sugerencias_docentes:   { type: 'textarea' },
  problemas_padres:       { type: 'textarea' },
}
```

#### `contingencia`
```js
{
  fecha:              { type: 'date' },
  trimestre:          { type: 'select', options: ['I', 'II', 'III'] },
  asignatura:         { type: 'text' },
  grado_curso:        { type: 'text' },
  nombres_estudiantes:{ type: 'textarea', hint: 'Uno por línea' },
  tema_clase:         { type: 'text' },
  objetivo_clase:     { type: 'textarea' },
  instrucciones:      { type: 'textarea' },
  actividades:        { type: 'textarea' },
  fecha_entrega:      { type: 'date' },
  observacion:        { type: 'textarea' },
  material_apoyo:     { type: 'textarea' },
}
```

#### `microcurricular`
```js
{
  figura_profesional:    { type: 'text', placeholder: 'Bachillerato Técnico en Informática' },
  area:                  { type: 'text' },
  curso:                 { type: 'text' },
  año_lectivo:           { type: 'text', placeholder: '2025-2026' },
  numero_trimestre:      { type: 'select', options: ['1', '2', '3'] },
  nombre_modulo:         { type: 'text' },
  num_horas:             { type: 'number' },
  fecha_inicio:          { type: 'date' },
  fecha_fin:             { type: 'date' },
  objetivo_modulo:       { type: 'textarea' },
  nombre_unidad_trabajo: { type: 'text' },
  objetivo_unidad_trabajo:{ type: 'textarea' },
  ejes_transversales:    { type: 'textarea' },
  num_semanas:           { type: 'select', options: ['8','9','10','11','12','13','14'] },
  // Por semana: contenido plano en textarea, la IA estructura la tabla
  contenido_semanal:     { type: 'textarea', hint: 'Semana 1: contenidos, actividades, recursos...' },
  adaptaciones_curriculares: { type: 'textarea', hint: 'Iniciales estudiante — necesidad educativa' },
  estrategias_metodologicas: { type: 'textarea' },
  observaciones_unidad:  { type: 'textarea' },
  nombre_coordinador:    { type: 'text' },
  nombre_vicerrector:    { type: 'text' },
}
```

### 2.3 Actualizar `buildPrompt()`

```js
// Para cada nuevo tipo, buildPrompt debe mapear los campos del form
// al texto que recibe el servidor. Ejemplo para contingencia:

case 'contingencia':
  return `
Genera un Plan de Contingencia para estudiante(s) en situación especial con los siguientes datos:
Fecha: ${form.fecha} | Trimestre: ${form.trimestre} | Asignatura: ${form.asignatura}
Grado/Curso: ${form.grado_curso} | Docente: ${user.name}
Estudiantes: ${form.nombres_estudiantes}
Tema: ${form.tema_clase}
Objetivo: ${form.objetivo_clase}
Instrucciones: ${form.instrucciones}
Actividades: ${form.actividades}
Fecha de entrega: ${form.fecha_entrega}
Observación: ${form.observacion}
Material de apoyo: ${form.material_apoyo}
`.trim();
```

---

## 3. Cambios en `api/generate.mjs` — System Prompts por Tipo

Agregar al objeto `SYSTEM_PROMPTS` (o equivalente server-side) un bloque por tipo nuevo:

### `informe_tutor`
```
Eres un asistente especializado en educación ecuatoriana para Fe y Alegría.
Genera el Informe Académico y Comportamental del Docente Tutor/a siguiendo exactamente esta estructura:
1. Datos generales (tabla)
2. Aspectos Académicos por mejorar (por asignatura, con compromisos y reincidentes)
3. Aspectos Comportamentales (convivencia, normas, seguimiento tutorial)
4. Jóvenes en Movimiento (temas trabajados y sugeridos)
5. Aspectos Complementarios (convivencia, vulnerabilidad DECE, sugerencias a cada estamento)
6. Bloque de firmas

Reglas estrictas:
- Usa EXACTAMENTE los nombres, grados, trimestres y fechas que el docente indicó en el formulario.
- No inventes estudiantes, casos ni situaciones.
- Mantén un tono institucional formal, tercera persona.
- Respeta la jerarquía de sugerencias: DECE → Inspección → Vicerrectorado → Rectorado → Docentes.
- Si un campo está vacío, escribe "Sin novedad" o "No aplica".
```

### `contingencia`
```
Eres un asistente especializado en educación ecuatoriana para Fe y Alegría.
Genera el Plan de Contingencia Pedagógica con el formato oficial de la institución.
Estructura: encabezado con datos generales, tabla de planificación de actividad, sección de material de apoyo, bloque de firmas.
Reglas estrictas:
- Usa los datos exactos del formulario sin modificarlos.
- Las actividades deben ser claras y ejecutables por el estudiante de forma autónoma.
- Tono formal, instrucciones en segunda persona para el estudiante.
- El material de apoyo debe ser relevante al tema indicado.
```

### `microcurricular`
```
Eres un asistente especializado en planificación curricular técnica ecuatoriana para Fe y Alegría "La Dolorosa".
Genera la Planificación Microcurricular para Bachillerato Técnico con el formato oficial del año lectivo 2025-2026.
Estructura:
1. Datos de referencia (tabla completa)
2. Desarrollo de la unidad por semanas (tabla con columnas: Procedimentales, Conceptuales, Actitudinales, Actividades, Recursos, Criterios, Técnicas)
3. Adaptaciones curriculares (tabla estudiante — NEE)
4. Estrategias metodológicas activas por semana
5. Observaciones de la unidad
6. Bloque de firmas con 4 firmantes

Reglas estrictas:
- Usa EXACTAMENTE la figura profesional, módulo, fechas y horas indicadas.
- No inventes contenidos; si el docente no especificó semanas individuales, distribuye los contenidos generales de forma progresiva.
- Las estrategias metodológicas deben ser activas y coherentes con el módulo técnico indicado.
- Mantén el encabezado oficial: "Unidad Educativa Fiscomisional Fe y Alegría 'La Dolorosa' — Ser más para servir mejor".
```

---

## 4. Migración en Base de Datos

### 4.1 Actualizar valores en tabla `reportes`

```sql
-- Renombrar IDs de tipo de reporte existentes
UPDATE reportes SET tipo_reporte = 'informe_tutor'   WHERE tipo_reporte = 'dece';
UPDATE reportes SET tipo_reporte = 'contingencia'    WHERE tipo_reporte = 'semanal';
UPDATE reportes SET tipo_reporte = 'microcurricular' WHERE tipo_reporte = 'planificacion';
```

### 4.2 Actualizar tabla `plantillas`

```sql
UPDATE plantillas SET tipo_reporte = 'informe_tutor'   WHERE tipo_reporte = 'dece';
UPDATE plantillas SET tipo_reporte = 'contingencia'    WHERE tipo_reporte = 'semanal';
UPDATE plantillas SET tipo_reporte = 'microcurricular' WHERE tipo_reporte = 'planificacion';
```

### 4.3 Actualizar tabla `formatos_institucionales`

```sql
UPDATE formatos_institucionales SET tipo_reporte = 'informe_tutor'   WHERE tipo_reporte = 'dece';
UPDATE formatos_institucionales SET tipo_reporte = 'contingencia'    WHERE tipo_reporte = 'semanal';
UPDATE formatos_institucionales SET tipo_reporte = 'microcurricular' WHERE tipo_reporte = 'planificacion';
```

> **Ejecutar en Supabase SQL Editor antes del deploy.**

---

## 5. Archivos MD de Referencia para el Sistema

Guardar los 3 MD de formato en el proyecto como referencia para el system prompt y para la función `formatParser.js`:

```
docuia/
└── lib/
    └── formatos/
        ├── informe_tutor.md          ← Entregable 1
        ├── plan_contingencia.md      ← Entregable 2
        └── planificacion_micro.md    ← Entregable 3
```

Estos archivos se inyectan como contexto de estructura cuando el docente **no** sube un formato institucional propio, garantizando que la IA genere el documento con la estructura correcta de Fe y Alegría.

---

## 6. Orden de Ejecución

| Paso | Tarea | Archivo | Prioridad |
|---|---|---|---|
| 1 | Crear carpeta `lib/formatos/` con los 3 MD | — | Inmediato |
| 2 | Actualizar `REPORT_TYPES` en `config.js` | `src/config.js` | Inmediato |
| 3 | Agregar `FORM_FIELDS` para los 3 tipos nuevos | `src/config.js` | Inmediato |
| 4 | Actualizar `buildPrompt()` para los 3 tipos | `src/config.js` | Inmediato |
| 5 | Agregar `SYSTEM_PROMPTS` server-side | `api/generate.mjs` | Inmediato |
| 6 | Ejecutar migración SQL en Supabase | Supabase SQL Editor | Antes del deploy |
| 7 | Actualizar labels en `HistorialView.jsx` | `src/components/HistorialView.jsx` | Antes del deploy |
| 8 | Actualizar labels en `DashboardView.jsx` | `src/components/DashboardView.jsx` | Antes del deploy |
| 9 | Prueba de generación con datos reales | — | Post-deploy piloto |

---

## 7. Criterios de Validación (QA mínimo)

Antes de dar por completo el deploy con los 10 docentes de prueba:

- [ ] Generar un `informe_tutor` con datos de un curso real → verificar que el grado y trimestre en el reporte coincidan con el formulario (hallucination check).
- [ ] Generar un `contingencia` con 3 estudiantes → verificar que los 3 nombres aparecen en el documento generado.
- [ ] Generar un `microcurricular` con 8 semanas → verificar que la tabla tiene exactamente 8 filas de semana.
- [ ] Verificar que el historial muestra los nuevos labels correctamente.
- [ ] Verificar que las plantillas guardadas con los tipos viejos aún cargan correctamente tras la migración SQL.
