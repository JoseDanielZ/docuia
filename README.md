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
