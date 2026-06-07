# ADR 010: Lienzo detalle — capa 1 (hijos)

## Estado

Aceptado — 2026-06-04 (v1 simplificada)

## Contexto

El mapa macro (capa 0) muestra `nodos_objetivos` o `temas` con enlaces. Se necesita **entrar en detalle** sin salir de `/mapa`: ver hijos del ítem tocado en una superficie **por encima** del lienzo anterior.

## Decisión (v1)

### Comportamiento

| Entrada (capa 0) | Hijos en capa 1 |
|------------------|-----------------|
| Tema | Cursos (`cursos.tema_id`) |
| Nodo tipo `formacion` | Cursos + registros `logros` |
| Nodo tipo `produccion` | Registros `logros` (`logros.nodo_id`) |

- **Click** en card del lienzo → abre overlay detalle.
- **Editar** (botón) → modal existente; no abre detalle.
- **Esc** o «Volver al mapa» → cierra capa 1.
- Sin enlaces entre hijos en v1 (grilla React Flow, posición automática).
- Sin columnas `pos_x` en cursos/logros en v1.

### Capas frontend

| Qué | Dónde |
|-----|-------|
| Tipos scope/hijos | `lib/mapa-detalle-types.ts` |
| Queries (online) | `lib/mapa-detalle-queries.ts` |
| Grilla / IDs Flow | `lib/mapa-detalle-layout.ts` |
| Hook datos | `app/hooks/useMapaDetalleHijos.ts` |
| Overlay | `components/desktop/mapa/mapa-detalle-overlay.tsx` |
| Lienzo hijos | `components/desktop/mapa/mapa-detalle-canvas.tsx` |
| Node UI | `components/desktop/mapa/mapa-hijo-node.tsx` |
| Orquestación | `mapa-nodos-view.tsx` + `onOpenDetalle` en `mapa-canvas.tsx` |

**No** incluir en `useEstudioData` ni offline pack (ADR 009).

### Fuera de alcance v1

- Tabla `enlaces_cursos` y flechas entre hijos.
- Persistir posición de cursos/logros en lienzo detalle.
- URL `?detalle=` (fase posterior).

## Consecuencias

- Capa 0 sin cambios de schema.
- Logros en detalle requieren SQL 009 + 010 ejecutados en Supabase.

## Referencias

- [ADR 009](009-mapa-conocimiento-desktop-only.md) — mapa macro
- [ADR 002](002-supabase-schema-contract.md) — `cursos`, `logros`
