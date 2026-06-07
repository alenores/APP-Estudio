-- APP Estudio — columna orden en nodos_objetivos (si falta en Supabase)
-- Ver docs/sql/005-schema-nodos-objetivos.sql
-- Error típico: Could not find the 'orden' column of 'nodos_objetivos'

alter table public.nodos_objetivos
  add column if not exists orden integer not null default 0;

create index if not exists nodos_objetivos_orden_idx
  on public.nodos_objetivos (orden);

comment on column public.nodos_objetivos.orden is
  'Orden en listados (explorador PC). Fallback UI: etapa.';
