# Mobile — shell PWA (ADR 006)

UI **exclusiva del shell móvil**: rutas `/temas`, `/cursos`, `/clases`, home, PWA install. No usar en `/explorador` ni en breakpoints responsive.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `shell/` | `AppShell` — nav panel, swipe atrás, breadcrumb |
| `sheets/` | `StudySheet` — alta contextual (sin slide al abrir, ADR 006) |
| `fab/` | FAB listado y menú expandible en detalle |
| `cards/` | `EntityCard`, menú contextual long-press en hijos |
| `detalle/` | Vistas y cards de detalle tema/curso/clase + `detalle-shared.tsx` |
| `pwa/` | Ayudas install iOS/Android (ADR 004) |

## Reglas

1. **No** importar desde `components/desktop/`.
2. **Sí** importar forms desde `components/shared/forms/` y primitivos desde `components/ui/`.
3. Animaciones: seguir [ADR 006](../../docs/adr/006-feedback-ui-movil.md) (`FAB_OPEN_DELAY_MS`, sheet sin slide).
4. Gestos de navegación: `lib/nav-*`, `lib/use-nav-detail-gestures.ts`.

Ver [ADR 008](../../docs/adr/008-dual-shell-mobile-desktop.md).
