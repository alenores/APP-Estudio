# Desktop — shell explorador PC

UI **exclusiva del shell escritorio**: rutas `/explorador` y `/mapa`, detección automática vía middleware (ADR 008, ADR 009).

## Contenido

| Archivo / carpeta | Rol |
|---------|-----|
| `desktop-shell.tsx` | Layout PC, nav Explorador / Mapa, sign-out |
| `desktop-modal.tsx` | Modal portal genérico |
| `explorador-view.tsx` | Orquestador 3 columnas |
| `explorador-*` | Columnas, cards, modales estudio |
| `mapa/` | Mapa de conocimiento (nodos; fase 1 = ABM lista) |

## Reglas

1. **No** importar desde `components/mobile/`.
2. **No** exponer `/mapa` ni `mapa/` al shell móvil (ADR 009).
3. **Sí** importar forms de estudio desde `components/shared/forms/`; forms del mapa solo en `mapa/`.
4. Datos mapa: `useMapaNodos` + `lib/mapa-queries.ts` — **no** `useEstudioData`.

Ver [ADR 008](../../docs/adr/008-dual-shell-mobile-desktop.md) y [ADR 009](../../docs/adr/009-mapa-conocimiento-desktop-only.md).
