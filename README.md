# DocuIA — Reportes inteligentes para docentes

Landing page + Wizard of Oz MVP para automatizar reportes de docentes de Fe y Alegría con IA generativa.

## Stack
- **Frontend:** React + Vite
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **IA:** Claude API (Anthropic)

## Setup rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir al SQL Editor y ejecutar:

```sql
CREATE TABLE reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email_docente TEXT,
  nombre_docente TEXT NOT NULL,
  institucion TEXT,
  curso TEXT NOT NULL,
  periodo TEXT NOT NULL,
  tipo_reporte TEXT NOT NULL,
  datos_ingresados JSONB,
  reporte_generado TEXT,
  fue_copiado BOOLEAN DEFAULT false
);

CREATE TABLE visitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  referrer TEXT
);

CREATE TABLE reportes_copiados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email_docente TEXT,
  tipo TEXT
);

CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email_from TEXT
);

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_copiados ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON reportes FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert" ON visitas FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert" ON reportes_copiados FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert" ON referrals FOR INSERT WITH CHECK (true);
```

3. Copiar las keys de Settings > API

### 3. Variables de entorno
Crear archivo `.env` basado en `.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...
```

### 4. Correr en local
```bash
npm run dev
```

### 5. Deploy en Vercel
```bash
npx vercel --prod
```

O conectar el repo de GitHub en vercel.com y agregar las 3 variables de entorno en Settings > Environment Variables.

## Lenguajes y tecnologías

| Lenguaje / Tecnología | Uso |
|---|---|
| **JavaScript (JSX)** | Todo el frontend — componentes React, lógica de estado |
| **JavaScript (ESM)** | Serverless functions en Vercel (`api/`) |
| **CSS** | Estilos globales (`App.css`, `login.css`) con variables CSS nativas |
| **HTML** | Entrada de la app (`index.html`) y página de login (`login.html`) |
| **SQL** | Tablas y políticas en Supabase |

## Estructura del proyecto

```
docuia/
├── index.html                  ← entrada HTML, carga fuentes Google y monta React
├── vite.config.js              ← configuración del bundler (Vite)
├── vercel.json                 ← rutas serverless y config de deploy
├── package.json                ← dependencias y scripts npm
├── .env                        ← claves privadas (no se sube al repo)
├── .gitignore
├── README.md
│
├── public/                     ← archivos servidos tal cual, sin procesar
│   ├── login.html              ← página de autenticación (login / signup / recuperar)
│   └── login.css               ← estilos del login separados del HTML
│
├── api/                        ← serverless functions (Node.js, ejecutadas en Vercel)
│   ├── generate.mjs            ← recibe datos del formulario, llama a Claude API y devuelve el reporte generado
│   └── auth/
│       ├── login.js            ← verifica credenciales con Supabase Auth y devuelve token de sesión
│       ├── signup.js           ← registra un nuevo usuario en Supabase Auth con nombre y rol
│       └── recover.js          ← envía email de recuperación de contraseña vía Supabase
│
└── src/                        ← código fuente React (compilado por Vite)
    ├── main.jsx                ← monta el componente App en el DOM
    ├── App.jsx                 ← orquestador central: maneja las vistas (landing, loading, report),
    │                              el estado del formulario, la llamada a /api/generate y el flujo de auth
    ├── App.css                 ← variables CSS del sistema de diseño (colores, tipografía, sombras),
    │                              animaciones (fadeUp, spin, pulse) y clases utilitarias (.btn, .card, .dl-btn)
    ├── config.js               ← constantes del dominio:
    │                              SYSTEM_PROMPT (instrucciones para Claude),
    │                              REPORT_TYPES (tipos de reporte disponibles),
    │                              FORM_FIELDS (campos por tipo de reporte),
    │                              buildPrompt() (construye el prompt final a partir del formulario)
    ├── utils/
    │   ├── supabase.js         ← saveToSupabase(table, data): envía datos a Supabase REST API
    │   ├── auth.js             ← getUser(): lee usuario del localStorage
    │   │                          logout(): limpia sesión y redirige a /login.html
    │   └── download.js         ← downloadWord(text, filename): genera archivo .doc
    │                              downloadPDF(text, filename): abre ventana de impresión como PDF
    │                              downloadExcel(text, filename): genera archivo .csv
    │                              printReport(text): alias de downloadPDF
    └── components/
        ├── Navbar.jsx          ← barra superior con logo, email del usuario, botón Salir / Iniciar sesión
        ├── Field.jsx           ← campo de formulario reutilizable (input o textarea) con label y validación visual
        ├── LandingPage.jsx     ← página principal compuesta por:
        │                          HeroSection (título y CTA),
        │                          StatsSection (estadísticas de docentes),
        │                          HowItWorksSection (pasos del proceso),
        │                          FormSection (selector de tipo + formulario completo),
        │                          QuoteSection (testimonio),
        │                          CtaSection (licencia institucional + footer)
        ├── LoadingView.jsx     ← pantalla de espera con spinner CSS y mensajes animados mientras genera
        └── ReportView.jsx      ← muestra el reporte generado con opciones de descarga (Word, PDF, Excel,
                                   Imprimir), copia al portapapeles y botón para compartir enlace
```

## Métricas AARRR
Consultar en Supabase SQL Editor:
```sql
SELECT COUNT(*) as visitas FROM visitas;
SELECT COUNT(*) as reportes FROM reportes;
SELECT tipo_reporte, COUNT(*) FROM reportes GROUP BY tipo_reporte;
SELECT COUNT(*) as compartidos FROM referrals;
```

## Equipo
Piñero · Heredia · Zumárraga · Iza
PUCE — Emprendimiento Tecnológico 2026
