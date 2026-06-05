# ADR 001: Paquete local de consulta (sync bajo demanda)

## Estado

Aceptado — 2026-06-04 (reemplaza la decisión «online-first sin paquete» del 2026-06-03)

## Contexto

APP Estudio es de **uso personal**: casi no hay altas simultáneas desde PC y celular. La navegación (temas → cursos → clases) debe sentirse **instantánea**, como en *Vías de Escalada Córdoba*: leer desde un **snapshot local**, no reconsultar Supabase en cada pantalla.

Al iniciar el proyecto se asumió online-first puro; en la práctica conviene **paquete local + botón Actualizar**, con detección liviana de novedades (`MAX(id)` por tabla).

Referencias de patrón (no copiar código literal de imágenes/SW de Vías): `lib/offline-cache.ts`, `useOfflineData` en el repo hermano.

## Decisión

1. **Snapshot de negocio** en `localStorage` (`app-estudio-offline-cache-v1`): tablas `temas`, `cursos`, `clases`, `seguimientos`, `conceptos` (nombres ADR 002), filtradas por RLS/`user_id`.
2. **Navegación y listados/detalle:** leer **solo** del snapshot (vía `useEstudioData` + selectores en `lib/estudio-offline-read.ts`). Sin `fetch` a Supabase al montar cada ruta.
3. **Detección de novedades:** al entrar (una pasada por sesión de documento), comparar firma local vs remoto por tabla: `maxId`, `rowCount` y **digest del contenido** (ADR 007). Cubre altas, bajas y ediciones de columnas.
4. **Actualizar:** `downloadEstudioSnapshot()` — descarga completa de las cinco tablas, recalcula `signature`, persiste snapshot.
5. **Altas (sheets/forms):** siguen escribiendo en Supabase; tras éxito → `refreshSnapshot()` (misma descarga) para alinear local y nube.
6. **Sin red:** consulta sobre snapshot si existe; mensaje claro si no hay paquete o falla Actualizar. **No** simular CRUD offline sin red.
7. **Excepción en red:** previews de links externos (YouTube, Platzi, Udemy, etc.) — `ExternalLinkPreview`, `/api/link-preview`; **no** van al snapshot.
8. **PWA / Service Worker:** sin cambio: shell + assets; **NetworkOnly** para `*.supabase.co` (el snapshot es lógica de app, no caché del SW).
9. **Almacenamiento:** `localStorage` para el JSON del paquete (como tablas en Vías). IndexedDB **no** es obligatorio en fase 1; reservado si crece el volumen.

## Limitaciones conocidas

- Tras escribir en PC, el celular ve novedad al abrir app y comparar firmas (o al pulsar Actualizar).
- El check remoto trae todas las filas por tabla para calcular el digest (aceptable en uso personal; no reemplaza la descarga ordenada del botón).

## Consecuencias

- Hooks `useTemasList`, `useTemaDetalle`, etc. dependen del contexto de datos, no de queries directas en `useEffect`.
- `lib/estudio-queries.ts` queda para **sync**, **altas** y utilidades; no para lectura en cada vista.
- Nuevo ADR de detección: [007](007-detection-novedades-ultimo-id.md).

## Archivos

| Qué | Dónde |
|-----|--------|
| Snapshot + sync | `lib/estudio-offline-cache.ts` |
| Lectura derivada | `lib/estudio-offline-read.ts` |
| Contexto UI | `app/hooks/useEstudioData.tsx`, `components/shared/data/estudio-data-root.tsx` |
