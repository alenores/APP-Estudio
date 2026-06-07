-- APP Estudio — eliminar tabla legacy enlaces_cursos
-- Ver docs/adr/002-supabase-schema-contract.md
--
-- enlaces_cursos no forma parte del contrato de la app (nunca referenciada en código).
-- Flechas curso ↔ curso en lienzo detalle → enlaces_hijos_nodos (script 011).
--
-- Ejecutar en Supabase SQL Editor cuando confirmes que no la usa otra app/herramienta.
-- CASCADE quita políticas RLS y triggers asociados a la tabla.

drop table if exists public.enlaces_cursos cascade;
