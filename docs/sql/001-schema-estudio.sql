-- APP Estudio — esquema (Supabase SQL Editor)
-- Ver docs/adr/002-supabase-schema-contract.md y docs/adr/005-auth-rls.md
--
-- ids de negocio: bigint autoincremental (temas, cursos, clases, seguimientos).
-- user_id: uuid → auth.users (sin cambios).

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.temas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  jerarquia integer not null default 0,
  fecha_estimada_inicio date,
  fecha_estimada_fin date,
  created_at timestamptz not null default now()
);

create table public.cursos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tema_id bigint not null references public.temas (id) on delete cascade,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  jerarquia integer not null default 0,
  fecha_estimada_inicio date,
  fecha_estimada_fin date,
  plataforma text,
  link text,
  created_at timestamptz not null default now()
);

create table public.clases (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  curso_id bigint not null references public.cursos (id) on delete cascade,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  jerarquia integer not null default 0,
  dificultad text,
  created_at timestamptz not null default now()
);

create table public.seguimientos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tema_id bigint references public.temas (id) on delete cascade,
  curso_id bigint references public.cursos (id) on delete cascade,
  clase_id bigint references public.clases (id) on delete cascade,
  fecha_registro timestamptz not null default now(),
  etiqueta_estado text,
  porcentaje_avance numeric(5, 2),
  tiempo_consumido integer,
  tiempo_faltante_estimado integer,
  comentario text,
  fecha_alerta date,
  fecha_comienzo date,
  nivel_entendimiento text,
  created_at timestamptz not null default now(),
  constraint seguimientos_una_dimension_chk check (
    (tema_id is not null)::int
    + (curso_id is not null)::int
    + (clase_id is not null)::int = 1
  )
);

-- ---------------------------------------------------------------------------
-- Índices (listados por orden; seguimientos por fecha)
-- ---------------------------------------------------------------------------

create index temas_user_orden_idx on public.temas (user_id, orden, jerarquia);
create index cursos_tema_orden_idx on public.cursos (tema_id, orden, jerarquia);
create index clases_curso_orden_idx on public.clases (curso_id, orden, jerarquia);
create index seguimientos_tema_fecha_idx on public.seguimientos (tema_id, fecha_registro desc);
create index seguimientos_curso_fecha_idx on public.seguimientos (curso_id, fecha_registro desc);
create index seguimientos_clase_fecha_idx on public.seguimientos (clase_id, fecha_registro desc);
create index seguimientos_user_fecha_idx on public.seguimientos (user_id, fecha_registro desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.temas enable row level security;
alter table public.cursos enable row level security;
alter table public.clases enable row level security;
alter table public.seguimientos enable row level security;

create policy temas_select_own on public.temas
  for select to authenticated
  using (user_id = auth.uid());

create policy temas_insert_own on public.temas
  for insert to authenticated
  with check (user_id = auth.uid());

create policy temas_update_own on public.temas
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy temas_delete_own on public.temas
  for delete to authenticated
  using (user_id = auth.uid());

create policy cursos_select_own on public.cursos
  for select to authenticated
  using (user_id = auth.uid());

create policy cursos_insert_own on public.cursos
  for insert to authenticated
  with check (user_id = auth.uid());

create policy cursos_update_own on public.cursos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy cursos_delete_own on public.cursos
  for delete to authenticated
  using (user_id = auth.uid());

create policy clases_select_own on public.clases
  for select to authenticated
  using (user_id = auth.uid());

create policy clases_insert_own on public.clases
  for insert to authenticated
  with check (user_id = auth.uid());

create policy clases_update_own on public.clases
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy clases_delete_own on public.clases
  for delete to authenticated
  using (user_id = auth.uid());

create policy seguimientos_select_own on public.seguimientos
  for select to authenticated
  using (user_id = auth.uid());

create policy seguimientos_insert_own on public.seguimientos
  for insert to authenticated
  with check (user_id = auth.uid());

create policy seguimientos_update_own on public.seguimientos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy seguimientos_delete_own on public.seguimientos
  for delete to authenticated
  using (user_id = auth.uid());
