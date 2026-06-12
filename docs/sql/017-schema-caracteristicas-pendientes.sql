-- APP Estudio — características fase 2 + pendientes
-- Ver docs/adr/011-tipologia-desarrollos.md

ALTER TABLE public.caracteristicas
ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'nota'
CHECK (tipo IN ('nota', 'implicancia_tecnica', 'prompt_cursor'));

ALTER TABLE public.caracteristicas
ADD COLUMN IF NOT EXISTS titulo text;

CREATE TABLE IF NOT EXISTS public.pendientes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_general_id bigint references public.definicion_general (id) on delete cascade,
  definicion_especifica_id bigint references public.definicion_especifica (id) on delete cascade,
  accion_id bigint references public.acciones (id) on delete cascade,
  titulo text not null,
  descripcion text,
  estado text not null default 'abierto'
    check (estado in ('abierto', 'en_progreso', 'resuelto', 'descartado')),
  prioridad text not null default 'media'
    check (prioridad in ('alta', 'media', 'baja')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS pendientes_general_idx
  ON public.pendientes (user_id, definicion_general_id);

CREATE INDEX IF NOT EXISTS pendientes_especifica_idx
  ON public.pendientes (user_id, definicion_especifica_id);

CREATE INDEX IF NOT EXISTS pendientes_accion_idx
  ON public.pendientes (user_id, accion_id);

ALTER TABLE public.pendientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own pendientes" ON public.pendientes;
CREATE POLICY "Users manage own pendientes" ON public.pendientes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
