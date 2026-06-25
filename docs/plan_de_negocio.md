# Plan de Negocio — DocuIA
**Equipo:** Piñero · Heredia · Zumárraga · Iza  
**Institución:** Pontificia Universidad Católica del Ecuador (PUCE) — Emprendimiento Tecnológico 2026  
**Beneficiaria:** Unidad Educativa Fiscomisional Fe y Alegría "La Dolorosa", Quito, Ecuador  
**Fecha:** Junio 2026

---

## 1. Resumen Ejecutivo

**DocuIA** es una plataforma web de generación de informes educativos institucionales con Inteligencia Artificial, diseñada específicamente para docentes de Fe y Alegría Ecuador. Convierte los datos que el docente ingresa en un formulario estructurado en un informe completo, en español educativo ecuatoriano formal, en menos de 3 minutos.

**Problema:** Los docentes de Fe y Alegría invierten entre 1.5 y 3 horas por informe redactando manualmente documentos como planes de contingencia, informes de tutoría, planificaciones microcurriculares, reportes de calificaciones y registros de asistencia. Esta carga documental resta tiempo efectivo de enseñanza y genera estrés laboral sistemático.

**Solución:** DocuIA automatiza la redacción formal de informes institucionales mediante un modelo de lenguaje grande (LLaMA 3.3 70B vía Groq API), con un sistema de prompts especializado en el sistema educativo ecuatoriano (terminología DECE, códigos DCD, escala de calificación de 10 puntos, estructura quimestral) y soporte para los formatos institucionales propios de Fe y Alegría.

**Impacto proyectado a 6 meses:**
- 40 docentes activos en la plataforma
- 160 informes generados por mes (4 por docente)
- 240 horas mensuales ahorradas al colectivo docente
- 5 tipos de informe cubiertos en formato oficial

**Modelo de viabilidad:** Herramienta gratuita para la institución, sostenida en capas de servicio gratuitas (Vercel, Supabase, Groq), con costo operativo de $25/mes y una inversión inicial de $1,200. VAN positivo de **$1,518.60** a 6 meses (ver Sección 7 y `docs/analisis_financiero.md`).

---

## 2. Descripción del Proyecto

### 2.1 Contexto institucional

La Red Fe y Alegría Ecuador opera varias Unidades Educativas Fiscomisionales en el país, siendo "La Dolorosa" en Quito la institución beneficiaria directa de este proyecto. Estas instituciones atienden a poblaciones en situación de vulnerabilidad socioeconómica y cuentan con docentes comprometidos que enfrentan una alta carga administrativa documental, exigida tanto por el Ministerio de Educación del Ecuador como por los protocolos internos de la red Fe y Alegría.

### 2.2 Problema identificado

En las visitas y entrevistas realizadas con docentes de la institución se identificaron los siguientes puntos de dolor:

- **Tiempo:** Un informe docente trimestral requiere entre 2 y 3 horas de redacción manual.
- **Consistencia:** La terminología y estructura varían entre docentes, generando heterogeneidad en la calidad de los documentos.
- **Herramientas inadecuadas:** Las alternativas existentes (ChatGPT genérico, Word desde cero) no conocen el sistema educativo ecuatoriano ni los formatos de Fe y Alegría.
- **Errores de datos:** El proceso manual incrementa el riesgo de transcribir mal calificaciones, nombres o fechas.
- **Carga emocional:** La combinación de enseñanza + trabajo administrativo genera fatiga y reduce la calidad pedagógica.

### 2.3 Solución: DocuIA

DocuIA es una aplicación web (SPA - Single Page Application) que:

1. Permite al docente registrar sus cursos una sola vez (grado, paralelo, asignatura, número de estudiantes).
2. Presenta un formulario adaptativo según el tipo de informe deseado, con solo los campos relevantes.
3. Envía los datos al servidor, donde un sistema de prompts especializado genera el informe con el modelo LLaMA 3.3 70B.
4. Entrega el informe en tiempo real (streaming) directamente en pantalla, editable por el docente.
5. Permite descargarlo en formato Word (.docx), PDF o CSV para su presentación institucional.

### 2.4 Funcionalidades principales

| Funcionalidad | Descripción |
| --- | --- |
| **5 tipos de informe** | Plan de Contingencia, Reporte de Calificaciones, Registro de Asistencia, Informe Docente Tutor/a, Planificación Microcurricular |
| **Gestión de cursos** | CRUD completo; auto-relleno de campos del formulario al seleccionar un curso |
| **Historial paginado** | Todos los informes generados, archivables y reeditables |
| **Plantillas** | Guardar combinaciones de campos reutilizables para ahorrar tiempo futuro |
| **Formatos institucionales** | Upload de PDFs/Excel propios de Fe y Alegría; la IA replica su estructura exacta |
| **Asistente Lucía** | Chatbot con FAQ de 28 preguntas + chat libre con IA para soporte |
| **Dashboard de métricas** | Reportes generados, tipos más usados, docentes activos |
| **Dark mode** | Modo oscuro configurable, persistente entre sesiones |
| **Onboarding** | Tutorial de 3 pasos para nuevos usuarios |
| **Exportación** | Word (.docx), PDF, CSV |

---

## 3. Estudio de Mercado

### 3.1 Segmento objetivo

**Primario:** Docentes de la Unidad Educativa Fiscomisional Fe y Alegría "La Dolorosa", Quito. Perfil:
- Edad: 25–55 años
- Nivel tecnológico: Básico-intermedio
- Necesidad: Reducir carga documental sin sacrificar calidad formal
- Disponibilidad a pagar: $0 (institución pública-privada sin ánimo de lucro)

**Secundario:** Docentes de otras unidades educativas de la red Fe y Alegría Ecuador (Guayaquil, Machala, Esmeraldas) y del sistema educativo nacional.

### 3.2 Tamaño de mercado

| Segmento | Estimado de docentes | Potencial de adopción |
| --- | --- | --- |
| Fe y Alegría "La Dolorosa" (beneficiaria directa) | ~80 docentes | 50% (40 activos en 6 meses) |
| Red Fe y Alegría Ecuador completa | ~500 docentes | 20% (100 activos en 12 meses) |
| Sector público Ecuador (Zona 9 - Quito) | ~15,000 docentes | 2% (300 activos, escenario expansión) |

### 3.3 Análisis competitivo

| Competidor | Fortalezas | Debilidades vs. DocuIA |
| --- | --- | --- |
| **ChatGPT (GPT-4o)** | Modelo potente, muy conocido | No conoce formatos Fe y Alegría; prompts genéricos; puede inventar datos; requiere habilidad de prompteo; sin historial estructurado |
| **Google Gemini** | Gratuito, integrado con Docs | Sin especialización educativa ecuatoriana; sin formatos institucionales; sin gestión de cursos |
| **Word manual** | Sin costo tecnológico | 2-3 horas por informe; errores de transcripción; sin consistencia |
| **Herramientas edtech genéricas** | Interfaz amigable | Ninguna conoce los protocolos DECE/DCD ni la escala 10 pts de Ecuador |

**Ventaja diferencial de DocuIA:**
- Sistema prompt 100% server-side con conocimiento del currículo ecuatoriano
- Anti-alucinación: la IA no inventa nombres, calificaciones ni fechas
- Soporte de formatos institucionales propios (PDF/Excel de Fe y Alegría)
- Regeneración parcial de secciones (sin rehacer todo el informe)
- Gestión de cursos persistente con auto-relleno

### 3.4 Validación inicial

Se realizaron entrevistas y una sesión de validación con docentes de Fe y Alegría que evaluaron prototipos funcionales del sistema. Los resultados de la ficha de validación (RDA3) mostraron aceptación positiva del flujo principal y retroalimentación incorporada para mejorar la especificidad de los campos del formulario (ver archivo de validación adjunto en la entrega).

---

## 4. Propuesta de Valor

### 4.1 Declaración de valor

> **"De datos a informe institucional completo en menos de 3 minutos, con el lenguaje formal de Fe y Alegría."**

DocuIA elimina la redacción manual de informes educativos. El docente aporta los datos (números, nombres, observaciones); DocuIA aporta la estructura, el lenguaje formal y la consistencia institucional.

### 4.2 Beneficios cuantificables

| Métrica | Antes (manual) | Con DocuIA | Ahorro |
| --- | --- | --- | --- |
| Tiempo por informe | 2.5 horas | 15 minutos | **1.75 horas/informe** |
| Horas/mes por docente (4 informes) | 10 horas | 1 hora | **9 horas/mes** |
| Errores de transcripción | Frecuentes | Mínimos (datos del formulario copiados literalmente) | — |
| Consistencia de formato | Variable | 100% consistente | — |
| Disponibilidad | Horario de oficina | 24/7 desde cualquier dispositivo | — |

### 4.3 Diferenciales técnicos

1. **Prompt server-side seguro** — el docente no puede modificar las instrucciones del sistema; los datos del formulario son sanitizados antes de enviarse al modelo
2. **Terminología ecuatoriana nativa** — DCD (Destrezas con Criterios de Desempeño), DECE (Departamento de Consejería Estudiantil), quimestre, jornada matutina/vespertina, escala 1-10
3. **Anti-alucinación** — el modelo tiene instrucción explícita de no inventar ningún dato que no esté en el formulario
4. **Formatos institucionales** — el docente puede subir el formato PDF/Excel oficial de su institución; la IA lo replica en estructura y lenguaje
5. **Streaming en tiempo real** — el informe aparece carácter a carácter en pantalla (tecnología SSE), reduciendo la percepción de espera
6. **Fallback automático** — si el modelo principal tiene timeout, cambia automáticamente al modelo de respaldo sin interrumpir al usuario
7. **Regeneración parcial** — se puede reescribir solo una sección del informe sin perder el resto
8. **Feedback integrado** — botones 👍/👎 con nota opcional para mejorar la calidad del sistema con el tiempo
9. **Exportación nativa Word** — los informes se descargan como `.docx` editables, no como texto plano
10. **Zero-cost para la institución** — toda la infraestructura opera en capas gratuitas

---

## 5. Modelo de Negocio

### 5.1 Canvas simplificado

| Bloque | Descripción |
| --- | --- |
| **Segmento de clientes** | Docentes de Fe y Alegría Ecuador (primario) · Red Fe y Alegría nacional (secundario) |
| **Propuesta de valor** | Ahorro de tiempo docente · Consistencia institucional · IA con conocimiento educativo ecuatoriano |
| **Canales** | Plataforma web (docuia.vercel.app) · Capacitación presencial en la institución |
| **Relación con clientes** | Autoservicio + Asistente Lucía (chatbot) + soporte por correo del equipo |
| **Fuentes de ingresos** | **Actual:** Herramienta gratuita — valor como impacto social y proyecto académico PUCE |
| | **Futuro (12-24 meses):** Freemium con límite de 10 informes/mes gratis · Suscripción institucional $29/mes para instituciones fuera de Fe y Alegría |
| **Recursos clave** | Código fuente (MIT) · Cuenta Groq API · Cuenta Supabase · Dominio · Know-how del equipo |
| **Actividades clave** | Mantenimiento y actualización del sistema · Soporte a docentes · Capacitación · Monitoreo de errores |
| **Socios clave** | PUCE (apoyo académico) · Fe y Alegría Ecuador (institución beneficiaria) · Groq (IA gratuita) · Vercel (hosting gratuito) |
| **Estructura de costos** | $25/mes operativos + soporte del equipo (tiempo voluntario post-graduación) |

### 5.2 Flujo de valor (no monetario)

El modelo actual es de **impacto social sin ánimo de lucro**:
- Fe y Alegría recibe una herramienta gratuita de alto valor práctico
- El equipo PUCE cumple su proyecto de Aprendizaje-Servicio
- El código queda bajo licencia MIT para que la comunidad educativa lo mejore
- El valor generado se mide en horas docentes liberadas, no en dinero

### 5.3 Escalabilidad futura

Si la institución o la red Fe y Alegría decide escalar el proyecto más allá de la entrega académica:
- Ruta 1: Institución designa un docente-técnico responsable del mantenimiento (capacitación de 4 horas con el manual técnico)
- Ruta 2: PUCE asigna un equipo de continuación en el siguiente ciclo de Emprendimiento Tecnológico
- Ruta 3: Se lanza como SaaS con capa freemium para instituciones educativas del Ecuador

---

## 6. Plan Técnico

### 6.1 Arquitectura del sistema

El sistema sigue una arquitectura de tres capas:

```
[Navegador del docente]
        ↕ HTTPS / JWT
[Vercel Serverless Functions — 11 endpoints API]
        ↕ PostgreSQL / REST         ↕ API Key
[Supabase — BD + Auth]          [Groq API — IA]
```

Diagrama completo con todos los componentes: ver `docs/arquitectura.md`.

### 6.2 Stack tecnológico justificado

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| Frontend | React 18 + Vite 5 | Componentes reutilizables, build optimizado, hot-reload en desarrollo |
| Backend | Vercel Serverless | Escala a cero, free tier, deploy automático desde GitHub |
| Base de datos | Supabase (PostgreSQL) | Auth incluida, RLS nativo, SDK JS, free tier 500 MB |
| IA | Groq API (LLaMA 3.3 70B) | Inferencia ~10× más rápida que OpenAI; free tier generoso |
| Hosting | Vercel Hobby | CDN global, HTTPS automático, free tier |
| Exports | docx + docxtemplater | Genera Word nativo editable, no solo texto |

### 6.3 Fases de desarrollo completadas

| Fase | Descripción | Estado |
| --- | --- | --- |
| **Fase 1** | MVP: formulario + generación básica + login | ✅ Completada |
| **Fase 2** | Gestión de cursos + historial + plantillas | ✅ Completada |
| **Fase 3** | Formatos institucionales (upload PDF/Excel) | ✅ Completada |
| **Fase 4** | Asistente Lucía + onboarding + dark mode | ✅ Completada |
| **Fase 5** | Seguridad (CSP, RLS hardening, rate limit, sanitización) | ✅ Completada |
| **Fase 6** | Métricas AARRR + dashboard | ✅ Completada |

### 6.4 Seguridad implementada

- Autenticación con JWT + refresh token rotativo (Supabase Auth)
- Row Level Security (RLS) en todas las tablas: cada usuario solo accede a sus propios datos
- Content Security Policy (CSP) + X-Frame-Options + HSTS
- Rate limiting: 45 generaciones/usuario/hora (persistente en Supabase) + 120/IP/hora
- Sanitización de prompts server-side (elimina inyecciones tipo `System:`, `[INST]`, `Ignore previous`)
- Variables de entorno jamás expuestas al cliente ni al repositorio

### 6.5 Roadmap post-entrega

| Prioridad | Mejora | Estimado |
| --- | --- | --- |
| Alta | Historial de versiones de un informe (tabla `reporte_versiones`) | 8 horas |
| Alta | Paginación en cursos y plantillas | 4 horas |
| Media | Migrar rate limiting in-memory a Supabase completo (serverless-safe) | 6 horas |
| Media | Tests automatizados con Vitest + Playwright | 16 horas |
| Baja | Soporte multi-institución (tabla `instituciones`) | 20 horas |

---

## 7. Plan Financiero

### 7.1 Inversión inicial

| Concepto | Monto |
| --- | --- |
| Equipos de cómputo dedicados al proyecto (costo oportunidad) | $800 |
| Cursos y capacitación en tecnologías del stack | $150 |
| Servicios temporales durante el desarrollo (dominios de prueba, APIs de pago temporal) | $250 |
| **Total inversión inicial (Mes 0)** | **$1,200** |

### 7.2 Costos operacionales mensuales

| Concepto | Costo/mes |
| --- | --- |
| Dominio `.app` o `.ec` (prorrateado) | $1.50 |
| Contingencia servicios premium si se supera free tier | $13.00 |
| Mantenimiento técnico (tiempo del equipo valorado mínimamente) | $10.50 |
| **Total costos mensuales** | **$25.00** |

### 7.3 Valor generado mensual

El valor se mide en **ahorro de tiempo docente**, monetizado al costo de oportunidad de un docente en Ecuador (~$3.50/hora, basado en salario mínimo sectorial 2026 de $470/mes ÷ 134 horas efectivas).

- Cada docente genera 4 informes/mes
- Cada informe ahorra 1.5 horas
- Valor por docente: 4 × 1.5 × $3.50 = **$21/mes por docente**

### 7.4 Flujo de caja proyectado (6 meses)

| Mes | Docentes activos | Informes/mes | Valor generado | Costos operativos | **Flujo neto** | **Flujo acumulado** |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (inversión) | — | — | — | $1,200 | **-$1,200** | -$1,200 |
| 1 | 8 | 32 | $168 | $25 | **$143** | -$1,057 |
| 2 | 14 | 56 | $294 | $25 | **$269** | -$788 |
| 3 | 20 | 80 | $420 | $25 | **$395** | -$393 |
| 4 | 27 | 108 | $567 | $25 | **$542** | +$149 |
| 5 | 33 | 132 | $693 | $25 | **$668** | +$817 |
| 6 | 40 | 160 | $840 | $25 | **$815** | +$1,632 |

**Payback:** La inversión inicial se recupera entre el Mes 3 y el Mes 4 (flujo acumulado pasa de -$393 a +$149).

### 7.5 Indicadores de rentabilidad

Para el análisis financiero completo con cálculo paso a paso de VAN y TIR, ver `docs/analisis_financiero.md`.

| Indicador | Valor | Interpretación |
| --- | --- | --- |
| **VAN** (tasa 12% anual) | **$1,518.60** | Positivo → el proyecto genera valor |
| **TIR mensual** | **~23.5%** | > tasa de descuento (0.95%/mes) → ACEPTAR |
| **Payback** | **Mes 4** | Recuperación de inversión en 4 meses |
| **Costo total 6 meses** | $1,350 | Inversión + 6 meses de operación |
| **Valor total 6 meses** | $2,982 | Suma de valor generado en 6 meses |

---

## 8. Sostenibilidad

### 8.1 Sostenibilidad tecnológica (≥ 6 meses sin costos significativos)

El proyecto opera 100% en capas gratuitas de servicios cloud:

| Servicio | Plan gratuito | Límite | Suficiencia para 40 docentes |
| --- | --- | --- | --- |
| **Vercel Hobby** | 100 GB bandwidth/mes · Functions ilimitadas | 100 req/s · 10 s timeout | ✅ Holgado |
| **Supabase Free** | 500 MB DB · 2 GB storage · Auth incluida | 500 MB | ✅ Texto de informes pesa poco |
| **Groq API Free** | ~14,400 req/día (rate limit por minuto) | RPM variable | ✅ 160 informes/mes << límite |
| **Google Fonts** | CDN global ilimitado | — | ✅ Sin restricción |

**Plan B si un servicio supera el free tier:**
- **Groq → Gemini 2.0 Flash:** cambio de 3 líneas en `api/generate.mjs` + nueva API key
- **Vercel → Cloudflare Pages:** el build Vite es HTML/CSS/JS estático, migrable en 1 hora
- **Supabase → Neon PostgreSQL:** misma API Supabase, migración del schema con `database/schema.sql`

### 8.2 Sostenibilidad operativa (post-graduación del equipo)

La transferencia del proyecto a Fe y Alegría está garantizada por:

1. **Licencia MIT** en la raíz del repositorio: cualquier institución puede usar, modificar y redistribuir el código sin restricciones.
2. **Documentación completa** para mantenimiento independiente:
   - `README.md`: instalación, variables de entorno, despliegue
   - `MANUAL_TECNICO.md`: arquitectura detallada, APIs, seguridad
   - `MANUAL_USUARIO.md`: guía para docentes no técnicos
   - `docs/arquitectura.md`: diagrama de componentes
   - `docs/diccionario_datos.md`: descripción de cada tabla y campo
   - `database/schema.sql`: schema completo de la base de datos
3. **Repositorio en cuenta genérica** de la organización (no cuentas personales): Fe y Alegría puede agregar colaboradores sin depender del equipo original.
4. **Capacitación entregada** a los docentes y al responsable técnico designado por la institución.

### 8.3 Sostenibilidad del impacto social

- El problema de carga documental es **estructural**, no coyuntural: la institución seguirá necesitando informes mientras exista el MINEDUC.
- La plataforma es **agnóstica al año lectivo**: el catálogo de tipos de informe cubre las necesidades del currículo ecuatoriano actual y puede extenderse.
- El modelo de licencia MIT permite que **otras instituciones** adopten DocuIA sin necesidad de contratar al equipo original, multiplicando el impacto.

### 8.4 Declaración de autoría y transparencia

El código fuente de DocuIA es creación original del equipo (componentes React, API serverless, schema de BD, sistema de prompts). Se usaron las siguientes categorías de herramientas de terceros:
- **Librerías open source:** listadas con licencias en el `README.md` (sección "Librerías de terceros y licencias")
- **Herramientas de IA para desarrollo:** Claude (Anthropic) como asistente de código — las decisiones de diseño, arquitectura, prompts del sistema y validación con usuarios son propias del equipo
- **Servicios cloud:** Supabase, Groq, Vercel — utilizados bajo sus respectivos términos de servicio gratuitos

Cada integrante del equipo firmó la Declaración de Autoría, Software Libre y Autorización (Asignación T7B).
