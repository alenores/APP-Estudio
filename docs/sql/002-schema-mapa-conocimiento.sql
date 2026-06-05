-- APP Estudio — mapa de conocimiento (solo escritorio)
-- Ver docs/adr/009-mapa-conocimiento-desktop-only.md y docs/adr/005-auth-rls.md
--
-- NO confundir mapa_nodos con conceptos (notas de estudio en tema/curso/clase).

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.mapa_nodos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  descripcion text,
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  carril integer not null default 0,
  etapa integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.mapa_enlaces (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  origen_id bigint not null references public.mapa_nodos (id) on delete cascade,
  destino_id bigint not null references public.mapa_nodos (id) on delete cascade,
  tipo text check (
    tipo is null
    or tipo in ('prerequisito', 'continuacion', 'refuerzo', 'paralelo')
  ),
  created_at timestamptz not null default now(),
  constraint mapa_enlaces_distinto_nodo_chk check (origen_id <> destino_id),
  constraint mapa_enlaces_origen_destino_uniq unique (origen_id, destino_id)
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index mapa_nodos_user_etapa_idx on public.mapa_nodos (user_id, etapa, carril);
create index mapa_enlaces_user_origen_idx on public.mapa_enlaces (user_id, origen_id);
create index mapa_enlaces_user_destino_idx on public.mapa_enlaces (user_id, destino_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.mapa_nodos enable row level security;
alter table public.mapa_enlaces enable row level security;

create policy mapa_nodos_select_own on public.mapa_nodos
  for select to authenticated
  using (user_id = auth.uid());

create policy mapa_nodos_insert_own on public.mapa_nodos
  for insert to authenticated
  with check (user_id = auth.uid());

create policy mapa_nodos_update_own on public.mapa_nodos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy mapa_nodos_delete_own on public.mapa_nodos
  for delete to authenticated
  using (user_id = auth.uid());

create policy mapa_enlaces_select_own on public.mapa_enlaces
  for select to authenticated
  using (user_id = auth.uid());

create policy mapa_enlaces_insert_own on public.mapa_enlaces
  for insert to authenticated
  with check (user_id = auth.uid());

create policy mapa_enlaces_update_own on public.mapa_enlaces
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy mapa_enlaces_delete_own on public.mapa_enlaces
  for delete to authenticated
  using (user_id = auth.uid());
