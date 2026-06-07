-- APP Estudio — registros hijos de nodos_objetivos tipo logro
-- Ver docs/adr/002-supabase-schema-contract.md
--
-- Distinto de nodos_objetivos.tipo = 'logro' (nodo padre en el grafo).
-- Cada fila es un ítem mostrado en la columna central del explorador (como un curso).

create table if not exists public.logros (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nodo_id bigint not null references public.nodos_objetivos (id) on delete cascade,
  nombre text not null,
  descripcion text,
  created_at timestamptz not null default now()
);

create index if not exists logros_user_nodo_idx
  on public.logros (user_id, nodo_id);

-- ---------------------------------------------------------------------------
-- Solo nodos_objetivos con tipo logro pueden ser padre
-- ---------------------------------------------------------------------------

create or replace function public.enforce_logro_solo_nodo_tipo_logro()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.nodos_objetivos n
    where n.id = new.nodo_id
      and n.tipo = 'logro'
  ) then
    raise exception
      'logros.nodo_id debe apuntar a nodos_objetivos.tipo = logro (nodo_id=%).',
      new.nodo_id;
  end if;
  return new;
end;
$$;

drop trigger if exists logros_solo_nodo_tipo_logro on public.logros;

create trigger logros_solo_nodo_tipo_logro
  before insert or update of nodo_id
  on public.logros
  for each row
  execute function public.enforce_logro_solo_nodo_tipo_logro();

-- ---------------------------------------------------------------------------
-- RLS (ADR 005 — own row)
-- ---------------------------------------------------------------------------

alter table public.logros enable row level security;

drop policy if exists logros_select_own on public.logros;
create policy logros_select_own on public.logros
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists logros_insert_own on public.logros;
create policy logros_insert_own on public.logros
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists logros_update_own on public.logros;
create policy logros_update_own on public.logros
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists logros_delete_own on public.logros;
create policy logros_delete_own on public.logros
  for delete to authenticated
  using (user_id = auth.uid());
