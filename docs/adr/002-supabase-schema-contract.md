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

### Errores y respuestas vacías

Toda query o mutación a Supabase **puede fallar** (red, RLS, fila inexistente, validación). En `lib/` y `app/hooks/`:

- No asumir que siempre hay datos; manejar `error` de Supabase y estados vacíos de forma explícita.
- Exponer al UI estados claros (cargando, error, sin datos) en lugar de fallar en silencio.
- Si no se conoce el nombre exacto de tabla o columna, **preguntar o actualizar este ADR** antes de escribir la query (no inventar variantes).

## Consecuencias

- Toda query/mutación debe alinearse con este documento antes de merge.
- Cambios en Supabase → actualizar este ADR el mismo día.
