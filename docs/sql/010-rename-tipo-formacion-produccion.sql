-- APP Estudio — renombrar nodos_objetivos.tipo: formacion | produccion
-- Reemplaza nodo | logro (SQL 008). Ver docs/adr/002-supabase-schema-contract.md
--
-- formacion: hijos cursos + registros logros
-- produccion: solo hijos logros (tabla logros)

-- ---------------------------------------------------------------------------
-- Migrar valores
-- ---------------------------------------------------------------------------

update public.nodos_objetivos
set tipo = 'formacion'
where tipo in ('nodo', 'dominio') or tipo is null;

update public.nodos_objetivos
set tipo = 'produccion'
where tipo = 'logro';

alter table public.nodos_objetivos
  alter column tipo set default 'formacion';

alter table public.nodos_objetivos
  drop constraint if exists nodos_objetivos_tipo_chk;

alter table public.nodos_objetivos
  add constraint nodos_objetivos_tipo_chk
  check (tipo in ('formacion', 'produccion'));

comment on column public.nodos_objetivos.tipo is
  'Clasificación macro: formacion (cursos + logros) | produccion (solo logros hijos)';

-- ---------------------------------------------------------------------------
-- Cursos solo bajo nodos formacion
-- ---------------------------------------------------------------------------

create or replace function public.enforce_curso_solo_nodo_formacion()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.nodos_objetivos n
    where n.id = new.nodo_id
      and n.tipo = 'formacion'
  ) then
    raise exception
      'cursos.nodo_id debe apuntar a nodos_objetivos.tipo = formacion (nodo_id=%).',
      new.nodo_id;
  end if;
  return new;
end;
$$;

drop trigger if exists cursos_solo_nodo_tipo on public.cursos;

create trigger cursos_solo_nodo_formacion
  before insert or update of nodo_id
  on public.cursos
  for each row
  execute function public.enforce_curso_solo_nodo_formacion();

-- ---------------------------------------------------------------------------
-- Logros hijos bajo formacion o produccion
-- ---------------------------------------------------------------------------

create or replace function public.enforce_logro_nodo_formacion_o_produccion()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.nodos_objetivos n
    where n.id = new.nodo_id
      and n.tipo in ('formacion', 'produccion')
  ) then
    raise exception
      'logros.nodo_id debe apuntar a nodos_objetivos.tipo formacion o produccion (nodo_id=%).',
      new.nodo_id;
  end if;
  return new;
end;
$$;

drop trigger if exists logros_solo_nodo_tipo_logro on public.logros;

create trigger logros_nodo_formacion_o_produccion
  before insert or update of nodo_id
  on public.logros
  for each row
  execute function public.enforce_logro_nodo_formacion_o_produccion();
