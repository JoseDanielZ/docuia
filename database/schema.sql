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

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'Docente'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "users_read_own" ON profiles FOR SELECT USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DocuIA — Schema v2: Cursos + Formatos Institucionales + Profiles actualizado
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. ACTUALIZAR TABLA PROFILES (agregar institución y cargo)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS institucion TEXT,
ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT 'Docente';


-- 2. TABLA CURSOS (un curso = una materia en un grado)
CREATE TABLE IF NOT EXISTS cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificación del curso
  nombre TEXT NOT NULL,  -- Ej: "8vo B - Matemáticas"
  grado TEXT NOT NULL,   -- Ej: "8vo EGB"
  paralelo TEXT,         -- Ej: "B"
  asignatura TEXT NOT NULL, -- Ej: "Matemáticas"
  
  -- Datos del curso
  num_estudiantes INTEGER DEFAULT 0,
  jornada TEXT,          -- Ej: "Matutina"
  año_lectivo TEXT,      -- Ej: "2025-2026"
  periodo_actual TEXT,   -- Ej: "Primer Quimestre"
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Metadatos (opcional pero útil para reportes)
  nombres_estudiantes TEXT[], -- Array de nombres
  observaciones TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cursos_user_id ON cursos(user_id);
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON cursos(activo) WHERE activo = true;

-- RLS (Row Level Security) - solo el dueño ve sus cursos
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own courses" ON cursos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON cursos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON cursos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" ON cursos
  FOR DELETE USING (auth.uid() = user_id);


-- 3. TABLA FORMATOS INSTITUCIONALES (PDFs/Excel subidos)
CREATE TABLE IF NOT EXISTS formatos_institucionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de reporte al que aplica
  tipo_reporte TEXT NOT NULL, -- "semanal", "calificaciones", "asistencia", "dece", "planificacion"
  
  -- Archivo original
  nombre_archivo TEXT NOT NULL,
  tipo_archivo TEXT NOT NULL, -- "pdf" o "excel"
  
  -- Contenido extraído (texto plano parseado del PDF/Excel)
  contenido_extraido TEXT NOT NULL,
  
  -- Metadatos
  es_ejemplo BOOLEAN DEFAULT false, -- true si tiene datos de ejemplo, false si está vacío
  num_campos_detectados INTEGER DEFAULT 0,
  
  -- Estado
  activo BOOLEAN DEFAULT true
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_formatos_user_id ON formatos_institucionales(user_id);
CREATE INDEX IF NOT EXISTS idx_formatos_tipo ON formatos_institucionales(tipo_reporte);

-- RLS
ALTER TABLE formatos_institucionales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own formats" ON formatos_institucionales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own formats" ON formatos_institucionales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own formats" ON formatos_institucionales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own formats" ON formatos_institucionales
  FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- LISTO. Ejecuta este SQL en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE reportes 
  ADD COLUMN IF NOT EXISTS feedback SMALLINT DEFAULT NULL 
  CONSTRAINT feedback_values CHECK (feedback IN (1, -1));

ALTER TABLE reportes 
  ADD COLUMN IF NOT EXISTS feedback_nota TEXT DEFAULT NULL;

  