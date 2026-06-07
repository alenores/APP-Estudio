# Mapa de conocimiento (solo PC)

Módulo **desktop-only** (ADR 009). Nodos objetivo, temas y enlaces del grafo — **no** la tabla `conceptos` de estudio.

| Fase | Archivos |
|------|----------|
| 1 | `mapa-nodos-view.tsx`, `mapa-nodo-form.tsx` — ABM lista |
| 2 | `mapa-canvas.tsx`, `mapa-nodo-node.tsx` — lienzo React Flow |
| 3 | `lib/mapa-flow-edges.ts` — flechas onConnect / Delete |
| 4 | `mapa-timeline-guides.tsx`, `lib/mapa-grid-bounds.ts`, MiniMap |
| 5 | `lib/mapa-nodo-ui.ts` — badges enlaces, selección |
| 7 | `lib/mapa-objetivo.ts`, `mapa-objetivo-ui.tsx` — color/filtro/leyenda por objetivo |
| 9b | Lienzo dual: `mapa-tema-node.tsx`, `useMapaGrafo`, `lib/temas-lienzo-queries.ts` |

Datos: `useMapaGrafo(modo)` — `nodos`/`temas`, `enlaces`, `objetivos` (solo modo nodos).

SQL: `002` mapa, `003` objetivos, `005` nodos_objetivos, `006` enlaces_temas, `007` posición temas.
