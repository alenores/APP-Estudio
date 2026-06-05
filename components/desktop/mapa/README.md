# Mapa de conocimiento (solo PC)

Módulo **desktop-only** (ADR 009). Nodos y enlaces del grafo — **no** la tabla `conceptos` de estudio.

| Fase | Archivos |
|------|----------|
| 1 | `mapa-nodos-view.tsx`, `mapa-nodo-form.tsx` — ABM lista |
| 2 | `mapa-canvas.tsx`, `mapa-nodo-node.tsx` — lienzo React Flow |
| 3 | `lib/mapa-flow-edges.ts` — flechas onConnect / Delete |

Datos: `useMapaNodos`, `lib/mapa-queries.ts`.
