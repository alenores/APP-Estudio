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
| **Formularios (fase 2)** | `components/forms/` + `lib/validations.ts` | UI + esquemas Zod |

### Reglas

1. **No** agregar en `page.tsx` lógica pesada de negocio ni queries largas → hooks o `lib/`.
2. **No** mezclar instalación PWA dentro de hooks de datos de Platzi.
3. Componentes en `components/` sin `createClient` salvo casos documentados.

## Consecuencias

- Refactors de UI no deben romper contratos de datos sin revisar ADR 002.
- Nuevos colaboradores/IA: leer ADR 000–004 y `AGENTS.md` antes de features.
