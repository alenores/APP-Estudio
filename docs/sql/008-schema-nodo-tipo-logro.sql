-- APP Estudio — clasificación nodos_objetivos: nodo | logro
-- Ver docs/adr/002-supabase-schema-contract.md
--
-- Repurpose columna `tipo` (antes default 'dominio'): solo 'nodo' o 'logro'.
-- Un logro no puede tener cursos (trigger en cursos.nodo_id).

-- ---------------------------------------------------------------------------
-- Migrar valores existentes
-- ---------------------------------------------------------------------------

update public.nodos_objetivos
set tipo = 'nodo'
where tipo is null
   or tipo not in ('nodo', 'logro');

alter table public.nodos_objetivos
  alter column tipo set default 'nodo';

alter table public.nodos_objetivos
  alter column tipo set not null;

alter table public.nodos_objetivos
  drop constraint if exists nodos_objetivos_tipo_chk;

alter table public.nodos_objetivos
  add constraint nodos_objetivos_tipo_chk
  check (tipo in ('nodo', 'logro'));

comment on column public.nodos_objetivos.tipo is
  'Clasificación: nodo (puede tener cursos) | logro (sin cursos)';

-- ---------------------------------------------------------------------------
-- Logro → sin cursos asociados
-- ---------------------------------------------------------------------------

create or replace function public.enforce_curso_solo_nodo_tipo()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.nodos_objetivos n
    where n.id = new.nodo_id
      and n.tipo = 'logro'
  ) then
    raise exception 'Un logro no puede tener cursos asociados (nodo_id=%).', new.nodo_id;
  end if;
  return new;
end;
$$;

drop trigger if exists cursos_solo_nodo_tipo on public.cursos;

create trigger cursos_solo_nodo_tipo
  before insert or update of nodo_id
  on public.cursos
  for each row
  execute function public.enforce_curso_solo_nodo_tipo();
