-- APP Estudio — enlaces entre hijos del lienzo detalle (capa 1 /mapa)
-- Ver docs/adr/002-supabase-schema-contract.md y ADR 010 v2.
--
-- scope_kind + scope_id = padre del overlay (tema o nodo_objetivo).
-- origen/destino polimórficos: curso | logro (tablas cursos / logros).

-- ---------------------------------------------------------------------------
-- Tabla enlaces_hijos_nodos
-- ---------------------------------------------------------------------------

create table if not exists public.enlaces_hijos_nodos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scope_kind text not null,
  scope_id bigint not null,
  origen_kind text not null,
  origen_id bigint not null,
  destino_kind text not null,
  destino_id bigint not null,
  tipo text,
  created_at timestamptz not null default now(),
  constraint enlaces_hijos_nodos_scope_kind_chk
    check (scope_kind in ('tema', 'nodo')),
  constraint enlaces_hijos_nodos_origen_kind_chk
    check (origen_kind in ('curso', 'logro')),
  constraint enlaces_hijos_nodos_destino_kind_chk
    check (destino_kind in ('curso', 'logro')),
  constraint enlaces_hijos_nodos_distinto_chk check (
    not (origen_kind = destino_kind and origen_id = destino_id)
  ),
  constraint enlaces_hijos_nodos_origen_destino_uniq unique (
    scope_kind,
    scope_id,
    origen_kind,
    origen_id,
    destino_kind,
    destino_id
  ),
  constraint enlaces_hijos_nodos_tipo_chk check (
    tipo is null
    or tipo in ('prerequisito', 'continuacion', 'refuerzo', 'paralelo')
  )
);

create index if not exists enlaces_hijos_nodos_scope_idx
  on public.enlaces_hijos_nodos (user_id, scope_kind, scope_id);

create index if not exists enlaces_hijos_nodos_origen_idx
  on public.enlaces_hijos_nodos (user_id, origen_kind, origen_id);

create index if not exists enlaces_hijos_nodos_destino_idx
  on public.enlaces_hijos_nodos (user_id, destino_kind, destino_id);

comment on table public.enlaces_hijos_nodos is
  'Flechas entre cursos/logros en lienzo detalle; scope = tema o nodo padre del overlay.';

-- ---------------------------------------------------------------------------
-- Validación de scope y endpoints
-- ---------------------------------------------------------------------------

create or replace function public.enforce_enlace_hijo_nodo_scope()
returns trigger
language plpgsql
as $$
declare
  nodo_tipo text;
begin
  if new.scope_kind = 'tema' then
    if new.origen_kind <> 'curso' or new.destino_kind <> 'curso' then
      raise exception
        'En scope tema solo se permiten enlaces curso → curso (scope_id=%).',
        new.scope_id;
    end if;
    if not exists (
      select 1 from public.cursos c
      where c.id = new.origen_id and c.tema_id = new.scope_id
    ) then
      raise exception
        'origen curso id=% no pertenece al tema scope_id=%.',
        new.origen_id, new.scope_id;
    end if;
    if not exists (
      select 1 from public.cursos c
      where c.id = new.destino_id and c.tema_id = new.scope_id
    ) then
      raise exception
        'destino curso id=% no pertenece al tema scope_id=%.',
        new.destino_id, new.scope_id;
    end if;
    return new;
  end if;

  if new.scope_kind <> 'nodo' then
    raise exception 'scope_kind inválido: %.', new.scope_kind;
  end if;

  select n.tipo into nodo_tipo
  from public.nodos_objetivos n
  where n.id = new.scope_id;

  if nodo_tipo is null then
    raise exception 'scope nodo id=% no existe.', new.scope_id;
  end if;

  if nodo_tipo = 'produccion' then
    if new.origen_kind <> 'logro' or new.destino_kind <> 'logro' then
      raise exception
        'En nodo produccion solo logro → logro (nodo_id=%).',
        new.scope_id;
    end if;
  end if;

  if new.origen_kind = 'curso' then
    if not exists (
      select 1 from public.cursos c
      where c.id = new.origen_id and c.nodo_id = new.scope_id
    ) then
      raise exception
        'origen curso id=% no pertenece al nodo scope_id=%.',
        new.origen_id, new.scope_id;
    end if;
  elsif not exists (
    select 1 from public.logros l
    where l.id = new.origen_id and l.nodo_id = new.scope_id
  ) then
    raise exception
      'origen logro id=% no pertenece al nodo scope_id=%.',
      new.origen_id, new.scope_id;
  end if;

  if new.destino_kind = 'curso' then
    if not exists (
      select 1 from public.cursos c
      where c.id = new.destino_id and c.nodo_id = new.scope_id
    ) then
      raise exception
        'destino curso id=% no pertenece al nodo scope_id=%.',
        new.destino_id, new.scope_id;
    end if;
  elsif not exists (
    select 1 from public.logros l
    where l.id = new.destino_id and l.nodo_id = new.scope_id
  ) then
    raise exception
      'destino logro id=% no pertenece al nodo scope_id=%.',
      new.destino_id, new.scope_id;
  end if;

  return new;
end;
$$;

drop trigger if exists enlaces_hijos_nodos_scope on public.enlaces_hijos_nodos;

create trigger enlaces_hijos_nodos_scope
  before insert or update
  on public.enlaces_hijos_nodos
  for each row
  execute function public.enforce_enlace_hijo_nodo_scope();

-- ---------------------------------------------------------------------------
-- RLS (ADR 005 — own row)
-- ---------------------------------------------------------------------------

alter table public.enlaces_hijos_nodos enable row level security;

drop policy if exists enlaces_hijos_nodos_select_own on public.enlaces_hijos_nodos;
create policy enlaces_hijos_nodos_select_own on public.enlaces_hijos_nodos
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists enlaces_hijos_nodos_insert_own on public.enlaces_hijos_nodos;
create policy enlaces_hijos_nodos_insert_own on public.enlaces_hijos_nodos
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists enlaces_hijos_nodos_update_own on public.enlaces_hijos_nodos;
create policy enlaces_hijos_nodos_update_own on public.enlaces_hijos_nodos
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists enlaces_hijos_nodos_delete_own on public.enlaces_hijos_nodos;
create policy enlaces_hijos_nodos_delete_own on public.enlaces_hijos_nodos
  for delete to authenticated
  using (user_id = auth.uid());
