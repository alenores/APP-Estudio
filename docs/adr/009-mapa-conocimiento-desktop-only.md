# ADR 009: Mapa de conocimiento — solo escritorio

## Estado

Aceptado — 2026-06-04 (Fase 0 — contrato + aislamiento)

## Contexto

Se necesita una pantalla **grande** para modelar un grafo de conocimiento (tech tree): nodos temáticos, relaciones de prerequisito, posición en línea de tiempo (eje X) y carriles paralelos (eje Y). Ejemplo: «Animaciones» depende de «CSS» pero aparece mucho más adelante en el tiempo.

Esto **no** es el seguimiento de estudio (`temas` / `cursos` / `clases` / `seguimientos`) ni las notas **`conceptos`** adjuntas a esas entidades. Son dominios distintos.

## Decisión

### 1. Regla estricta: **solo PC, sin excepciones**

| Prohibido | Obligatorio |
|-----------|-------------|
| Rutas bajo shell móvil | Ruta `/mapa` bajo `app/(desktop)/` |
| Links desde `AppShell`, FAB, detalle móvil | Middleware: UA móvil → redirect lejos de `/mapa` |
| `responsive` / breakpoints para el mapa | Detección shell igual que ADR 008 |
| Incluir nodos/enlaces en `useEstudioData` ni snapshot offline | Datos propios: `useMapaNodos` + `lib/mapa-queries.ts` |
| Importar React Flow (fase 2+) fuera de `components/desktop/mapa/` | `next/dynamic(..., { ssr: false })` en la página del mapa |
| Componentes en `components/mobile/` o `components/shared/forms/` para el mapa | UI en `components/desktop/mapa/` |
| FK a `temas` / `cursos` / `clases` en v1 | Tablas aisladas; enlace opcional en fase futura (ADR aparte) |

**Cualquier humano o IA** que modifique este repo debe tratar el mapa como módulo **desktop-only**. Si un pedido pide “ver el mapa en el celular”, **rechazar** y citar este ADR.

### 2. Terminología (no confundir)

| Término | Qué es |
|---------|--------|
| **Nodo del mapa** | Entidad en `mapa_nodos` — pieza del grafo de conocimiento |
| **Enlace del mapa** | Fila en `mapa_enlaces` — flecha origen → destino |
| **Concepto** (estudio) | Tabla `conceptos` — nota ligada a tema/curso/clase (ADR 002) |
| **Tema / curso / clase** | Catálogo de estudio — sin relación con nodos en v1 |

En código y UI del mapa usar **«nodo»** / **«enlace»**, nunca «concepto» para el grafo.

### 3. Schema Supabase

Script: [`docs/sql/002-schema-mapa-conocimiento.sql`](../sql/002-schema-mapa-conocimiento.sql).

#### `mapa_nodos`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigint PK | identity |
| `user_id` | uuid | FK `auth.users`, RLS |
| `titulo` | text | not null |
| `descripcion` | text | |
| `pos_x` | double precision | not null default 0 — posición lienzo (React Flow) |
| `pos_y` | double precision | not null default 0 |
| `carril` | integer | not null default 0 — carril paralelo (eje Y semántico) |
| `etapa` | integer | not null default 0 — eslabón / columna de timeline |
| `created_at` | timestamptz | default now() |

#### `mapa_enlaces`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigint PK | identity |
| `user_id` | uuid | RLS |
| `origen_id` | bigint | FK `mapa_nodos.id` ON DELETE CASCADE |
| `destino_id` | bigint | FK `mapa_nodos.id` ON DELETE CASCADE |
| `tipo` | text | nullable; `prerequisito` \| `continuacion` \| `refuerzo` \| `paralelo` |
| `created_at` | timestamptz | default now() |

Constraints: `origen_id <> destino_id`; `unique (origen_id, destino_id)`.

RLS: mismas políticas own-row que ADR 005 (`user_id = auth.uid()`).

### 4. Capas frontend (ADR 003)

| Qué | Dónde |
|-----|-------|
| Tipos | `app/types/mapa.ts` |
| CRUD Supabase | `lib/mapa-queries.ts` |
| Validación Zod | `lib/validations.ts` (`mapaNodoFormSchema`) |
| Hook datos | `app/hooks/useMapaNodos.ts` |
| Página | `app/(desktop)/mapa/page.tsx` |
| UI | `components/desktop/mapa/*` |
| Rutas shell | `lib/shell-routes.ts` (`DESKTOP_MAPA_PREFIX`) |

**No** tocar `lib/estudio-queries.ts`, `lib/estudio-offline-cache.ts` ni `useEstudioData` para el mapa.

### 5. Fases de implementación

| Fase | Entregable |
|------|------------|
| **0** (hecho) | ADR 009, SQL 002, middleware, regla Cursor |
| **1** | ABM nodos (lista + form), sin canvas |
| **2** (hecho) | React Flow: nodos en pos_x/pos_y, drag → guardar |
| **3** (hecho) | Enlaces (crear/borrar, flechas) |
| **4** (hecho) | Guías timeline / carriles, minimapa |
| **5** (hecho) | Estética nodos custom |
| **6** (futuro) | FK opcional nodo ↔ tema/curso |

### 6. React Flow (fase 2+)

- Dependencia `@xyflow/react` solo en fase 2.
- CSS de la librería en `globals.css` **después** de Tailwind, scoped a clases del mapa si es posible.
- Carga con `dynamic(..., { ssr: false })` en `app/(desktop)/mapa/page.tsx` para que el bundle **no** llegue al shell móvil.

## Consecuencias

- Ejecutar `docs/sql/002-schema-mapa-conocimiento.sql` en Supabase antes de usar la UI del mapa.
- Probar mapa: navegador de escritorio → `/mapa`. Emulación móvil debe redirigir a `/temas`.
- Nuevas features del mapa → revisar este ADR; ampliar schema solo con migración SQL documentada.

## Referencias

- [ADR 008](008-dual-shell-mobile-desktop.md) — dos shells
- [ADR 002](002-supabase-schema-contract.md) — estudio (tablas distintas)
- [ADR 005](005-auth-rls.md) — RLS
