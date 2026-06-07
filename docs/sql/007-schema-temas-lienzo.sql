-- APP Estudio — posición en lienzo para temas (fase 9b ADR 009)
-- Ver docs/adr/002-supabase-schema-contract.md y ADR 009 §8.
--
-- Espejo de nodos_objetivos: pos_x/pos_y para React Flow; etapa/carril para guías timeline.
-- Ejecutar después de 001 (temas) y antes o después de 006 (enlaces_temas).

alter table public.temas
  add column if not exists pos_x double precision not null default 0,
  add column if not exists pos_y double precision not null default 0,
  add column if not exists etapa integer not null default 0,
  add column if not exists carril integer not null default 0;

comment on column public.temas.pos_x is 'Posición X en lienzo React Flow (/mapa vista Temas)';
comment on column public.temas.pos_y is 'Posición Y en lienzo React Flow (/mapa vista Temas)';
comment on column public.temas.etapa is 'Columna timeline en lienzo (eje X semántico)';
comment on column public.temas.carril is 'Fila paralela en lienzo (eje Y semántico)';
