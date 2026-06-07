-- APP Estudio — nodos_objetivos + enlaces_nodos + cursos.nodo_id
-- Migración desde mapa_nodos / mapa_enlaces / cursos.objetivo_id
-- Ver docs/adr/002-supabase-schema-contract.md y ADR 009 fase 8.
--
-- ⚠️ Si ya renombraste tablas en Supabase, ejecutar solo la sección cursos.

-- ---------------------------------------------------------------------------
-- Renombres (omitir si ya aplicados en el panel)
-- ---------------------------------------------------------------------------

-- alter table public.mapa_nodos rename to nodos_objetivos;
-- alter table public.mapa_enlaces rename to enlaces_nodos;

-- ---------------------------------------------------------------------------
-- Columnas nodos_objetivos
-- ---------------------------------------------------------------------------

alter table public.nodos_objetivos
  add column if not exists objetivo_id bigint references public.objetivos (id);

alter table public.nodos_objetivos
  add column if not exists tipo text default 'dominio';

alter table public.nodos_objetivos
  add column if not exists orden integer not null default 0;

create index if not exists nodos_objetivos_orden_idx
  on public.nodos_objetivos (orden);

create index if not exists nodos_objetivos_objetivo_id_idx
  on public.nodos_objetivos (objetivo_id);

-- ---------------------------------------------------------------------------
-- Cursos → nodo (obligatorio)
-- ---------------------------------------------------------------------------

alter table public.cursos
  add column if not exists nodo_id bigint references public.nodos_objetivos (id);

-- Migrar desde objetivo_id si existía (asignar manualmente si hace falta):
-- update public.cursos set nodo_id = ... where nodo_id is null;

alter table public.cursos
  drop column if exists objetivo_id;

alter table public.cursos
  alter column nodo_id set not null;

create index if not exists cursos_nodo_id_idx on public.cursos (nodo_id);
