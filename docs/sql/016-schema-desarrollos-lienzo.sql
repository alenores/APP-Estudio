-- APP Estudio — lienzo tipología desarrollos (capa 0 + capa 1)
-- Ver docs/adr/011-tipologia-desarrollos.md y ADR 002 § desarrollos.

-- ---------------------------------------------------------------------------
-- Capa 0: enlaces entre definicion_general
-- ---------------------------------------------------------------------------

create table if not exists public.enlaces_definicion_general (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  origen_id bigint not null references public.definicion_general (id) on delete cascade,
  destino_id bigint not null references public.definicion_general (id) on delete cascade,
  tipo text,
  created_at timestamptz not null default now(),
  constraint enlaces_definicion_general_distinto_chk check (origen_id <> destino_id),
  constraint enlaces_definicion_general_origen_destino_uniq unique (origen_id, destino_id),
  constraint enlaces_definicion_general_tipo_chk check (
    tipo is null
    or tipo in ('prerequisito', 'continuacion', 'refuerzo', 'paralelo')
  )
);

create index if not exists enlaces_definicion_general_user_origen_idx
  on public.enlaces_definicion_general (user_id, origen_id);

create index if not exists enlaces_definicion_general_user_destino_idx
  on public.enlaces_definicion_general (user_id, destino_id);

-- ---------------------------------------------------------------------------
-- Capa 1: enlaces entre acciones (scope = definicion_general)
-- ---------------------------------------------------------------------------

create table if not exists public.enlaces_desarrollo_acciones (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_general_id bigint not null references public.definicion_general (id) on delete cascade,
  origen_id bigint not null references public.acciones (id) on delete cascade,
  destino_id bigint not null references public.acciones (id) on delete cascade,
  tipo text,
  created_at timestamptz not null default now(),
  constraint enlaces_desarrollo_acciones_distinto_chk check (origen_id <> destino_id),
  constraint enlaces_desarrollo_acciones_scope_origen_destino_uniq unique (
    definicion_general_id,
    origen_id,
    destino_id
  ),
  constraint enlaces_desarrollo_acciones_tipo_chk check (
    tipo is null
    or tipo in ('prerequisito', 'continuacion', 'refuerzo', 'paralelo')
  )
);

create index if not exists enlaces_desarrollo_acciones_scope_idx
  on public.enlaces_desarrollo_acciones (user_id, definicion_general_id);

-- ---------------------------------------------------------------------------
-- Capa 1: posiciones acciones en overlay
-- ---------------------------------------------------------------------------

create table if not exists public.lienzo_desarrollo_acciones_posiciones (
  user_id uuid not null references auth.users (id) on delete cascade,
  definicion_general_id bigint not null references public.definicion_general (id) on delete cascade,
  accion_id bigint not null references public.acciones (id) on delete cascade,
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, definicion_general_id, accion_id)
);

-- ---------------------------------------------------------------------------
-- Validación: acciones pertenecen al árbol del definicion_general scope
-- ---------------------------------------------------------------------------

create or replace function public.enforce_enlace_desarrollo_accion_scope()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.acciones a
    join public.definicion_especifica de on de.id = a.definicion_especifica_id
    where a.id = new.origen_id
      and de.definicion_general_id = new.definicion_general_id
      and a.user_id = new.user_id
  ) then
    raise exception
      'origen accion id=% no pertenece al definicion_general scope_id=%.',
      new.origen_id, new.definicion_general_id;
  end if;

  if not exists (
    select 1
    from public.acciones a
    join public.definicion_especifica de on de.id = a.definicion_especifica_id
    where a.id = new.destino_id
      and de.definicion_general_id = new.definicion_general_id
      and a.user_id = new.user_id
  ) then
    raise exception
      'destino accion id=% no pertenece al definicion_general scope_id=%.',
      new.destino_id, new.definicion_general_id;
  end if;

  return new;
end;
$$;

drop trigger if exists enlaces_desarrollo_acciones_scope_trg on public.enlaces_desarrollo_acciones;
create trigger enlaces_desarrollo_acciones_scope_trg
  before insert or update on public.enlaces_desarrollo_acciones
  for each row execute function public.enforce_enlace_desarrollo_accion_scope();

create or replace function public.enforce_lienzo_desarrollo_accion_scope()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.acciones a
    join public.definicion_especifica de on de.id = a.definicion_especifica_id
    where a.id = new.accion_id
      and de.definicion_general_id = new.definicion_general_id
      and a.user_id = new.user_id
  ) then
    raise exception
      'accion id=% no pertenece al definicion_general scope_id=%.',
      new.accion_id, new.definicion_general_id;
  end if;

  return new;
end;
$$;

drop trigger if exists lienzo_desarrollo_acciones_posiciones_scope_trg
  on public.lienzo_desarrollo_acciones_posiciones;
create trigger lienzo_desarrollo_acciones_posiciones_scope_trg
  before insert or update on public.lienzo_desarrollo_acciones_posiciones
  for each row execute function public.enforce_lienzo_desarrollo_accion_scope();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.enlaces_definicion_general enable row level security;
alter table public.enlaces_desarrollo_acciones enable row level security;
alter table public.lienzo_desarrollo_acciones_posiciones enable row level security;

drop policy if exists enlaces_definicion_general_select_own on public.enlaces_definicion_general;
create policy enlaces_definicion_general_select_own on public.enlaces_definicion_general
  for select to authenticated using (user_id = auth.uid());

drop policy if exists enlaces_definicion_general_insert_own on public.enlaces_definicion_general;
create policy enlaces_definicion_general_insert_own on public.enlaces_definicion_general
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists enlaces_definicion_general_update_own on public.enlaces_definicion_general;
create policy enlaces_definicion_general_update_own on public.enlaces_definicion_general
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists enlaces_definicion_general_delete_own on public.enlaces_definicion_general;
create policy enlaces_definicion_general_delete_own on public.enlaces_definicion_general
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists enlaces_desarrollo_acciones_select_own on public.enlaces_desarrollo_acciones;
create policy enlaces_desarrollo_acciones_select_own on public.enlaces_desarrollo_acciones
  for select to authenticated using (user_id = auth.uid());

drop policy if exists enlaces_desarrollo_acciones_insert_own on public.enlaces_desarrollo_acciones;
create policy enlaces_desarrollo_acciones_insert_own on public.enlaces_desarrollo_acciones
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists enlaces_desarrollo_acciones_update_own on public.enlaces_desarrollo_acciones;
create policy enlaces_desarrollo_acciones_update_own on public.enlaces_desarrollo_acciones
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists enlaces_desarrollo_acciones_delete_own on public.enlaces_desarrollo_acciones;
create policy enlaces_desarrollo_acciones_delete_own on public.enlaces_desarrollo_acciones
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists lienzo_desarrollo_acciones_posiciones_select_own
  on public.lienzo_desarrollo_acciones_posiciones;
create policy lienzo_desarrollo_acciones_posiciones_select_own
  on public.lienzo_desarrollo_acciones_posiciones
  for select to authenticated using (user_id = auth.uid());

drop policy if exists lienzo_desarrollo_acciones_posiciones_insert_own
  on public.lienzo_desarrollo_acciones_posiciones;
create policy lienzo_desarrollo_acciones_posiciones_insert_own
  on public.lienzo_desarrollo_acciones_posiciones
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists lienzo_desarrollo_acciones_posiciones_update_own
  on public.lienzo_desarrollo_acciones_posiciones;
create policy lienzo_desarrollo_acciones_posiciones_update_own
  on public.lienzo_desarrollo_acciones_posiciones
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists lienzo_desarrollo_acciones_posiciones_delete_own
  on public.lienzo_desarrollo_acciones_posiciones;
create policy lienzo_desarrollo_acciones_posiciones_delete_own
  on public.lienzo_desarrollo_acciones_posiciones
  for delete to authenticated using (user_id = auth.uid());
