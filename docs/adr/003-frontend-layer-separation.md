# ADR 003: Separación lógica / UI en el frontend

## Estado

Aceptado — 2026-06-03

## Decisión

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Datos / API** | `lib/`, `app/hooks/` | Supabase, health checks, validación Zod compartida |
| **Instalación PWA** | `lib/pwa-*.ts`, `app/install-pwa-button.tsx`, `components/*-install*`, `app/hooks/usePwaOnDeviceInBrowser.ts` | Standalone, banners install — **sin** Supabase |
| **Página** | `app/page.tsx` (y rutas futuras) | Componer UI; delgada |
| **Presentación** | `components/` | JSX; sin fetch directo a Supabase (salvo helpers puros) |
| **Formularios** | `components/study/forms/` + `lib/validations.ts` | UI + Zod; `insert*` vía `lib/estudio-queries.ts` |
| **Alta de hijos** | `StudySheet` en página padre | Curso, clase, seguimiento **sin** ruta `/nuevo` dedicada |

### Reglas

1. **No** agregar en `page.tsx` lógica pesada de negocio ni queries largas → hooks o `lib/`.
2. **No** mezclar instalación PWA dentro de hooks de datos de Platzi.
3. Componentes en `components/` sin `createClient` salvo casos documentados.
4. **Alta contextual** (curso bajo tema, clase bajo curso, seguimiento bajo tema/curso/clase): abrir `StudySheet` en la página de detalle del padre; al guardar, `reload({ silent: true })` del hook y cerrar sheet — **no** `router.replace` al hijo creado. El usuario entra al detalle del hijo solo si toca la card en el listado.
5. **Nuevo tema** desde listado: sigue en `/temas/nuevo` (raíz del árbol). Rutas `/…/nuevo` antiguas redirigen al padre.

## Consecuencias

- Refactors de UI no deben romper contratos de datos sin revisar ADR 002.
- Nuevos colaboradores/IA: leer ADR 000–005 y `AGENTS.md` antes de features.
- Campos de progreso en detalle tema/curso/clase: calcular en `lib/` desde `seguimientos` (ADR 002), no duplicar en tablas padre.
