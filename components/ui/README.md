# UI — primitivos presentacionales

Componentes **sin lógica de negocio** ni llamadas a Supabase. Consumen tokens CSS (`--td-*`, `--paper`, `--accent`, etc.) definidos en `app/globals.css`.

## Contenido

| Archivo | Exports |
|---------|---------|
| `form-controls.tsx` | `FormField`, `FormInput`, `FormSelect`, `FormTextarea` |
| `form-actions.tsx` | `FormSubmitButton`, `FormError`, `SecondaryButton` |
| `button-links.tsx` | `PrimaryButtonLink`, `SecondaryButtonLink`, `AddEntityLink`, `TextLink` |
| `page-chrome.tsx` | `SurfaceCard`, `PageTitle`, `PageLead`, `LoadingText`, `AlertText`, `EmptyState` |
| `platform-link-icon.tsx` | `PlatformLinkIcon` |
| `mini-card.tsx` | `MiniCard`, `TD_MINI_CARD_TITLE` |
| `index.ts` | Barrel de formularios y chrome de página |

## Reglas

1. **No** importar desde `components/mobile/` ni `components/desktop/`.
2. **Sí** importar helpers puros de `lib/` (ej. `platform-from-link`).
3. Forms de entidad viven en `components/shared/forms/` — no aquí.
4. Shell wrappers (`StudySheet`, `DesktopModal`) viven en `mobile/` y `desktop/`.

Ver [ADR 008](../../docs/adr/008-dual-shell-mobile-desktop.md) §5.
