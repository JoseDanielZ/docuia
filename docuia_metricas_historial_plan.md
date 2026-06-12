# DocuIA — Plan de Mejora: Métricas e Historial

> Versión: junio 2026  
> Enfoque: utilidad real para el docente, no decoración  
> Para: Claude Code

---

## 1. Diagnóstico rápido

### Métricas — problemas actuales
- Los 4 datos (reportes generados, cursos, copiados, tipo más usado) se muestran como texto plano sin jerarquía
- El número y su etiqueta están al mismo nivel visual — el ojo no sabe dónde mirar
- "Sin datos aún" como string suelto es frustrante, no orientativo
- No hay ninguna acción derivada de las métricas — el profe ve los números y no sabe qué hacer con ellos
- El botón "Volver" como única acción en la pantalla desperdicia el espacio

### Historial — problemas actuales
- Todos los items lucen idénticos — no hay diferenciación por tipo de documento
- El nombre del reporte usa datos técnicos ("semanal — 8vo - A", "wasa", "wawa") sin formato legible
- La fecha está en formato largo que ocupa espacio sin aportar
- Un solo botón de acción por item — no hay acciones secundarias visibles (editar, descargar)
- Sin búsqueda real ni filtros útiles
- Sin indicador de estado (generado, editado, descargado)
- No hay agrupación temporal (hoy, esta semana, este mes)

---

## 2. Métricas — Rediseño Completo

### 2.1 Nuevo layout de la página

```
┌─────────────────────────────────────────────────────────┐
│  Mis métricas          [I Trimestre ▼]  [Este mes ▼]   │
│  Resumen de tu actividad                                 │
├──────────┬──────────┬──────────┬──────────┐             │
│    6     │    1     │    0     │  Informe  │  ← cards   │
│ Reportes │  Cursos  │ Copiados │  Tutor/a  │            │
│generados │  activos │          │ más usado │            │
├──────────┴──────────┴──────────┴──────────┘             │
│  Actividad por tipo de reporte  [gráfico de barras]     │
│                                                          │
│  Últimos reportes generados     [Ver historial →]       │
│  ░░░░ planificacion — Primero A    1/6/26               │
│  ░░░░ semanal — 8vo A              1/6/26               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Cards de métricas — especificaciones

Cuatro cards en grid `2×2` en móvil, `4×1` en desktop. Cada card:

```jsx
// Estructura de cada MetricCard
{
  value: 6,                          // número grande, prominente
  label: "Reportes generados",       // etiqueta clara arriba o abajo
  sublabel: "2 en el último mes",    // contexto secundario
  icon: <IconFileText />,            // icono Tabler relacionado
  trend: null | 'up' | 'down',       // flecha de tendencia (opcional)
  color: 'blue' | 'amber' | 'gray'   // acento por tipo
  cta: {                             // acción derivada de la métrica
    label: "Generar nuevo",
    href: "/nuevo"
  }
}
```

Cards específicas:

| Card | Valor | Sublabel | Icono | CTA |
|---|---|---|---|---|
| Reportes generados | `count` | "X en el último mes" | `ti-file-text` | "Generar otro" |
| Cursos registrados | `count` | "X activo(s)" | `ti-school` | "Ver mis cursos" |
| Tipo más usado | `label` | "de X reportes totales" | `ti-star` | "Generar uno" |
| Tiempo ahorrado | `Xh` | "estimado vs manual" | `ti-clock` | null |

> **Nota sobre "Tiempo ahorrado":** reemplaza "Reportes copiados" (métrica poco útil). Calcular: `reportes_generados × 45 minutos` de estimado de ahorro. Esto motiva al docente y justifica el valor de la herramienta.

### 2.3 Gráfico de actividad por tipo

**Componente:** `MetricBarChart` — barras horizontales simples, una por tipo de reporte.

```
Informe Tutor/a     ████████████░░░░  4 reportes
Plan Contingencia   ██░░░░░░░░░░░░░░  1 reporte
Planif. Micro       █░░░░░░░░░░░░░░░  1 reporte
```

**Implementación:** SVG o div con `width` calculado en porcentaje. Sin librerías externas. Color de barra = `--jade-500` (#0e4da4). Barra vacía = `--bg-elevated`.

**Datos necesarios del backend:** `GET /api/metricas` (ya está en el plan de fallas — endpoint dedicado) debe devolver:

```json
{
  "total_reportes": 6,
  "reportes_mes": 2,
  "cursos_activos": 1,
  "tipo_mas_usado": "planificacion",
  "por_tipo": {
    "informe_tutor": 4,
    "contingencia": 1,
    "microcurricular": 1
  },
  "minutos_ahorrados": 270
}
```

### 2.4 Estado vacío — cuando no hay datos

Reemplazar `"Sin datos aún"` por un estado vacío orientativo:

```
┌─────────────────────────────────┐
│          📄                     │
│  Aún no has generado reportes   │
│                                 │
│  Cuando generes tu primer       │
│  documento, aquí verás un       │
│  resumen de tu actividad.       │
│                                 │
│  [Generar mi primer reporte →]  │
└─────────────────────────────────┘
```

### 2.5 Filtros de Métricas

Dos selectores en el header de la página:

- **Trimestre:** Todos / I Trimestre / II Trimestre / III Trimestre
- **Período:** Todo / Este mes / Últimos 3 meses / Este año

Al cambiar los filtros, las cards y el gráfico se actualizan con datos filtrados desde el endpoint.

---

## 3. Historial — Rediseño Completo

### 3.1 Problemas de UX que resolver primero

Antes del rediseño visual, hay problemas de datos que afectan directamente la legibilidad:

| Problema actual | Solución |
|---|---|
| Título: `"semanal — 8vo - A"` (técnico) | Mostrar: `"Reporte Semanal · 8vo A"` con el tipo en un badge |
| Metadata: `"7-23 · 1/6/26, 12:04 p. m."` | Mostrar: `"Semana 7–23 · hace 2 horas"` (fecha relativa) |
| Sin diferenciación visual por tipo | Badge de color por tipo + icono distinto |
| Un solo botón "Ver" | Acciones: Ver · Descargar · ... (menú) |
| Sin agrupación temporal | Agrupar por: Hoy / Esta semana / Este mes / Antes |

### 3.2 Nuevo layout del Historial

```
┌─────────────────────────────────────────────────────────┐
│  Historial de reportes                    [+ Nuevo]     │
│  6 documentos generados                                  │
│                                                          │
│  [🔍 Buscar por nombre o curso...      ]                │
│  [Todos los tipos ▼]  [I Trimestre ▼]  [Fecha ▼]       │
│                                                          │
│  Hoy                                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [TUTOR] 📋  Informe Tutor · Primero A           │   │
│  │             hace 2 horas · I Trimestre           │   │
│  │                          [Ver] [⬇] [···]        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Esta semana                                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [SEMANAL] 📄  Reporte Semanal · 8vo A           │   │
│  │               Semana 7–23 · 1 jun · I Trimestre  │   │
│  │                            [Ver] [⬇] [···]      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Componente `HistorialItem` — especificaciones

```jsx
// Cada item del historial muestra:
{
  badge: {
    label: "Tutor",           // versión corta del tipo
    color: "blue",            // azul=tutor, amber=semanal, teal=planificacion
  },
  titulo: "Informe Tutor/a",  // nombre legible del tipo (NO el id técnico)
  curso: "Primero A",         // nombre del curso
  metadata: [
    "Semana 7–23",            // si aplica al tipo
    "I Trimestre",
    "hace 2 horas"            // fecha relativa con `date-fns` o cálculo manual
  ],
  acciones: {
    primaria: "Ver",          // siempre visible, abre el reporte
    secundarias: [
      { label: "Descargar Word", icon: "ti-download" },
      { label: "Editar",         icon: "ti-edit" },
      { label: "Duplicar",       icon: "ti-copy" },
      { label: "Eliminar",       icon: "ti-trash", danger: true }
    ]
  }
}
```

### 3.4 Badges por tipo de documento

| Tipo (id interno) | Badge label | Color | Icono |
|---|---|---|---|
| `informe_tutor` | Tutor | Azul (`--jade-500`) | `ti-user` |
| `contingencia` | Contingencia | Ámbar (`--amber-500`) | `ti-alert-triangle` |
| `microcurricular` | Planificación | Verde azulado | `ti-calendar` |
| `calificaciones` | Notas | Gris | `ti-chart-bar` |
| `asistencia` | Asistencia | Gris | `ti-check` |

### 3.5 Búsqueda en Historial

**Comportamiento:** búsqueda en tiempo real (client-side sobre los datos ya cargados, sin llamada extra a API).

Busca en:
- Nombre del curso (`Primero A`, `8vo A`)
- Tipo de reporte (`planificacion`, `semanal`)
- Contenido del metadata visible

```jsx
// Lógica de filtrado (client-side, sin API)
const filtered = reportes.filter(r =>
  r.curso.toLowerCase().includes(query) ||
  r.tipo_label.toLowerCase().includes(query)
);
```

**Estado vacío de búsqueda:**
```
🔍  No encontramos reportes con "8vo B"
    Prueba buscando solo el nombre del curso
    o cambia los filtros de tipo.
```

### 3.6 Agrupación temporal

```js
// Función de agrupación para el render
function agrupar(reportes) {
  const hoy = [];
  const semana = [];
  const mes = [];
  const antes = [];

  reportes.forEach(r => {
    const diff = daysDiff(r.created_at, new Date());
    if (diff === 0) hoy.push(r);
    else if (diff <= 7) semana.push(r);
    else if (diff <= 30) mes.push(r);
    else antes.push(r);
  });

  return { hoy, semana, mes, antes };
}
```

Si un grupo está vacío, simplemente no renderizar esa sección.

### 3.7 Menú de acciones `···`

Reemplaza el botón "Ver" solitario por un esquema de acciones claras:

```
[Ver reporte]          ← botón primario siempre visible
[⬇ Descargar Word]    ← ícono de descarga siempre visible  
[···]                  ← menú desplegable con:
    ✏️ Editar
    📋 Duplicar
    🕐 Ver versiones anteriores   ← del plan de versionado
    ─────────────
    🗑️ Eliminar
```

El botón `[⬇]` dispara descarga directamente sin abrir el reporte. Es la acción más frecuente de los docentes.

### 3.8 Fecha relativa — sin librería externa

```js
// Calcular fecha relativa sin date-fns
function fechaRelativa(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000); // minutos
  if (diff < 1)   return "ahora mismo";
  if (diff < 60)  return `hace ${diff} minuto${diff > 1 ? 's' : ''}`;
  const h = Math.floor(diff / 60);
  if (h < 24)     return `hace ${h} hora${h > 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  if (d < 7)      return `hace ${d} día${d > 1 ? 's' : ''}`;
  // Si es más antiguo, mostrar fecha corta
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: 'numeric', month: 'short'
  });
}
```

---

## 4. Archivos a Crear / Modificar

### Nuevos componentes

```
src/components/
├── metrics/
│   ├── MetricsView.jsx          ← reemplaza el componente actual
│   ├── MetricCard.jsx           ← card individual de métrica
│   ├── MetricBarChart.jsx       ← gráfico de barras por tipo
│   ├── MetricRecentList.jsx     ← últimos 3 reportes con link
│   └── MetricEmpty.jsx          ← estado vacío orientativo
└── historial/
    ├── HistorialView.jsx         ← reemplaza el componente actual
    ├── HistorialItem.jsx         ← item individual rediseñado
    ├── HistorialFilters.jsx      ← barra de búsqueda + filtros
    ├── HistorialGroup.jsx        ← sección temporal (Hoy, Esta semana...)
    ├── HistorialEmpty.jsx        ← estado vacío con CTA
    └── HistorialActions.jsx      ← menú de acciones (Ver, Descargar, ···)
```

### Modificaciones en backend

```
api/
└── metricas.mjs    ← NUEVO: endpoint GET /api/metricas con datos agregados
                       (referencia: sección 2.3 de este documento)
```

---

## 5. Orden de Implementación

| Paso | Tarea | Prioridad |
|---|---|---|
| 1 | `GET /api/metricas` — endpoint con agregaciones SQL | P0 antes del resto |
| 2 | `MetricCard.jsx` — 4 cards con grid responsive | Inmediato |
| 3 | `MetricBarChart.jsx` — barras SVG simples | Inmediato |
| 4 | `MetricEmpty.jsx` — estado vacío con CTA | Inmediato |
| 5 | `MetricsView.jsx` — componer todo con filtros | Inmediato |
| 6 | `fechaRelativa()` utility — sin librería | Inmediato |
| 7 | `HistorialItem.jsx` — nuevo diseño con badges | Inmediato |
| 8 | `HistorialActions.jsx` — menú desplegable | Inmediato |
| 9 | `HistorialFilters.jsx` — búsqueda + filtros | Inmediato |
| 10 | `HistorialGroup.jsx` — agrupación temporal | Inmediato |
| 11 | `HistorialView.jsx` — componer todo | Inmediato |
| 12 | Actualizar labels de tipo en `HistorialItem` | Al final |
| 13 | QA con datos reales de los 10 docentes piloto | Post-deploy |

---

## 6. Criterios de Validación (QA)

**Métricas:**
- [ ] Las 4 cards muestran datos reales del endpoint `/api/metricas`
- [ ] El gráfico de barras refleja correctamente los totales por tipo
- [ ] El filtro de trimestre actualiza todas las métricas sin recargar la página
- [ ] El estado vacío aparece cuando `total_reportes === 0` y tiene botón funcional
- [ ] "Tiempo ahorrado" calcula correctamente: `reportes × 45 min` formateado en horas

**Historial:**
- [ ] Los badges de color son correctos para cada tipo de documento
- [ ] Las fechas se muestran en formato relativo ("hace 2 horas") para items recientes
- [ ] La búsqueda filtra en tiempo real sin llamada a API
- [ ] El botón `[⬇]` descarga el Word directamente sin abrir el reporte
- [ ] El menú `···` muestra: Editar, Duplicar, Ver versiones, Eliminar
- [ ] Eliminar pide confirmación antes de borrar
- [ ] Los grupos temporales (Hoy, Esta semana...) solo aparecen si tienen items
- [ ] En móvil, los botones de acción son lo suficientemente grandes para dedos (mín. 44px de alto)

