-- APP Estudio — tipología desarrollos (fase 1)
-- Ver docs/adr/011-tipologia-desarrollos.md y ADR 002 § desarrollos.
--
-- Nivel abuelo (UI): definicion_general
-- Nivel padre (UI): definicion_especifica
-- Nivel hijo (UI): acciones
-- Registro tipo seguimiento: caracteristicas

-- ---------------------------------------------------------------------------
-- Tablas jerárquicas
-- ---------------------------------------------------------------------------

create table if not exists public.definicion_general (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  descripcion text,
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  etapa integer not null default 0,
  carril integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.definicion_especifica (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_general_id bigint not null references public.definicion_general (id) on delete cascade,
  nombre text not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.acciones (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_especifica_id bigint not null references public.definicion_especifica (id) on delete cascade,
  nombre text not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create table if not exists public.caracteristicas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_general_id bigint references public.definicion_general (id) on delete cascade,
  definicion_especifica_id bigint references public.definicion_especifica (id) on delete cascade,
  accion_id bigint references public.acciones (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint caracteristicas_una_dimension_chk check (
    (definicion_general_id is not null)::int
    + (definicion_especifica_id is not null)::int
    + (accion_id is not null)::int = 1
  )
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index if not exists definicion_general_user_nombre_idx
  on public.definicion_general (user_id, nombre);

create index if not exists definicion_especifica_general_idx
  on public.definicion_especifica (definicion_general_id, nombre);

create index if not exists acciones_especifica_idx
  on public.acciones (definicion_especifica_id, nombre);

create index if not exists caracteristicas_general_idx
  on public.caracteristicas (definicion_general_id);

create index if not exists caracteristicas_especifica_idx
  on public.caracteristicas (definicion_especifica_id);

create index if not exists caracteristicas_accion_idx
  on public.caracteristicas (accion_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.definicion_general enable row level security;
alter table public.definicion_especifica enable row level security;
alter table public.acciones enable row level security;
alter table public.caracteristicas enable row level security;

drop policy if exists definicion_general_select_own on public.definicion_general;
create policy definicion_general_select_own on public.definicion_general
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists definicion_general_insert_own on public.definicion_general;
create policy definicion_general_insert_own on public.definicion_general
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists definicion_general_update_own on public.definicion_general;
create policy definicion_general_update_own on public.definicion_general
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists definicion_general_delete_own on public.definicion_general;
create policy definicion_general_delete_own on public.definicion_general
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists definicion_especifica_select_own on public.definicion_especifica;
create policy definicion_especifica_select_own on public.definicion_especifica
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists definicion_especifica_insert_own on public.definicion_especifica;
create policy definicion_especifica_insert_own on public.definicion_especifica
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists definicion_especifica_update_own on public.definicion_especifica;
create policy definicion_especifica_update_own on public.definicion_especifica
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists definicion_especifica_delete_own on public.definicion_especifica;
create policy definicion_especifica_delete_own on public.definicion_especifica
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists acciones_select_own on public.acciones;
create policy acciones_select_own on public.acciones
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists acciones_insert_own on public.acciones;
create policy acciones_insert_own on public.acciones
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists acciones_update_own on public.acciones;
create policy acciones_update_own on public.acciones
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists acciones_delete_own on public.acciones;
create policy acciones_delete_own on public.acciones
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists caracteristicas_select_own on public.caracteristicas;
create policy caracteristicas_select_own on public.caracteristicas
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists caracteristicas_insert_own on public.caracteristicas;
create policy caracteristicas_insert_own on public.caracteristicas
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists caracteristicas_update_own on public.caracteristicas;
create policy caracteristicas_update_own on public.caracteristicas
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists caracteristicas_delete_own on public.caracteristicas;
create policy caracteristicas_delete_own on public.caracteristicas
  for delete to authenticated
  using (user_id = auth.uid());
