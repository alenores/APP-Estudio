# ADR 003: Separación lógica / UI en el frontend

## Estado

Aceptado — 2026-06-03

## Decisión

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Paquete local** | `lib/estudio-offline-cache.ts`, `lib/estudio-offline-read.ts`, `useEstudioData` | Snapshot, MAX(id), Actualizar |
| **Datos / API** | `lib/estudio-queries.ts`, hooks de detalle | Inserts y sync remoto; **lectura** desde cache en hooks |
| **Instalación PWA** | `lib/pwa-*.ts`, `app/install-pwa-button.tsx`, `components/mobile/pwa/*`, `app/hooks/usePwaOnDeviceInBrowser.ts` | Standalone, banners install — **sin** Supabase |
| **Página** | `app/page.tsx` (y rutas futuras) | Componer UI; delgada |
| **Presentación** | `components/ui/`, `components/shared/`, `components/mobile/`, `components/desktop/` | JSX; sin fetch directo a Supabase (salvo helpers puros) |
| **Formularios** | `components/shared/forms/` + `lib/validations.ts` | UI + Zod; `insert*` vía `lib/estudio-queries.ts` |
| **Alta de hijos** | `StudySheet` (`components/mobile/sheets/`) en página padre | Curso, clase, seguimiento **sin** ruta `/nuevo` dedicada |

### Reglas

1. **No** agregar en `page.tsx` lógica pesada de negocio ni queries largas → hooks o `lib/`.
2. **No** mezclar instalación PWA dentro de hooks de datos de Platzi.
3. Componentes en `components/` sin `createClient` salvo casos documentados.
4. **Lectura en pantallas de negocio:** hooks (`useTemasList`, `useTemaDetalle`, …) leen el snapshot; **no** `useEffect` con `list*` de Supabase al montar (ADR 001). Excepción: `ExternalLinkPreview` / `/api/link-preview`.
5. **Alta contextual** (curso bajo tema, clase bajo curso, seguimiento bajo tema/curso/clase): abrir `StudySheet` en la página de detalle del padre; al guardar, `refreshSnapshot()` / `reload` del hook y cerrar sheet — **no** `router.replace` al hijo creado. El usuario entra al detalle del hijo solo si toca la card en el listado.
6. **Nuevo tema** desde listado: sigue en `/temas/nuevo` (raíz del árbol). Rutas `/…/nuevo` antiguas redirigen al padre.
7. **`StudySheet` sin slide del panel** (Chrome Android no anima bien `transform` al abrir). Permitido: fade del velo (`.sheet-backdrop-enter`), vibración corta al abrir, panel flotante instantáneo. **No** WAAPI, `retained`, ni `translateY` animado en el sheet — mismo criterio que el FAB sin escalonado.
8. **FAB → sheet:** `FAB_OPEN_DELAY_MS` (120 ms en `lib/fab-open-delay.ts`) entre el `active` del botón y `onSelect`/abrir sheet; feedback táctil sin animar el panel.
9. **Animaciones en móvil:** ver checklist completo en [ADR 006](006-feedback-ui-movil.md) (qué evitar en Android y qué patrón usar).

## Consecuencias

- Refactors de UI no deben romper contratos de datos sin revisar ADR 002.
- Nuevos colaboradores/IA: leer ADR 000–007 y `AGENTS.md` antes de features.
- Campos de progreso en detalle tema/curso/clase: calcular en `lib/` desde `seguimientos` (ADR 002), no duplicar en tablas padre.
