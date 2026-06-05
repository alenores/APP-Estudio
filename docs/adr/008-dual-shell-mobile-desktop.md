# ADR 008: Dos shells — móvil y escritorio (no responsive)

## Estado

Aceptado — 2026-06-04 (fase 5 estructural — 2026-06-04)

## Contexto

APP Estudio tiene una UX **móvil-first** (PWA, detalle en profundidad, sheets, gestos) que no debe deformarse con breakpoints. En **PC** se necesita otra experiencia: explorador **tres columnas** (temas → cursos → clases), modales con tablas, mouse/teclado.

Misma base: Supabase, paquete local (`useEstudioData`), `lib/estudio-queries.ts`, validaciones Zod, derivados en `lib/`. **No** dos backends ni dos snapshots.

## Decisión

### 1. Cuatro etiquetas de alcance (no cuatro productos)

| Etiqueta | Qué incluye |
|----------|-------------|
| **ui** | Primitivos presentacionales (`components/ui/`) — sin Supabase, sin hooks de negocio |
| **shared** | Forms, sync, data root, link preview (`components/shared/`) |
| **mobile** | Rutas `/temas`, `/cursos`, `/clases`, `AppShell`, PWA, ADR 006 |
| **desktop** | Rutas `/explorador`, `components/desktop/` |

Todo pedido de feature debe aclarar **ui | shared | mobile | desktop**. Tokens/chips base → **ui**; forms → **shared**; layout 3 columnas → **desktop**.

### 2. Detección automática — sin elección del usuario

- **No** botón “versión PC / móvil”.
- **No** responsive: no usar `md:` para cambiar estructura entre shells.
- El **middleware** (`lib/shell-detect.ts`, `lib/shell-routes.ts`) decide en cada request:
  - **Móvil** (`User-Agent` / `sec-ch-ua-mobile`) → rutas móviles; `/explorador` redirige a `/temas`.
  - **Escritorio** → `/explorador`; `/`, `/temas/*`, `/cursos/*`, `/clases/*` redirigen al explorador (query `?tema=` / `?curso=` / `?clase=` cuando aplica).
- Login post-auth: móvil → `/temas`; escritorio → `/explorador`.

Exentos de redirección por shell: `/login`, `/auth`, `/api`, `/offline`.

### 3. Rutas

| Shell | Entrada principal | Detalle |
|-------|-------------------|---------|
| Móvil | `/`, `/temas` | `/temas/[id]`, `/cursos/[id]`, `/clases/[id]` |
| Escritorio | `/explorador` | Selección vía query; modales tabla |

### 4. Carpetas

```
components/
├── ui/                         → primitivos (form controls, page chrome, MiniCard, PlatformLinkIcon)
├── shared/
│   ├── data/estudio-data-root.tsx
│   ├── sync/estudio-sync-banner.tsx
│   ├── forms/                  → TemaForm, CursoForm, ClaseForm, SeguimientoForm, ConceptoForm
│   └── links/external-link-preview.tsx
├── mobile/
│   ├── shell/app-shell.tsx
│   ├── sheets/study-sheet.tsx
│   ├── fab/
│   ├── cards/
│   ├── detalle/                → vistas + detalle-shared.tsx
│   └── pwa/
├── desktop/                    → explorador, modales, toolbar
├── deploy-sha-footer.tsx       → global (ambos shells + home)
└── prevent-viewport-zoom.tsx   → global (layout)

lib/form-parent-types.ts        → ConceptoParent, SeguimientoParent (lib, no components)
lib/shell-detect.ts             → detección servidor
lib/shell-routes.ts             → constantes y mapeo URLs
app/hooks/useEstudioExplorer.ts → árbol temas/cursos/clases (PC)
app/hooks/useExploradorKeyboard.ts → atajos explorador
```

**Dependencias entre capas:** `ui` → (solo `lib` puro) · `shared` → `ui` · `mobile`/`desktop` → `shared` + `ui` · **`lib` no importa `components/`**.

### 5. Design system

Primitivos visuales (chip, card, tokens `--td-*`) en **`components/ui/`** y `app/globals.css`. Wrappers distintos: `StudySheet` (móvil, ADR 006) vs `DesktopModal` (escritorio).

### 6. Fases

1. **Hecho v1:** ADR, middleware, `/explorador` 3 columnas, selección URL.
2. **Hecho v2:** modales seguimiento/conceptos en tabla; alta con forms compartidos; doble clic → seguimientos.
3. **Hecho v3:** toolbar + Tema/Curso/Clase desde PC; métricas en cards.
4. **Hecho v4:** editar/eliminar entidades; atajos de teclado.
5. **Hecho v5:** `components/ui/`, `components/shared/`, `components/mobile/`; eliminación de `components/study/` y carpetas legacy; tipos de form en `lib/form-parent-types.ts`.

## Consecuencias

- Probar PC: navegador de escritorio → `/explorador` automático.
- Probar móvil: emulación UA móvil o teléfono → flujo actual.
- IA: no mezclar shells; no añadir breakpoints de layout en pages compartidas.
- Nuevas rutas móviles → añadir prefijo a `MOBILE_SHELL_PREFIXES` y redirección escritorio en `shell-routes.ts`.
- Cada carpeta top-level en `components/` tiene `README.md` con reglas de import.

## Referencias

- [ADR 003](003-frontend-layer-separation.md) — capas datos/UI
- [ADR 006](006-feedback-ui-movil.md) — solo shell móvil
- `AGENTS.md` — mapa actualizado
