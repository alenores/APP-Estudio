-- APP Estudio — enlaces entre temas (grafo futuro «lienzo por temas»)
-- Ver docs/adr/002-supabase-schema-contract.md y ADR 009 fase 9.
--
-- Espejo de enlaces_nodos, pero origen/destino → temas.id.
-- No incluye posiciones en lienzo (pos_x/pos_y en temas: ver 007).

-- ---------------------------------------------------------------------------
-- Tabla enlaces_temas
-- ---------------------------------------------------------------------------

create table if not exists public.enlaces_temas (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  origen_id bigint not null references public.temas (id) on delete cascade,
  destino_id bigint not null references public.temas (id) on delete cascade,
  tipo text,
  created_at timestamptz not null default now(),
  constraint enlaces_temas_distinto_tema_chk check (origen_id <> destino_id),
  constraint enlaces_temas_origen_destino_uniq unique (origen_id, destino_id),
  constraint enlaces_temas_tipo_chk check (
    tipo is null
    or tipo in ('prerequisito', 'continuacion', 'refuerzo', 'paralelo')
  )
);

create index if not exists enlaces_temas_user_origen_idx
  on public.enlaces_temas (user_id, origen_id);

create index if not exists enlaces_temas_user_destino_idx
  on public.enlaces_temas (user_id, destino_id);

-- ---------------------------------------------------------------------------
-- RLS (ADR 005 — own row)
-- ---------------------------------------------------------------------------

alter table public.enlaces_temas enable row level security;

drop policy if exists enlaces_temas_select_own on public.enlaces_temas;
create policy enlaces_temas_select_own on public.enlaces_temas
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists enlaces_temas_insert_own on public.enlaces_temas;
create policy enlaces_temas_insert_own on public.enlaces_temas
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists enlaces_temas_update_own on public.enlaces_temas;
create policy enlaces_temas_update_own on public.enlaces_temas
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists enlaces_temas_delete_own on public.enlaces_temas;
create policy enlaces_temas_delete_own on public.enlaces_temas
  for delete to authenticated
  using (user_id = auth.uid());
