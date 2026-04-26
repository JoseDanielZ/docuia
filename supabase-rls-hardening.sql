-- ═══════════════════════════════════════════════════════════════════════════════
-- DocuIA — Endurecimiento RLS y permisos (ejecutar en Supabase → SQL Editor)
-- Objetivo: que anon/authenticated NO escriban tablas que solo debe tocar el backend
-- (service_role). Tu API usa SUPABASE_SERVICE_KEY y ignora RLS.
-- Idempotente: usa DROP IF EXISTS donde aplica.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Tablas solo servidor: sin acceso directo para anon/authenticated ───────
-- visitas, reportes_copiados, referrals

ALTER TABLE IF EXISTS visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reportes_copiados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert" ON visitas;
DROP POLICY IF EXISTS "anon_insert" ON reportes_copiados;
DROP POLICY IF EXISTS "anon_insert" ON referrals;

-- Sin políticas para anon/authenticated ⇒ no filas visibles ni escritura vía PostgREST
-- (service_role sigue pudiendo todo)

REVOKE ALL ON TABLE public.visitas FROM anon, authenticated;
REVOKE ALL ON TABLE public.reportes_copiados FROM anon, authenticated;
REVOKE ALL ON TABLE public.referrals FROM anon, authenticated;

GRANT ALL ON TABLE public.visitas TO service_role;
GRANT ALL ON TABLE public.reportes_copiados TO service_role;
GRANT ALL ON TABLE public.referrals TO service_role;

-- ── 2. reportes: quitar inserción anónima; dueño solo con JWT (opcional futuro) ─
ALTER TABLE IF EXISTS reportes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert" ON reportes;

REVOKE ALL ON TABLE public.reportes FROM anon, authenticated;

-- Si la columna user_id existe: el docente puede ver/editar solo lo suyo (cliente directo)
DROP POLICY IF EXISTS "reportes_select_propio" ON reportes;
DROP POLICY IF EXISTS "reportes_insert_propio" ON reportes;
DROP POLICY IF EXISTS "reportes_update_propio" ON reportes;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reportes' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "reportes_select_propio" ON reportes
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "reportes_insert_propio" ON reportes
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "reportes_update_propio" ON reportes
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    GRANT SELECT, INSERT, UPDATE ON TABLE public.reportes TO authenticated;
  END IF;
END $$;

GRANT ALL ON TABLE public.reportes TO service_role;

-- ── 3. Tablas ya protegidas por user_id (mantener coherencia) ─────────────────
-- cursos, formatos_institucionales, plantillas: típicamente solo dueño.
-- Ajusta si tus nombres de política difieren.

-- Sin cambios destructivos aquí; revisa que exista auth.uid() = user_id en cada una.

-- ═══════════════════════════════════════════════════════════════════════════════
-- Listo. Comprueba en Supabase → Authentication → Policies que no queden políticas
-- "abiertas" (USING true) en tablas sensibles.
-- ═══════════════════════════════════════════════════════════════════════════════
