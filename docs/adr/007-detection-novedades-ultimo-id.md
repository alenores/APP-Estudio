# ADR 007: Detección de novedades por último `id`

## Estado

Aceptado — 2026-06-04

## Contexto

Con el paquete local (ADR 001), el usuario no debe descargar todo en cada visita. Basta saber si en Supabase hay filas **nuevas** respecto al snapshot.

## Decisión

1. **`EstudioDataSignature`:** `{ temas, cursos, clases, seguimientos, conceptos }` — cada valor es el mayor `id` visto (número ≥ 0).
2. **Remoto:** por tabla, `select('id').order('id', { ascending: false }).limit(1)` (RLS aplica `user_id`).
3. **Local:** `signature` guardada en el snapshot; si falta, inferir con `max(id)` de los arrays del paquete.
4. **Hay novedad** si `remote[t] > local[t]` en **alguna** tabla → UI muestra **Actualizar**.
5. **Sin novedad:** opcionalmente actualizar `signature` local al remoto (como Vías) para evitar falsos positivos tras sync parcial.
6. **No** usar conteo de filas ni `updated_at` en fase 1.

## Consecuencias

- Implementación en `checkEstudioUpdatesAvailable()` dentro de `lib/estudio-offline-cache.ts`.
- Una comprobación por carga de documento (session flag en `useEstudioData`), no por cada navegación interna.
