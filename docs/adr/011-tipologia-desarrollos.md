# ADR 011: Tipología desarrollos

## Estado

Aceptado — 2026-06-12

## Contexto

APP Estudio opera hoy con tipología **académico** (`temas` → `cursos` → `clases`, más `seguimientos` / `conceptos`). Se necesita una segunda tipología **desarrollos** con jerarquía propia, UI distinta por nivel, snapshot offline separado y lienzo en `/mapa` (solo PC).

Metáfora de niveles (abuelo / padre / hijo) es **solo documentación y UI** — no nombres de tablas Supabase.

## Decisión

### 1. Tipologías

| Tipología | Stack | Snapshot |
|-----------|-------|----------|
| `academico` | ADR 002 existente | `app-estudio-offline-cache-v1` |
| `desarrollos` | Tablas propias (abajo) | `app-estudio-desarrollos-cache-v1` |

Selector en [`app/page.tsx`](../../app/page.tsx). Persistencia: `localStorage` `app-estudio-tipologia-v1` + query `?tipologia=desarrollos` donde aplique.

### 2. Tablas desarrollos (fase 1)

Script: [`docs/sql/015-schema-desarrollos.sql`](../sql/015-schema-desarrollos.sql). Lienzo: [`016-schema-desarrollos-lienzo.sql`](../sql/016-schema-desarrollos-lienzo.sql).

| Nivel (UI) | Tabla | Padre |
|------------|-------|-------|
| Abuelo | `definicion_general` | — |
| Padre | `definicion_especifica` | `definicion_general_id` |
| Hijo | `acciones` | `definicion_especifica_id` |
| Registro (≈ seguimiento) | `caracteristicas` | exactamente uno: `definicion_general_id` \| `definicion_especifica_id` \| `accion_id` |

Fase 1 columnas jerárquicas: `id`, `user_id`, `created_at`, `nombre`, `descripcion`. `definicion_general` incluye `pos_x`, `pos_y`, `etapa`, `carril` para lienzo.

Campos de negocio en `caracteristicas` y niveles → fase 2.

### 3. Paquete local (ADR 001)

Snapshot **separado** del académico. Provider `DesarrollosDataProvider` + `useDesarrollosData`. No mezclar tablas desarrollos en `useEstudioData`.

Detección novedades: misma firma ADR 007 (max id + row count + digest) por las cuatro tablas desarrollos.

### 4. Rutas

| Shell | Académico (sin cambio) | Desarrollos |
|-------|------------------------|-------------|
| Móvil | `/temas`, `/cursos`, `/clases` | `/desarrollos`, `/definicion-general/[id]`, `/definicion-especifica/[id]`, `/acciones/[id]` |
| PC | `/explorador` | `/explorador-desarrollos` |

Home `/` accesible en ambos shells (sin redirect automático desktop → explorador).

### 5. Mapa (ADR 009 + 010)

Tercer modo `desarrollos` en `/mapa`. Pestaña visible **solo** si tipología activa = `desarrollos`; en ese caso ocultar Temas \| Nodos.

Capa 0: `enlaces_definicion_general` + posición en `definicion_general`. Capa 1: `enlaces_desarrollo_acciones` + `lienzo_desarrollo_acciones_posiciones` (scope `definicion_general_id`).

Datos lienzo: fetch en red vía `lib/desarrollos-lienzo-queries.ts` (no en snapshot académico).

### 6. Fuera de alcance

- Nodos en móvil (académico).
- Refactors académico salvo home + shell routing mínimo.
- Campos extra fase 2.
- Mapa en móvil.

## Consecuencias

- Toda feature desarrollos referencia ADR 011 + sección ADR 002.
- Cambios schema → actualizar ADR 002, 011 y SQL el mismo día.

## Archivos clave

| Qué | Dónde |
|-----|--------|
| Tipología | `lib/content-typology.ts` |
| Snapshot | `lib/desarrollos-offline-cache.ts`, `lib/desarrollos-offline-read.ts` |
| CRUD | `lib/desarrollos-queries.ts` |
| Contexto | `app/hooks/useDesarrollosData.tsx` |
| Lienzo | `lib/desarrollos-lienzo-queries.ts` |
| PC explorador | `components/desktop/desarrollos-explorador-view.tsx` |
| Móvil | `components/mobile/desarrollos/*` |
