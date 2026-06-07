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
| Incluir nodos/enlaces en `useEstudioData` ni snapshot offline | Datos propios: `useMapaGrafo` + `lib/mapa-queries.ts` / `lib/temas-lienzo-queries.ts` |
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
| Objetivos / color mapa | `lib/mapa-objetivo.ts` |
| Hook datos | `app/hooks/useMapaGrafo.ts` |
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
| **7** (hecho) | Objetivos + `nodos_objetivos.objetivo_id`; explorador por nodos |
| **8** (hecho) | Renombre `nodos_objetivos` / `enlaces_nodos`; `cursos.nodo_id` |
| **9a** (hecho) | Tabla `enlaces_temas` — grafo entre temas (SQL 006) |
| **9b** (hecho) | Lienzo dual: vista **Nodos objetivo** \| **Temas** (React Flow) |
| **10** (hecho, v1) | Capa 1 detalle: overlay con hijos (cursos / logros) — ADR 010 |

### 8. Lienzo dual (fase 9b — implementado)

En `/mapa`, el mismo lienzo React Flow conmuta entre dos grafos:

| Vista | Nodos | Enlaces | Color / filtro |
|-------|-------|---------|----------------|
| **Nodos objetivo** | `nodos_objetivos` | `enlaces_nodos` | `objetivo_id` + leyenda + filtro toolbar |
| **Temas** | filas `temas` | `enlaces_temas` | tono shell tema (`mapa-flow-node--tema`) |

**SQL:** `006` (`enlaces_temas`), `007` (`temas.pos_x` / `pos_y` / `etapa` / `carril`).

**Capa compartida (sin duplicar lógica React Flow):**

| Qué | Dónde |
|-----|-------|
| Modo grafo | `lib/mapa-lienzo-types.ts` — `MapaGrafoModo` |
| Posición lienzo | `lib/mapa-layout.ts` — `posicionEnLienzo` (nodos y temas) |
| Proyección visual lienzo | `lib/mapa-lienzo-orientacion.ts` — ver [§9](009-mapa-conocimiento-desktop-only.md#9-proyección-visual-del-lienzo-canónico-vs-pantalla) |
| Build nodos Flow | `lib/mapa-flow-nodes.ts` — `buildMapaFlowNodesForGrafo` |
| Edges | `lib/mapa-flow-edges.ts` — `toFlowEdges` (genérico) |
| Conteo enlaces | `lib/mapa-grafo-enlaces.ts` |
| Queries temas | `lib/temas-lienzo-queries.ts` |
| Hook datos | `app/hooks/useMapaGrafo.ts` (`useMapaNodos` = wrapper nodos) |
| Canvas | `components/desktop/mapa/mapa-canvas.tsx` — persistencia por modo |
| Node UI | `mapa-nodo-node.tsx`, `mapa-tema-node.tsx` |
| Toolbar | `mapa-toolbar.tsx` — switch Nodos \| Temas; filtro objetivo solo en nodos |

Reutiliza: drag → guardar posición, conectar handles → insert enlace, Delete → borrar enlace, guías timeline (`MapaTimelineGuides` + `computeMapaGridBounds` sobre `LienzoPosicionable[]`).

Sin offline pack — queries directas, no `useEstudioData`.

### 9. Proyección visual del lienzo (canónico vs pantalla)

React Flow y el DOM usan coordenadas de **pantalla** (origen arriba-izquierda, Y hacia abajo). Los campos de negocio del lienzo usan un espacio **canónico** estable en Supabase:

| Campo | Eje canónico | Significado |
|-------|--------------|-------------|
| `etapa` | `pos_x` | Columna / timeline |
| `carril` | `pos_y` | Carril paralelo |

**Regla:** lo que el usuario elige en formularios, listas y BD **siempre** habla canónico. Cambios de **vista** (invertir ejes, espejar carril, handles de flechas, etiquetas del grid) viven en la **capa de proyección**, no en migraciones ni en heurísticas duplicadas.

| Qué | Dónde |
|-----|-------|
| Proyección canónico ↔ pantalla | `lib/mapa-lienzo-orientacion.ts` |
| Layout canónico (sin flip ni swap) | `lib/mapa-layout.ts` — `posicionDesdeEtapaCarril`, `posicionEnLienzo` |
| Detalle capa 1 (misma proyección) | `lib/mapa-detalle-layout.ts` — `mapaDetallePositionDisplay` |
| Switch Etapa→X / Etapa→Y | `mapa-toolbar.tsx` — estado en sesión, default `xy`, sin persistir |
| Guardar tras drag | `projectDisplayToCanonical` antes de `update*Tema*Position` / `upsertLienzoHijoPosicion` |

**Transformaciones actuales (solo presentación):**

1. **Orientación `xy` \| `yx`:** transpone etapa/carril al pintar (`swapLienzoCoordsAroundOrigin`); incluye `pos_x`/`pos_y` libres si el usuario arrastró la card (opción B acordada).
2. **Carril en `xy`:** espejo vertical del eje carril — carril 0 **abajo**, mayor carril **arriba** (`flipCanonicalYForCarrilAxis`); en `yx` el carril ya va horizontal izquierda→derecha y no se invierte.
3. **Handles de enlaces:** entrada/salida según orientación (`mapa-flow-enlace-handles.tsx` + `mapaLienzoFlowHandleConfig`).
4. **Etiquetas de etapa en `xy`:** margen **inferior** del grid (regla del eje X).

**Antes de implementar algo nuevo en el lienzo**, preguntar:

- ¿Cambia el **contrato** (`etapa`, `carril`, `pos_*` en BD)? → SQL / ADR 002, formularios, queries.
- ¿Solo cambia **cómo se ve o se arrastra**? → extender `mapa-lienzo-orientacion.ts` (+ guías SVG y drag inverso); **no** tocar el canónico.

**Anti-patrones (rechazar o replantear):**

- Segunda columna en BD para “posición en vista Y/X”.
- Duplicar `posicionEnLienzo` con variantes por orientación en `mapa-layout.ts`.
- Guardar en Supabase coordenadas ya transpuestas según el switch del toolbar.

### 7. Objetivos (fase 7–8)

- Catálogo global: tabla `objetivos` (`docs/sql/003-schema-objetivos.sql`).
- Nodos: `nodos_objetivos` con `objetivo_id`; enlaces: `enlaces_nodos`.
- Cursos: `cursos.nodo_id` → `nodos_objetivos.id` (explorador columna Nodos).
- Enlaces entre temas: `enlaces_temas` (`docs/sql/006-schema-enlaces-temas.sql`) — lienzo por temas en fase 9b.

| Qué | Dónde |
|-----|-------|
| Reglas etapa → objetivo | `lib/mapa-objetivo.ts` |
| Filtro + leyenda UI | `components/desktop/mapa/mapa-objetivo-ui.tsx` |
| Nodos flow + hidden | `lib/mapa-flow-nodes.ts`, `mapa-canvas.tsx` |

### 6. React Flow (fase 2+)

- Dependencia `@xyflow/react` solo en fase 2.
- CSS de la librería en `globals.css` **después** de Tailwind, scoped a clases del mapa si es posible.
- Carga con `dynamic(..., { ssr: false })` en `app/(desktop)/mapa/page.tsx` para que el bundle **no** llegue al shell móvil.

## Consecuencias

- Ejecutar `docs/sql/002-schema-mapa-conocimiento.sql` en Supabase antes de usar la UI del mapa.
- Objetivos: `docs/sql/003-schema-objetivos.sql` (RLS + `cursos.objetivo_id` opcional).
- Seed roadmap ERP: `docs/sql/004-seed-roadmap-erp.sql` (**borra** `mapa_nodos` / `mapa_enlaces`).
- Probar mapa: navegador de escritorio → `/mapa`. Emulación móvil debe redirigir a `/temas`.
- Nuevas features del mapa → revisar este ADR; ampliar schema solo con migración SQL documentada.

## Referencias

- [ADR 008](008-dual-shell-mobile-desktop.md) — dos shells
- [ADR 002](002-supabase-schema-contract.md) — estudio (tablas distintas)
- [ADR 005](005-auth-rls.md) — RLS
