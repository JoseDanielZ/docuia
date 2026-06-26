# Plan de Negocio — DocuIA
**Plataforma de generación de informes educativos con Inteligencia Artificial**

---

**Equipo:** Piñero · Heredia · Zumárraga · Iza
**Institución:** Pontificia Universidad Católica del Ecuador (PUCE) — Emprendimiento Tecnológico 2026
**Beneficiaria:** Unidad Educativa Fiscomisional Fe y Alegría "La Dolorosa", Quito, Ecuador
**Fecha:** Junio 2026
**Repositorio:** https://github.com/docuia2026/docuia
**Correo genérico del proyecto:** feyalegriadocuia2026@zohomail.com

---

## 1. Resumen Ejecutivo

**DocuIA** es una plataforma web de generación de informes educativos institucionales con Inteligencia Artificial, diseñada específicamente para docentes de Fe y Alegría Ecuador. Convierte los datos ingresados por el docente en un formulario estructurado en un informe completo, redactado en español educativo ecuatoriano formal, en menos de 3 minutos.

### El Problema

Los docentes de Fe y Alegría invierten entre 1.5 y 3 horas por informe redactando manualmente documentos como planes de contingencia, informes de tutoría, planificaciones microcurriculares, reportes de calificaciones y registros de asistencia. Esta carga documental resta tiempo efectivo de enseñanza y genera estrés laboral sistemático.

### La Solución

DocuIA automatiza la redacción formal de informes institucionales mediante un modelo de lenguaje grande (LLaMA 3.3 70B vía Groq API), con un sistema de prompts especializado en el sistema educativo ecuatoriano (terminología DECE, códigos DCD, escala de calificación de 10 puntos, estructura quimestral) y soporte para los formatos institucionales propios de Fe y Alegría.

### Impacto Proyectado a 6 Meses

- 40 docentes activos en la plataforma
- 160 informes generados por mes (4 por docente)
- 240 horas mensuales ahorradas al colectivo docente
- 5 tipos de informe cubiertos en formato oficial

### Modelo de Viabilidad

Herramienta **gratuita para la institución**, sostenida en capas de servicio gratuitas (Vercel, Supabase, Groq), con costo operativo de **$25/mes** y una inversión inicial de **$1,200**. VAN positivo de **$1,518.60** a 6 meses.

---

## 2. Descripción del Proyecto

### 2.1 Contexto Institucional

La Red Fe y Alegría Ecuador opera varias Unidades Educativas Fiscomisionales en el país, siendo "La Dolorosa" en Quito la institución beneficiaria directa de este proyecto. Estas instituciones atienden a poblaciones en situación de vulnerabilidad socioeconómica y cuentan con docentes comprometidos que enfrentan una alta carga administrativa documental, exigida tanto por el Ministerio de Educación del Ecuador como por los protocolos internos de la red Fe y Alegría.

### 2.2 Problema Identificado

En las visitas y entrevistas realizadas con docentes de la institución se identificaron los siguientes puntos de dolor:

- **Tiempo excesivo:** Un informe docente trimestral requiere entre 2 y 3 horas de redacción manual.
- **Inconsistencia:** La terminología y estructura varían entre docentes, generando heterogeneidad en la calidad de los documentos.
- **Herramientas inadecuadas:** Las alternativas existentes (ChatGPT genérico, Word desde cero) no conocen el sistema educativo ecuatoriano ni los formatos de Fe y Alegría.
- **Errores de datos:** El proceso manual incrementa el riesgo de transcribir mal calificaciones, nombres o fechas.
- **Carga emocional:** La combinación de enseñanza y trabajo administrativo genera fatiga y reduce la calidad pedagógica.

### 2.3 Solución: DocuIA

DocuIA es una aplicación web (SPA — Single Page Application) que:

1. Permite al docente registrar sus cursos una sola vez (grado, paralelo, asignatura, número de estudiantes).
2. Presenta un formulario adaptativo según el tipo de informe deseado, con solo los campos relevantes.
3. Envía los datos al servidor, donde un sistema de prompts especializado genera el informe con el modelo LLaMA 3.3 70B.
4. Entrega el informe en tiempo real (streaming) directamente en pantalla, editable por el docente.
5. Permite descargarlo en formato Word (.docx), PDF o CSV para su presentación institucional.

### 2.4 Funcionalidades Principales

| Funcionalidad | Descripción |
|---|---|
| **5 tipos de informe** | Plan de Contingencia, Reporte de Calificaciones, Registro de Asistencia, Informe Docente Tutor/a, Planificación Microcurricular |
| **Gestión de cursos** | CRUD completo; auto-relleno de campos del formulario al seleccionar un curso |
| **Historial paginado** | Todos los informes generados, archivables y reeditables (20 por página) |
| **Plantillas** | Guardar combinaciones de campos reutilizables para ahorrar tiempo futuro |
| **Formatos institucionales** | Carga de PDFs/Excel propios de Fe y Alegría; la IA replica su estructura exacta |
| **Asistente Lucía** | Chatbot con FAQ de 28 preguntas en 7 categorías + chat libre con IA para soporte |
| **Dashboard de métricas** | Reportes generados, tipos más usados, docentes activos |
| **Dark mode** | Modo oscuro configurable, detectado automáticamente según preferencias del sistema |
| **Onboarding** | Tutorial de 3 pasos para nuevos usuarios (se muestra una sola vez) |
| **Exportación** | Word (.docx), PDF, CSV |
| **Regeneración parcial** | Reescribir solo una sección del informe sin perder el resto |
| **Auto-borrador** | Guarda automáticamente el estado del formulario cada 800 ms |

### 2.5 Flujo de Usuario Principal

1. El docente accede a **docuia.vercel.app** e inicia sesión con su correo institucional.
2. Selecciona o crea un curso desde el panel de gestión.
3. Elige el tipo de informe que necesita generar.
4. Completa el formulario con los datos específicos (calificaciones, observaciones, fechas).
5. Hace clic en "Generar Informe" — el informe aparece en pantalla en tiempo real (streaming).
6. Edita el informe si lo requiere, sección por sección.
7. Descarga el documento en Word (.docx) listo para presentar.

---

## 3. Estudio de Mercado

### 3.1 Segmento Objetivo

**Segmento primario:** Docentes de la Unidad Educativa Fiscomisional Fe y Alegría "La Dolorosa", Quito.

- Edad promedio: 25–55 años
- Nivel tecnológico: Básico-intermedio
- Necesidad: Reducir carga documental sin sacrificar calidad formal
- Disponibilidad a pagar: $0 (institución pública-privada sin ánimo de lucro)

**Segmento secundario:** Docentes de otras unidades educativas de la red Fe y Alegría Ecuador (Guayaquil, Machala, Esmeraldas) y del sistema educativo nacional.

### 3.2 Tamaño de Mercado

| Segmento | Estimado de docentes | Potencial de adopción |
|---|---|---|
| Fe y Alegría "La Dolorosa" (beneficiaria directa) | ~80 docentes | 50 % → 40 activos en 6 meses |
| Red Fe y Alegría Ecuador completa | ~500 docentes | 20 % → 100 activos en 12 meses |
| Sector público Ecuador (Zona 9 — Quito) | ~15,000 docentes | 2 % → 300 activos en escenario expansión |

### 3.3 Análisis Competitivo

| Competidor | Fortalezas | Debilidades frente a DocuIA |
|---|---|---|
| **ChatGPT (GPT-4o)** | Modelo potente, muy conocido | No conoce formatos Fe y Alegría; prompts genéricos; puede inventar datos; requiere habilidad de prompteo; sin historial estructurado |
| **Google Gemini** | Gratuito, integrado con Docs | Sin especialización educativa ecuatoriana; sin formatos institucionales; sin gestión de cursos |
| **Word manual** | Sin costo tecnológico | 2–3 horas por informe; errores de transcripción; sin consistencia de formato |
| **Herramientas edtech genéricas** | Interfaz amigable | Ninguna conoce los protocolos DECE/DCD ni la escala de 10 puntos de Ecuador |

### 3.4 Ventaja Diferencial de DocuIA

- **Sistema prompt 100 % server-side con conocimiento del currículo ecuatoriano** — el docente no puede modificar las instrucciones del sistema
- **Anti-alucinación** — la IA tiene instrucción explícita de no inventar ningún dato que no esté en el formulario
- **Soporte de formatos institucionales propios** — el docente puede subir el formato PDF/Excel oficial de su institución
- **Regeneración parcial de secciones** — sin necesidad de rehacer todo el informe
- **Gestión de cursos persistente con auto-relleno** — elimina la repetición manual de datos

### 3.5 Validación Inicial

Se realizaron entrevistas y una sesión de validación con docentes de Fe y Alegría que evaluaron prototipos funcionales del sistema. Los resultados de la ficha de validación (RDA3) mostraron aceptación positiva del flujo principal. La retroalimentación recibida fue incorporada para mejorar la especificidad de los campos del formulario y la precisión de la terminología generada.

---

## 4. Propuesta de Valor

### 4.1 Declaración de Valor

> **"De datos a informe institucional completo en menos de 3 minutos, con el lenguaje formal de Fe y Alegría."**

DocuIA elimina la redacción manual de informes educativos. El docente aporta los datos (números, nombres, observaciones); DocuIA aporta la estructura, el lenguaje formal y la consistencia institucional.

### 4.2 Beneficios Cuantificables

| Métrica | Antes (manual) | Con DocuIA | Ahorro |
|---|---|---|---|
| Tiempo por informe | 2.5 horas | 15 minutos | **1.75 horas por informe** |
| Horas/mes por docente (4 informes) | 10 horas | 1 hora | **9 horas/mes** |
| Errores de transcripción | Frecuentes | Mínimos | — |
| Consistencia de formato | Variable | 100 % consistente | — |
| Disponibilidad | Horario de oficina | 24/7 desde cualquier dispositivo | — |

### 4.3 Diferenciales Técnicos

1. **Prompt server-side seguro** — los datos del formulario son sanitizados antes de enviarse al modelo.
2. **Terminología ecuatoriana nativa** — DCD (Destrezas con Criterios de Desempeño), DECE (Departamento de Consejería Estudiantil), quimestre, jornada matutina/vespertina, escala 1–10.
3. **Anti-alucinación** — el modelo tiene instrucción explícita de no inventar ningún dato que no esté en el formulario.
4. **Formatos institucionales** — el docente puede subir el formato PDF/Excel oficial de su institución; la IA lo replica en estructura y lenguaje.
5. **Streaming en tiempo real** — el informe aparece carácter a carácter en pantalla (tecnología SSE), reduciendo la percepción de espera.
6. **Fallback automático** — si el modelo principal tiene timeout, cambia automáticamente al modelo de respaldo (llama-3.1-8b-instant) sin interrumpir al usuario.
7. **Regeneración parcial** — se puede reescribir solo una sección del informe sin perder el resto.
8. **Feedback integrado** — botones con valoración positiva/negativa y nota opcional para mejorar la calidad del sistema con el tiempo.
9. **Exportación nativa Word** — los informes se descargan como archivos .docx editables, no como texto plano.
10. **Zero-cost para la institución** — toda la infraestructura opera en capas gratuitas de servicios cloud.

---

## 5. Modelo de Negocio

### 5.1 Canvas Simplificado

| Bloque | Descripción |
|---|---|
| **Segmento de clientes** | Docentes de Fe y Alegría Ecuador (primario) · Red Fe y Alegría nacional (secundario) |
| **Propuesta de valor** | Ahorro de tiempo docente · Consistencia institucional · IA con conocimiento educativo ecuatoriano |
| **Canales** | Plataforma web (docuia.vercel.app) · Capacitación presencial en la institución |
| **Relación con clientes** | Autoservicio + Asistente Lucía (chatbot) + soporte por correo del equipo |
| **Fuentes de ingresos** | **Actual:** Herramienta gratuita — valor como impacto social y proyecto académico PUCE |
| | **Futuro (12–24 meses):** Freemium con límite de 10 informes/mes gratis · Suscripción institucional $29/mes para instituciones fuera de Fe y Alegría |
| **Recursos clave** | Código fuente (MIT) · Cuenta Groq API · Cuenta Supabase · Dominio · Know-how del equipo |
| **Actividades clave** | Mantenimiento y actualización del sistema · Soporte a docentes · Capacitación · Monitoreo de errores |
| **Socios clave** | PUCE (apoyo académico) · Fe y Alegría Ecuador (institución beneficiaria) · Groq (IA gratuita) · Vercel (hosting gratuito) |
| **Estructura de costos** | $25/mes operativos + soporte del equipo (tiempo voluntario post-graduación) |

### 5.2 Flujo de Valor (No Monetario)

El modelo actual es de **impacto social sin ánimo de lucro**:

- Fe y Alegría recibe una herramienta gratuita de alto valor práctico.
- El equipo PUCE cumple su proyecto de Aprendizaje-Servicio.
- El código queda bajo licencia MIT para que la comunidad educativa lo mejore.
- El valor generado se mide en horas docentes liberadas, no en dinero.

### 5.3 Escalabilidad Futura

Si la institución o la red Fe y Alegría decide escalar el proyecto más allá de la entrega académica:

- **Ruta 1:** La institución designa un docente-técnico responsable del mantenimiento (capacitación de 4 horas con el manual técnico).
- **Ruta 2:** PUCE asigna un equipo de continuación en el siguiente ciclo de Emprendimiento Tecnológico.
- **Ruta 3:** Se lanza como SaaS con capa freemium para instituciones educativas del Ecuador ($29/mes por institución).

---

## 6. Plan Técnico

### 6.1 Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas:

```
[Navegador del docente]
        ↕ HTTPS / JWT
[Vercel Serverless Functions — 10 endpoints API]
        ↕ PostgreSQL / REST         ↕ API Key
[Supabase — BD + Auth]          [Groq API — IA]
```

Diagrama completo con todos los componentes disponible en `docs/arquitectura.md` del repositorio.

### 6.2 Stack Tecnológico Justificado

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite 5 | Componentes reutilizables, build optimizado, hot-reload en desarrollo |
| Backend | Vercel Serverless Functions | Escala a cero, free tier, deploy automático desde GitHub |
| Base de datos | Supabase (PostgreSQL) | Autenticación incluida, RLS nativo, SDK JavaScript, free tier de 500 MB |
| Inteligencia Artificial | Groq API (LLaMA 3.3 70B) | Inferencia ~10× más rápida que OpenAI; free tier generoso (~14,400 req/día) |
| Hosting | Vercel Hobby | CDN global, HTTPS automático, free tier ilimitado para proyectos estáticos |
| Exportación documentos | docx + docxtemplater | Genera Word nativo editable (.docx), no solo texto plano |

### 6.3 Fases de Desarrollo Completadas

| Fase | Descripción | Estado |
|---|---|---|
| **Fase 1** | MVP: formulario + generación básica + login | Completada |
| **Fase 2** | Gestión de cursos + historial + plantillas | Completada |
| **Fase 3** | Formatos institucionales (carga de PDF/Excel) | Completada |
| **Fase 4** | Asistente Lucía + onboarding + dark mode | Completada |
| **Fase 5** | Seguridad (CSP, RLS hardening, rate limiting, sanitización) | Completada |
| **Fase 6** | Métricas AARRR + dashboard de docentes | Completada |

### 6.4 Seguridad Implementada

- **Autenticación** con JWT + refresh token rotativo (Supabase Auth).
- **Row Level Security (RLS)** en todas las tablas: cada usuario solo accede a sus propios datos.
- **Content Security Policy (CSP)** + X-Frame-Options + HSTS activado.
- **Rate limiting:** 45 generaciones/usuario/hora (persistente en Supabase) + 120/IP/hora.
- **Sanitización de prompts** server-side: elimina inyecciones tipo `System:`, `[INST]`, `Ignore previous instructions`.
- **Variables de entorno** nunca expuestas al cliente ni al repositorio.

### 6.5 Documentación Técnica Disponible

| Documento | Ubicación | Contenido |
|---|---|---|
| README.md | Raíz del repositorio | Instalación, variables de entorno, estructura de carpetas, librerías de terceros |
| MANUAL_TECNICO.md | Raíz del repositorio | Arquitectura detallada, APIs, seguridad, 15 secciones |
| MANUAL_USUARIO.md | Raíz del repositorio | Guía para docentes no técnicos con capturas de pantalla |
| docs/arquitectura.md | docs/ | Diagrama Mermaid de componentes + justificación del stack |
| docs/diccionario_datos.md | docs/ | Descripción de cada tabla y campo de la base de datos |
| database/schema.sql | database/ | Script completo de creación de tablas |

### 6.6 Roadmap Post-Entrega

| Prioridad | Mejora | Horas estimadas |
|---|---|---|
| Alta | Historial de versiones de un informe | 8 horas |
| Alta | Paginación en cursos y plantillas | 4 horas |
| Media | Tests automatizados con Vitest + Playwright | 16 horas |
| Media | Rate limiting migrado completamente a Supabase | 6 horas |
| Baja | Soporte multi-institución | 20 horas |

---

## 7. Plan Financiero

### 7.1 Inversión Inicial

| Concepto | Monto |
|---|---|
| Equipos de cómputo dedicados al proyecto (costo de oportunidad) | $800 |
| Cursos y capacitación en tecnologías del stack | $150 |
| Servicios temporales durante el desarrollo (dominios de prueba, APIs de pago temporal) | $250 |
| **Total inversión inicial (Mes 0)** | **$1,200** |

### 7.2 Costos Operacionales Mensuales

| Concepto | Costo/mes |
|---|---|
| Dominio .app o .ec (prorrateado) | $1.50 |
| Contingencia servicios premium si se supera el free tier | $13.00 |
| Mantenimiento técnico (tiempo del equipo valorado mínimamente) | $10.50 |
| **Total costos mensuales** | **$25.00** |

### 7.3 Valor Generado Mensual

El valor se mide en **ahorro de tiempo docente**, monetizado al costo de oportunidad de un docente en Ecuador (~$3.50/hora, basado en salario mínimo sectorial 2026 de $470/mes ÷ 134 horas efectivas).

- Cada docente genera 4 informes/mes
- Cada informe ahorra 1.5 horas respecto al proceso manual
- Valor por docente: 4 × 1.5 × $3.50 = **$21/mes por docente**

### 7.4 Flujo de Caja Proyectado — 6 Meses

| Mes | Docentes activos | Informes/mes | Valor generado | Costos operativos | Flujo neto | Flujo acumulado |
|---|---|---|---|---|---|---|
| 0 (inversión) | — | — | — | $1,200 | **−$1,200** | **−$1,200** |
| 1 | 8 | 32 | $168 | $25 | **$143** | **−$1,057** |
| 2 | 14 | 56 | $294 | $25 | **$269** | **−$788** |
| 3 | 20 | 80 | $420 | $25 | **$395** | **−$393** |
| 4 | 27 | 108 | $567 | $25 | **$542** | **+$149** |
| 5 | 33 | 132 | $693 | $25 | **$668** | **+$817** |
| 6 | 40 | 160 | $840 | $25 | **$815** | **+$1,632** |

**Payback:** La inversión inicial se recupera en el **Mes 4**, cuando el flujo acumulado cruza de negativo (−$393) a positivo (+$149).

### 7.5 Indicadores de Rentabilidad

| Indicador | Valor | Interpretación |
|---|---|---|
| **VAN** (tasa 12 % anual) | **$1,518.60** | Positivo → el proyecto genera valor real |
| **TIR mensual** | **~23.5 %** | Muy superior a la tasa de descuento (0.95 %/mes) → ACEPTAR |
| **TIR anualizada** | **~1,492 %** | Refleja modelo de costo ultra-bajo con infraestructura gratuita |
| **Payback** | **Mes 4** | Recuperación de inversión en 4 meses |
| **Costo total 6 meses** | **$1,350** | Inversión inicial + 6 meses de operación |
| **Valor total generado** | **$2,982** | Suma del valor generado en 6 meses |
| **Horas docentes ahorradas** | **852 horas** | Impacto social cuantificable en 6 meses |

### 7.6 Cálculo del VAN (detalle)

Fórmula aplicada: VAN = Suma de [FC_t / (1 + r)^t] para t = 0 a 6

Donde r = tasa de descuento mensual = 0.9489 % (equivalente a 12 % anual)

| Mes (t) | Flujo neto | Factor de descuento | Valor presente |
|---|---|---|---|
| 0 | −$1,200.00 | 1.000000 | **−$1,200.00** |
| 1 | $143.00 | 1.009489 | **$141.66** |
| 2 | $269.00 | 1.019068 | **$264.02** |
| 3 | $395.00 | 1.028737 | **$383.93** |
| 4 | $542.00 | 1.038497 | **$521.90** |
| 5 | $668.00 | 1.048350 | **$637.11** |
| 6 | $815.00 | 1.058296 | **$769.98** |
| | | **SUMA** | **$2,718.60** |

**VAN = −$1,200 + $2,718.60 = $1,518.60**

### 7.7 Cálculo de la TIR (iteración numérica)

| Tasa mensual probada | VAN calculado | Resultado |
|---|---|---|
| 10 % | $1,356.13 | Positivo |
| 20 % | $139.53 | Positivo |
| 23 % | $15.78 | Positivo |
| 24 % | −$21.20 | Negativo |
| **23.5 %** | **≈ $0** | **TIR encontrada** |

**TIR ≈ 23.5 % mensual** → TIR > tasa de descuento (0.95 %/mes) → **DECISIÓN: ACEPTAR el proyecto**

### 7.8 Análisis de Sensibilidad

**Escenario pesimista** (50 % menos adopción):

| Mes | Docentes | Flujo neto | Flujo acumulado |
|---|---|---|---|
| 0 | — | −$1,200 | −$1,200 |
| 6 | 20 | $395 | **+$120** |

- VAN pesimista: **+$155.30** (aún positivo)
- Payback pesimista: Mes 6
- Conclusión: incluso en el peor escenario de adopción, el proyecto sigue siendo viable.

---

## 8. Sostenibilidad

### 8.1 Sostenibilidad Tecnológica (≥ 6 meses sin costos significativos)

El proyecto opera 100 % en capas gratuitas de servicios cloud:

| Servicio | Plan gratuito | Límite | Suficiencia para 40 docentes |
|---|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth/mes · Funciones ilimitadas | 100 req/s · 10 s timeout | Holgado |
| **Supabase Free** | 500 MB BD · 2 GB storage · Auth incluida | 500 MB total | Suficiente (texto de informes pesa poco) |
| **Groq API Free** | ~14,400 req/día | RPM variable | 160 informes/mes << límite diario |
| **Google Fonts** | CDN global ilimitado | — | Sin restricción |

**Plan B si un servicio supera el free tier:**

- **Groq → Gemini 2.0 Flash:** cambio de 3 líneas en `api/generate.mjs` + nueva API key gratuita.
- **Vercel → Cloudflare Pages:** el build Vite es HTML/CSS/JS estático, migrable en 1 hora.
- **Supabase → Neon PostgreSQL:** misma API de Supabase, migración del schema con `database/schema.sql`.

### 8.2 Sostenibilidad Operativa (Post-Graduación del Equipo)

La transferencia del proyecto a Fe y Alegría está garantizada por:

1. **Licencia MIT** en la raíz del repositorio: cualquier institución puede usar, modificar y redistribuir el código sin restricciones ni pagos de regalías.
2. **Documentación completa** para mantenimiento independiente:
   - `README.md`: instalación, variables de entorno, despliegue paso a paso
   - `MANUAL_TECNICO.md`: arquitectura detallada, APIs, seguridad (15 secciones)
   - `MANUAL_USUARIO.md`: guía para docentes no técnicos con capturas de pantalla
   - `docs/arquitectura.md`: diagrama de componentes
   - `docs/diccionario_datos.md`: descripción de cada tabla y campo
   - `database/schema.sql`: schema completo de la base de datos
3. **Repositorio en cuenta genérica** (`github.com/docuia2026`): Fe y Alegría puede agregar colaboradores sin depender del equipo original.
4. **Capacitación entregada** a los docentes y al responsable técnico designado por la institución.

### 8.3 Sostenibilidad del Impacto Social

- El problema de carga documental es **estructural**, no coyuntural: la institución seguirá necesitando informes mientras exista la normativa del MINEDUC.
- La plataforma es **agnóstica al año lectivo**: el catálogo de tipos de informe cubre las necesidades del currículo ecuatoriano actual y puede extenderse a nuevos tipos.
- El modelo de licencia MIT permite que **otras instituciones** adopten DocuIA sin necesidad de contratar al equipo original, multiplicando el impacto social.

### 8.4 Plan de Continuidad — ¿Qué pasa cuando el equipo se gradúe?

| Escenario | Responsable | Acciones necesarias |
|---|---|---|
| Mantenimiento básico (actualizar dependencias, monitorear errores) | Docente-técnico designado por Fe y Alegría | Capacitación de 4 horas con el manual técnico |
| Actualización de tipos de informe o prompts | Cualquier desarrollador con acceso al repo | El repositorio incluye guía de prompts en `docs/` |
| Migración de servicios cloud si salen del free tier | Responsable técnico institucional | El README incluye instrucciones de migración paso a paso |
| Expansión a otras instituciones | Fe y Alegría o PUCE siguiente cohorte | El código MIT permite fork y redistribución |

### 8.5 Declaración de Autoría y Transparencia

El código fuente de DocuIA es creación original del equipo (componentes React, API serverless, schema de base de datos, sistema de prompts especializados). Se usaron las siguientes categorías de herramientas de terceros:

- **Librerías open source:** listadas con licencias en el `README.md` del repositorio (sección "Librerías de terceros y licencias"). Todas bajo licencias MIT o Apache 2.0 verificadas en spdx.org.
- **Herramientas de IA para desarrollo:** Claude (Anthropic) como asistente de código — las decisiones de diseño, arquitectura, prompts del sistema y validación con usuarios son propias del equipo.
- **Servicios cloud:** Supabase, Groq, Vercel — utilizados bajo sus respectivos términos de servicio gratuitos.

Cada integrante del equipo firmó la Declaración de Autoría, Software Libre y Autorización (Asignación T7B).

---

## Anexo: Accesos y Credenciales del Proyecto

> **NOTA DE SEGURIDAD:** Este documento es confidencial y está destinado únicamente al docente evaluador. Las credenciales listadas aquí NO están en el repositorio público de GitHub.

### Correo Genérico del Proyecto

| Campo | Valor |
|---|---|
| Proveedor | Zoho Mail |
| Correo | feyalegriadocuia2026@zohomail.com |
| Contraseña | docuiainformesia2026# |
| Propósito | Correo principal del proyecto. Todos los integrantes del equipo tienen acceso. Usado para la cuenta de GitHub genérica, Vercel, Supabase y comunicaciones con Fe y Alegría. |

### Repositorio de GitHub (Cuenta Genérica)

| Campo | Valor |
|---|---|
| URL del repositorio | https://github.com/docuia2026/docuia |
| Organización/usuario genérico | docuia2026 |
| Correo vinculado | feyalegriadocuia2026@zohomail.com |
| Contraseña | docuiainformesia2026# |
| Licencia | MIT (archivo LICENSE en la raíz) |

### Plataforma de Despliegue — Vercel

| Campo | Valor |
|---|---|
| Proveedor | Vercel (Hobby — free tier) |
| URL de la aplicación | https://docuia.vercel.app |
| Correo de acceso al panel | feyalegriadocuia2026@zohomail.com |
| Contraseña | docuiainformesia2026# |

### Base de Datos y Autenticación — Supabase

| Campo | Valor |
|---|---|
| Proveedor | Supabase (Free tier — 500 MB) |
| URL del proyecto | https://qmgwlfpeuycydptwbyrj.supabase.co |
| Correo de acceso | feyalegriadocuia2026@zohomail.com |
| Contraseña | docuiainformesia2026# |
| Plan | Free (suficiente para 40 docentes) |

### API de Inteligencia Artificial — Groq

| Campo | Valor |
|---|---|
| Proveedor | Groq (Free tier — ~14,400 req/día) |
| Modelo principal | llama-3.3-70b-versatile |
| Modelo de respaldo | llama-3.1-8b-instant |
| Correo de acceso | feyalegriadocuia2026@zohomail.com |
| Contraseña | docuiainformesia2026# |
| API Key (variable de entorno) | GROQ_API_KEY (configurada en Vercel, nunca en el repositorio) |

### Variables de Entorno Necesarias para Despliegue

Las siguientes variables deben configurarse en el panel de Vercel (nunca en el código fuente):

| Variable | Descripción |
|---|---|
| `GROQ_API_KEY` | Clave de API de Groq para el modelo de IA |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (pública — frontend) |
| `VITE_SUPABASE_KEY` | Clave anon/publishable de Supabase (pública — frontend) |
| `SUPABASE_SERVICE_KEY` | Clave service_role de Supabase (secreta — backend únicamente) |

---

*Plan de Negocio — DocuIA · Piñero · Heredia · Zumárraga · Iza · PUCE 2026*
*Beneficiaria: Unidad Educativa Fiscomisional Fe y Alegría "La Dolorosa", Quito, Ecuador*
