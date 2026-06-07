-- APP Estudio — posiciones de cursos/logros en lienzo detalle (capa 1 /mapa)
-- Ver docs/adr/002-supabase-schema-contract.md y ADR 010 fase B.
--
-- Una fila por (scope, hijo): layout distinto según tema vs nodo padre del overlay.

-- ---------------------------------------------------------------------------
-- Tabla lienzo_hijos_posiciones
-- ---------------------------------------------------------------------------

create table if not exists public.lienzo_hijos_posiciones (
  user_id uuid not null references auth.users (id) on delete cascade,
  scope_kind text not null,
  scope_id bigint not null,
  hijo_kind text not null,
  hijo_id bigint not null,
  pos_x double precision not null default 0,
  pos_y double precision not null default 0,
  updated_at timestamptz not null default now(),
  constraint lienzo_hijos_posiciones_scope_kind_chk
    check (scope_kind in ('tema', 'nodo')),
  constraint lienzo_hijos_posiciones_hijo_kind_chk
    check (hijo_kind in ('curso', 'logro')),
  primary key (user_id, scope_kind, scope_id, hijo_kind, hijo_id)
);

create index if not exists lienzo_hijos_posiciones_scope_idx
  on public.lienzo_hijos_posiciones (user_id, scope_kind, scope_id);

comment on table public.lienzo_hijos_posiciones is
  'Posición React Flow de curso/logro en overlay detalle; scope = tema o nodo padre.';

-- ---------------------------------------------------------------------------
-- Validación: hijo pertenece al scope
-- ---------------------------------------------------------------------------

create or replace function public.enforce_lienzo_hijo_posicion_scope()
returns trigger
language plpgsql
as $$
begin
  if new.scope_kind = 'tema' then
    if new.hijo_kind <> 'curso' then
      raise exception
        'En scope tema solo se guardan posiciones de cursos (scope_id=%).',
        new.scope_id;
    end if;
    if not exists (
      select 1 from public.cursos c
      where c.id = new.hijo_id and c.tema_id = new.scope_id
    ) then
      raise exception
        'curso id=% no pertenece al tema scope_id=%.',
        new.hijo_id, new.scope_id;
    end if;
    return new;
  end if;

  if new.scope_kind <> 'nodo' then
    raise exception 'scope_kind inválido: %.', new.scope_kind;
  end if;

  if new.hijo_kind = 'curso' then
    if not exists (
      select 1 from public.cursos c
      where c.id = new.hijo_id and c.nodo_id = new.scope_id
    ) then
      raise exception
        'curso id=% no pertenece al nodo scope_id=%.',
        new.hijo_id, new.scope_id;
    end if;
  elsif not exists (
    select 1 from public.logros l
    where l.id = new.hijo_id and l.nodo_id = new.scope_id
  ) then
    raise exception
      'logro id=% no pertenece al nodo scope_id=%.',
      new.hijo_id, new.scope_id;
  end if;

  return new;
end;
$$;

drop trigger if exists lienzo_hijos_posiciones_scope on public.lienzo_hijos_posiciones;

create trigger lienzo_hijos_posiciones_scope
  before insert or update
  on public.lienzo_hijos_posiciones
  for each row
  execute function public.enforce_lienzo_hijo_posicion_scope();

-- ---------------------------------------------------------------------------
-- RLS (ADR 005 — own row)
-- ---------------------------------------------------------------------------

alter table public.lienzo_hijos_posiciones enable row level security;

drop policy if exists lienzo_hijos_posiciones_select_own on public.lienzo_hijos_posiciones;
create policy lienzo_hijos_posiciones_select_own on public.lienzo_hijos_posiciones
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists lienzo_hijos_posiciones_insert_own on public.lienzo_hijos_posiciones;
create policy lienzo_hijos_posiciones_insert_own on public.lienzo_hijos_posiciones
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists lienzo_hijos_posiciones_update_own on public.lienzo_hijos_posiciones;
create policy lienzo_hijos_posiciones_update_own on public.lienzo_hijos_posiciones
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists lienzo_hijos_posiciones_delete_own on public.lienzo_hijos_posiciones;
create policy lienzo_hijos_posiciones_delete_own on public.lienzo_hijos_posiciones
  for delete to authenticated
  using (user_id = auth.uid());
