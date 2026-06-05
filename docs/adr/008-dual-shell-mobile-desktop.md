# ADR 008: Dos shells — móvil y escritorio (no responsive)

## Estado

Aceptado — 2026-06-04

## Contexto

APP Estudio tiene una UX **móvil-first** (PWA, detalle en profundidad, sheets, gestos) que no debe deformarse con breakpoints. En **PC** se necesita otra experiencia: explorador **tres columnas** (temas → cursos → clases), modales con tablas (fases posteriores), mouse/teclado.

Misma base: Supabase, paquete local (`useEstudioData`), `lib/estudio-queries.ts`, validaciones Zod, derivados en `lib/`. **No** dos backends ni dos snapshots.

## Decisión

### 1. Tres etiquetas de alcance (no tres productos)

| Etiqueta | Qué incluye |
|----------|-------------|
| **shared** | `lib/`, hooks de datos, forms, tokens, tipos, sync |
| **mobile** | Rutas `/temas`, `/cursos`, `/clases`, `AppShell`, PWA, ADR 006 |
| **desktop** | Rutas `/explorador`, `components/desktop/`, layout escritorio |

Todo pedido de feature debe aclarar **shared | mobile | desktop**. Cambios en tokens/chips/cards base → **shared**; layout 3 columnas → **desktop**.

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
| Escritorio | `/explorador` | Selección vía query; modales tabla (fase 2+) |

### 4. Carpetas

```
app/(desktop)/explorador/     → página explorador
components/desktop/           → UI solo PC
components/mobile/            → (futuro) mover shell móvil actual
components/study/forms/       → shared (cuerpo formularios)
lib/shell-detect.ts           → detección servidor
lib/shell-routes.ts           → constantes y mapeo URLs
app/hooks/useEstudioExplorer.ts → árbol temas/cursos/clases desde cache
```

### 5. Design system

Primitivos visuales (chip, card, tokens `--td-*`) son **shared**. Wrappers distintos: `StudySheet` (móvil, ADR 006) vs modales escritorio (fase 2).

### 6. Fases

1. **Hecho en v1:** ADR, middleware, `/explorador` 3 columnas, selección URL.
2. **Siguiente:** modales seguimiento/conceptos en tabla; altas desde PC.
3. **Después:** extraer `components/ui/`; mover móvil a `components/mobile/`.

## Consecuencias

- Probar PC: navegador de escritorio → `/explorador` automático.
- Probar móvil: emulación UA móvil o teléfono → flujo actual.
- IA: no mezclar shells; no añadir breakpoints de layout en pages compartidas.
- Nuevas rutas móviles → añadir prefijo a `MOBILE_SHELL_PREFIXES` y redirección escritorio en `shell-routes.ts`.

## Referencias

- [ADR 003](003-frontend-layer-separation.md) — capas datos/UI
- [ADR 006](006-feedback-ui-movil.md) — solo shell móvil
- `AGENTS.md` — mapa actualizado
