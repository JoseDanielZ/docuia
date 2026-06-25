-- ═══════════════════════════════════════════════════════════════════════════════
-- DocuIA — Seed Data (datos de prueba)
-- Ejecutar DESPUÉS de schema.sql (base.sql) en Supabase → SQL Editor
-- NOTA: los UUID de usuario son de ejemplo; reemplazar con IDs reales de auth.users
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. VISITAS DE EJEMPLO ───────────────────────────────────────────────────
INSERT INTO visitas (referrer) VALUES
  ('https://google.com'),
  ('https://facebook.com'),
  (NULL),
  ('https://docuia.vercel.app');

-- ─── 2. REPORTES DE EJEMPLO (sin user_id real, para validar estructura) ───────
-- Estos registros son de modo demostración; en producción el user_id viene de Supabase Auth
INSERT INTO reportes (
  nombre_docente,
  institucion,
  curso,
  periodo,
  tipo_reporte,
  datos_ingresados,
  reporte_generado,
  fue_copiado
) VALUES
  (
    'María García',
    'Unidad Educativa Fe y Alegría Ecuador — Quito',
    '8vo "B" EGB — Matemáticas',
    'Primer Quimestre 2025-2026',
    'calificaciones',
    '{"num_estudiantes": 30, "promedio_clase": 7.8, "porcentaje_aprobados": 85}',
    'Informe de calificaciones generado de ejemplo para demostración del sistema.',
    false
  ),
  (
    'Carlos Heredia',
    'Unidad Educativa Fe y Alegría Ecuador — Quito',
    '10mo "A" EGB — Ciencias Naturales',
    'Segundo Quimestre 2025-2026',
    'asistencia',
    '{"num_estudiantes": 28, "dias_clases": 45, "promedio_asistencia": 92}',
    'Registro de asistencia generado de ejemplo para demostración del sistema.',
    true
  ),
  (
    'Ana Piñero',
    'Unidad Educativa Fe y Alegría Ecuador — Quito',
    '1ro BGU "A" — Informática',
    'Primer Quimestre 2025-2026',
    'microcurricular',
    '{"modulo": "Programación Web", "semana": "3", "objetivo": "Dominar HTML semántico"}',
    'Planificación microcurricular generada de ejemplo para demostración del sistema.',
    false
  );

-- ─── 3. CURSOS DE EJEMPLO ────────────────────────────────────────────────────
-- IMPORTANTE: Reemplazar 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' con un UUID real de auth.users
-- Estos inserts están comentados porque requieren un user_id válido de Supabase Auth

/*
INSERT INTO cursos (
  user_id, nombre, grado, paralelo, asignatura,
  num_estudiantes, jornada, año_lectivo, periodo_actual
) VALUES
  (
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    '8vo "B" — Matemáticas',
    '8vo EGB', 'B', 'Matemáticas',
    30, 'Matutina', '2025-2026', 'Primer Quimestre'
  ),
  (
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    '10mo "A" — Ciencias',
    '10mo EGB', 'A', 'Ciencias Naturales',
    28, 'Matutina', '2025-2026', 'Primer Quimestre'
  );
*/

-- ─── 4. REFERRALS DE EJEMPLO ─────────────────────────────────────────────────
INSERT INTO referrals (email_from) VALUES
  ('docente.prueba@feyalegria.edu.ec'),
  ('maria.garcia@feyalegria.edu.ec');

-- ─── 5. REPORTES COPIADOS (analytics) ────────────────────────────────────────
INSERT INTO reportes_copiados (email_docente, tipo) VALUES
  ('docente.prueba@feyalegria.edu.ec', 'calificaciones'),
  ('otro.docente@feyalegria.edu.ec', 'asistencia');
