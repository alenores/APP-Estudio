# ADR 002: Contrato de schema Supabase

## Estado

**Borrador — tablas pendientes (fase 2)** — 2026-06-03

## Contexto

La app consume una base Supabase controlada por el dueño del proyecto. No se admiten heurísticas de nombres (`id_curso` vs `curso_id`, tablas alternativas, etc.).

## Decisión

Usar **nombres exactos** de tablas y columnas documentados abajo. Sin aliases, sin fallbacks legacy.

### Tablas

<!-- definir en fase 2 -->

| Entidad | Tabla Supabase | Notas |
|---------|----------------|-------|
| _(pendiente)_ | _(pendiente)_ | Definir en próxima iteración |

### Columnas por tabla

_(pendiente — completar cuando se creen tablas en Supabase)_

### Mapeo al frontend

Si el cache o tipos locales usan nombres distintos, documentarlos aquí explícitamente (no inferir en código).

## Consecuencias

- Toda query/mutación debe alinearse con este documento antes de merge.
- Cambios en Supabase → actualizar este ADR el mismo día.
