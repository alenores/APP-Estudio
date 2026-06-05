# Shared — UI cross-shell

Componentes usados por **móvil y escritorio** (o por el layout global). Pueden leer `useEstudioData` y escribir vía `lib/estudio-queries.ts`.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `data/` | Provider global del paquete local (`EstudioDataRoot`) |
| `sync/` | Banner «Actualizar» (`EstudioSyncBanner`) |
| `forms/` | Formularios de entidad (tema, curso, clase, seguimiento, concepto) + campos compartidos |
| `cards/` | Card de avance con franja de estado (`EstudioProgressCard`) — móvil detalle + explorador PC |
| `links/` | Preview de links externos (`ExternalLinkPreview`) |

## Reglas

1. **No** importar desde `components/mobile/` ni `components/desktop/`.
2. **Sí** importar primitivos desde `components/ui/`.
3. Tipos de padre de formulario (`ConceptoParent`, `SeguimientoParent`) viven en `lib/form-parent-types.ts` — no duplicar en forms.
4. Tras alta/edición exitosa: `refreshSnapshot()` del contexto (ADR 001).

Ver [ADR 008](../../docs/adr/008-dual-shell-mobile-desktop.md) y [ADR 003](../../docs/adr/003-frontend-layer-separation.md).
