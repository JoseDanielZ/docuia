# DocuIA — Propuesta 2 "Cielo" · Especificación de diseño (handoff)

Plataforma de generación de documentos institucionales con IA para docentes de
**Fe y Alegría Ecuador**. Esta es la guía de estilos de la propuesta **Cielo**
(azul cielo amigable + dorado suave) para reconstruir la interfaz en código.

Principios: calma visual, jerarquía clara, **un solo CTA primario por pantalla**,
pasos 1·2·3 siempre visibles, tipografía nunca agresiva (títulos ≤ 32px, cuerpo 16px),
espaciado generoso, sin animaciones llamativas. Modo claro preferido, con opción oscuro.

---

## 1. Tipografía

| Rol | Familia | Peso | Tamaño | Interlineado | Tracking |
|---|---|---|---|---|---|
| Título de página / hero | Source Serif 4 | 600 | **31px** (máx 32) | 1.2 | -0.01em |
| Título de tarjeta / formulario | Source Serif 4 | 600 | 18–20px | 1.25 | — |
| Subtítulo / intro | Source Sans 3 | 400 | **16px** | 1.6 | — |
| Cuerpo / descripción | Source Sans 3 | 400 | 14px | 1.5 | — |
| Caption / ayuda | Source Sans 3 | 400/500 | 12.5–13px | 1.5 | — |
| Eyebrow / label / sección | Source Sans 3 | 700 | 11.5–12.5px | — | 0.06–0.07em · UPPERCASE |
| Nav links | Source Sans 3 | 500/600 | 14px | — | — |
| Botón primario | Source Sans 3 | 600 | 16px | — | — |
| Botón secundario | Source Sans 3 | 600 | 13.5px | — | — |
| Wordmark "DocuIA" | Source Sans 3 | 700 | 20px | — | -0.02em |

**Import (Google Fonts):**
```
https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Source+Sans+3:wght@400;500;600;700&display=swap
```

---

## 2. Color — Modo claro

| Token | Hex | Uso |
|---|---|---|
| bg-0 | `#EBF3FB` | Fondo base de la app |
| bg-1 | `#F6FBFE` | Navbar y hero (zonas elevadas) |
| surface | `#FFFFFF` | Tarjetas, formulario |
| surface-alt | `#EEF6FC` | Inputs / campos |
| border | `#D4E5F2` | Bordes y hairlines |
| text-strong | `#1B3A52` | Títulos |
| text-body | `#3D5B73` | Cuerpo |
| text-muted | `#7B94A9` | Captions / placeholders |
| **accent** | `#2F86C9` | CTA primario, iconos, links |
| accent-text | `#FFFFFF` | Texto sobre acento |
| accent-soft | `#DCECF9` | Fondo tenue del acento (badge, chip de icono) |
| **gold** | `#E0A94B` | Pasos (1·2·3), etiqueta "Más usado" |
| gold-text | `#3A2906` | Texto sobre dorado |
| gold-soft | `#F7EBD0` | Fondo tenue del dorado |

## 3. Color — Modo oscuro

| Token | Hex |
|---|---|
| bg-0 | `#0E2740` |
| bg-1 | `#143452` |
| surface | `#1B4060` |
| surface-alt | `#143452` |
| border | `#2C557C` |
| text-strong | `#EAF3FB` |
| text-body | `#BAD2E7` |
| text-muted | `#7FA1BD` |
| accent | `#5AA9E6` |
| accent-text | `#06233B` |
| accent-soft | `#1F476C` |
| gold | `#E8B863` |
| gold-text | `#241A06` |
| gold-soft | `#3A3017` |

> Implementación sugerida: variables CSS en `:root` (claro) y `[data-theme="dark"]`
> (ver `tokens.css`). Alternar con un atributo `data-theme` en `<html>`.

---

## 4. Radios, sombras y espaciado

- **Radios:** ventana de pantalla `20px` · tarjeta `16px` · chip de icono `13px` ·
  botón primario `12px` · input y botón secundario `10px` · pill `999px`.
- **Sombras:** ventana `0 22px 60px rgba(18,22,30,.16)` · botón primario `0 10px 24px rgba(20,40,70,.20)`.
- **Espaciado:** navbar `16px 26px` · hero `48px 40px 38px` · gap entre pasos `14px` ·
  grid de tarjetas `gap 16px`, padding tarjeta `22px` · formulario `padding 30px 32px`,
  gap de campos `18px`.
- **Iconos:** estilo lineal (stroke 1.8, `currentColor`), tamaño 22px en tarjetas.
  Documentos → FileText, escudo (ShieldCheck), grilla (LayoutGrid). Pasos = números.

---

## 5. Componentes

### Navbar (fondo `bg-1`, borde inferior `border`)
- Izquierda: wordmark **Docu**`IA` ("IA" en `accent`) + links: Mis cursos · Plantillas · Historial · Métricas (`text-muted`, activo en `text-body`).
- Derecha: botón **secundario** "Generar reporte" — texto `accent`, fondo transparente, borde `border`, radio 10px. *(Secundario para no competir con el CTA del hero.)*

### Hero (centrado, fondo `bg-1`)
1. Eyebrow pill: "PLATAFORMA CON IA PARA DOCENTES" (texto `accent`, fondo `accent-soft`, borde `border`, ícono sparkle).
2. Título serif 31px: "Documentos institucionales, listos en minutos." (`text-strong`, max-width ~17ch).
3. Subtítulo 16px (`text-body`, max-width ~48ch).
4. **CTA primario** "Generar mi primer reporte" → fondo `accent`, texto `accent-text`, radio 12px, sombra `shadow-btn`, flecha a la derecha.
5. Pie: "Sin registro · Descarga en Word, PDF o Excel" (`text-muted`).

### Pasos 1·2·3 (fila de 3, fondo `bg-0`)
Cada paso: tarjeta `surface` + borde `border`, círculo numerado con fondo **`gold`** y texto `gold-text`, título 14px + ayuda 12.5px (`text-muted`).
1. Elige el documento — Tres plantillas listas
2. Completa los datos — Solo lo esencial
3. Descarga y entrega — Word, PDF o Excel

### Tarjetas de documento (grid de 3, fondo `bg-0`)
Cada tarjeta `surface` + borde `border`, radio 16px, padding 22px:
- Chip de icono 46px (color `accent`, fondo `accent-soft`).
- Título serif 18px + descripción 14px.
- Pie: "Usar plantilla →" (`accent`) + etiqueta de formato (Word/PDF/Excel) en borde.
- La 1.ª tarjeta lleva badge **"Más usado"** (fondo `gold`, texto `gold-text`).

Documentos: **Informe Docente Tutor/a** (Word) · **Plan de Contingencia** (PDF) · **Planificación Microcurricular** (Excel).

### Formulario (tarjeta `surface`, radio 18px, padding 30/32)
- Cabecera: chip de icono + título serif "Informe Docente Tutor/a" + "Paso 2 de 3 · Completa los datos". Progreso de 3 barras (2 en `gold`, 1 en `border`).
- Campos en grid 2 columnas: Nombre del docente (texto) · Trimestre (select) · Grado/curso (select) · N.º de estudiantes (texto). Inputs con fondo `surface-alt`, borde `border`, radio 10px, label 13px `text-body`.
- Textarea "Observaciones generales" (full width).
- CTA primario "Generar documento" (icono descarga) + nota de ayuda a la izquierda.

---

## 6. Notas de accesibilidad
- Targets táctiles ≥ 44px en móvil. Inputs con altura cómoda (~46px).
- Contrastes verificados: `text-strong`/`bg-1` y `accent-text`/`accent` cumplen AA.
- Sin animaciones agresivas: usar transiciones suaves (≤ 150ms) solo en hover/focus.


/* ============================================================
   DocuIA — Propuesta 2 "Cielo"
   Design tokens (CSS custom properties)
   Paleta: azul cielo amigable + dorado suave
   ============================================================ */

/* --- Fuentes (Google Fonts) ---
   Añade en <head>:
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
*/

:root {
  /* Tipografía */
  --font-serif: 'Source Serif 4', Georgia, 'Times New Roman', serif;  /* títulos */
  --font-sans:  'Source Sans 3', system-ui, -apple-system, sans-serif; /* cuerpo / UI */

  /* ---------- MODO CLARO (por defecto) ---------- */
  --bg-0:          #EBF3FB; /* fondo base de la app */
  --bg-1:          #F6FBFE; /* zonas elevadas: navbar, hero */
  --surface:       #FFFFFF; /* tarjetas, formularios */
  --surface-alt:   #EEF6FC; /* inputs, campos */
  --border:        #D4E5F2; /* hairlines / bordes */

  --text-strong:   #1B3A52; /* títulos */
  --text-body:     #3D5B73; /* cuerpo */
  --text-muted:    #7B94A9; /* captions, placeholders */

  --accent:        #2F86C9; /* acento principal (CTA, iconos, links) */
  --accent-text:   #FFFFFF; /* texto sobre acento */
  --accent-soft:   #DCECF9; /* fondo tenue del acento (badges, chips de icono) */

  --gold:          #E0A94B; /* acento secundario: pasos, "Más usado" */
  --gold-text:     #3A2906; /* texto sobre dorado */
  --gold-soft:     #F7EBD0; /* fondo tenue del dorado */

  /* Radios */
  --radius-window: 20px; /* contenedor de pantalla */
  --radius-card:   16px; /* tarjetas */
  --radius-field:  10px; /* inputs / botón secundario */
  --radius-btn:    12px; /* botón primario */
  --radius-icon:   13px; /* chip de icono */
  --radius-pill:   999px;

  /* Sombras */
  --shadow-window: 0 22px 60px rgba(18, 22, 30, 0.16);
  --shadow-btn:    0 10px 24px rgba(20, 40, 70, 0.20);

  /* Espaciado base (referencia) */
  --space-1: 6px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 22px; --space-6: 26px; --space-7: 32px; --space-8: 40px;
}

/* ---------- MODO OSCURO ---------- */
[data-theme="dark"] {
  --bg-0:          #0E2740;
  --bg-1:          #143452;
  --surface:       #1B4060;
  --surface-alt:   #143452;
  --border:        #2C557C;

  --text-strong:   #EAF3FB;
  --text-body:     #BAD2E7;
  --text-muted:    #7FA1BD;

  --accent:        #5AA9E6;
  --accent-text:   #06233B;
  --accent-soft:   #1F476C;

  --gold:          #E8B863;
  --gold-text:     #241A06;
  --gold-soft:     #3A3017;
}

