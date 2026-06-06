-- APP Estudio — objetivos de aprendizaje (catálogo roadmap)
-- Ver docs/adr/009-mapa-conocimiento-desktop-only.md (fase 7)
--
-- Tabla de referencia global (sin user_id): nombres y orden de objetivos.
-- El mapa asigna color/filtro por rango de `mapa_nodos.etapa` (ver lib/mapa-objetivo.ts).
-- Opcional: `cursos.objetivo_id` enlaza el catálogo de estudio con un objetivo.

-- ---------------------------------------------------------------------------
-- Catálogo objetivos
-- ---------------------------------------------------------------------------

create table if not exists public.objetivos (
  id bigint generated always as identity primary key,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists objetivos_orden_idx on public.objetivos (orden);

-- Los tres objetivos del roadmap ERP se cargan manualmente o ya existen en Supabase.
-- Ver filas id 1–3: BaaS, infra propia, SaaS.

alter table public.objetivos enable row level security;

drop policy if exists objetivos_select_authenticated on public.objetivos;
create policy objetivos_select_authenticated on public.objetivos
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Cursos → objetivo (opcional; explorador / reportes futuros)
-- ---------------------------------------------------------------------------

alter table public.cursos
  add column if not exists objetivo_id bigint references public.objetivos (id) on delete set null;

create index if not exists cursos_objetivo_id_idx on public.cursos (objetivo_id);
