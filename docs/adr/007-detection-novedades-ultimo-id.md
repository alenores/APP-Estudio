# ADR 007: Detección de novedades (id + contenido)

## Estado

Aceptado — 2026-06-04 (ampliado 2026-06-04: digest de filas)

## Contexto

Con el paquete local (ADR 001), el usuario no debe descargar todo en cada visita. Hay que detectar:

- filas **nuevas** o **borradas** (`maxId`, `rowCount`);
- **ediciones** de filas existentes (cambio en columnas sin nuevo `id`).

## Decisión

1. **`EstudioTableSignature` por tabla:** `{ maxId, rowCount, digest }`.
2. **`digest`:** hash estable (djb2) del JSON canónico de **todas** las filas (`select *`, orden `id asc`), columnas incluidas tal cual vienen de Supabase.
3. **Local:** la firma se **recalcula** desde los arrays del snapshot (`buildSignatureFromSnapshot`); no confiar solo en la firma persistida para comparar.
4. **Remoto:** misma huella por tabla en paralelo (5 consultas livianas para uso personal; no es la descarga ordenada del botón Actualizar).
5. **Hay novedad** si en **alguna** tabla difiere `maxId`, `rowCount` o `digest` → UI muestra **Actualizar**.
6. **Sin novedad:** persistir `signature` remota en el paquete local (como Vías) para alinear metadatos.
7. Firmas **legacy** (solo número = max id) se normalizan al leer; la comparación real usa digest local vs remoto.

## Consecuencias

- Implementación: `lib/estudio-table-digest.ts`, `checkEstudioUpdatesAvailable()` en `lib/estudio-offline-cache.ts`.
- Una comprobación por carga de documento (session flag en `useEstudioData`), no por cada navegación interna.
- Ediciones en Supabase (Table Editor, SQL) disparan **Actualizar** aunque no haya nuevo `id`.

## Archivos

| Qué | Dónde |
|-----|--------|
| Digest / hash | `lib/estudio-table-digest.ts` |
| Check + snapshot | `lib/estudio-offline-cache.ts` |
