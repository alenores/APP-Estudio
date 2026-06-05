# Desktop — shell explorador PC

UI **exclusiva del shell escritorio**: ruta `/explorador`, detección automática vía middleware (ADR 008).

## Contenido

| Archivo | Rol |
|---------|-----|
| `desktop-shell.tsx` | Layout PC, sign-out, header |
| `desktop-modal.tsx` | Modal portal genérico |
| `explorador-view.tsx` | Orquestador 3 columnas + teclado |
| `explorador-columns.tsx` | Columnas y cards |
| `explorador-toolbar.tsx` | Alta tema/curso/clase |
| `explorador-*-modal.tsx` | Alta, edición, paneles seguimiento/conceptos |

## Reglas

1. **No** importar desde `components/mobile/`.
2. **Sí** importar forms desde `components/shared/forms/`, primitivos desde `components/ui/`.
3. Selección de entidad vía query `?tema=&curso=&clase=` (`useEstudioExplorer`).
4. Atajos: `useExploradorKeyboard` (↑↓ ←→ Enter E S C).

Ver [ADR 008](../../docs/adr/008-dual-shell-mobile-desktop.md).
