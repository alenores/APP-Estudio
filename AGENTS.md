<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Arquitectura (obligatorio)

Antes de cambiar Supabase, PWA, home o capas del frontend, leer **en este orden**:

| Documento | Contenido |
|---|---|
| `docs/adr/000-como-trabajamos.md` | Flujo con IA, un solo usuario, comentarios |
| `docs/adr/001-paquete-local-consulta.md` | **Paquete local** + botón Actualizar (lectura desde snapshot) |
| `docs/adr/007-detection-novedades-ultimo-id.md` | Detección novedades (id + digest contenido) |
| `docs/adr/002-supabase-schema-contract.md` | Nombres exactos de tablas/columnas (borrador) |
| `docs/adr/003-frontend-layer-separation.md` | Hook vs page vs components |
| `docs/adr/004-pwa-install-standalone.md` | Instalación, standalone, APP Estudio |
| `docs/adr/005-auth-rls.md` | Auth, `user_id`, RLS |
| `docs/adr/006-feedback-ui-movil.md` | **Animaciones / feedback en Android** (delay FAB, sheet sin slide) |
| `docs/adr/008-dual-shell-mobile-desktop.md` | **Dos shells** móvil vs PC (no responsive; middleware) |
| `docs/adr/009-mapa-conocimiento-desktop-only.md` | **Mapa de conocimiento** — solo PC; nodos ≠ conceptos |
| `docs/pwa-arranque-checklist.md` | **Checklist obligatorio** PWA + Vercel antes del primer deploy |

**Patrón de datos:** inspirado en *Vías de Escalada Córdoba* (`offline-cache`, `useOfflineData`), adaptado a tablas Estudio — **no** copiar imágenes ni warm de sectores.

Schema SQL: `docs/sql/001-schema-estudio.sql` (estudio); `docs/sql/002-schema-mapa-conocimiento.sql` (mapa PC).

## Reglas rápidas

### Datos (ADR 001 + 002 + 007)

- **Lectura en UI:** snapshot `localStorage` vía `useEstudioData` + `lib/estudio-offline-read.ts`.
- **Red:** `downloadEstudioSnapshot`, `checkEstudioUpdatesAvailable`, altas en `lib/estudio-queries.ts`.
- **Excepción en red:** previews de links (`ExternalLinkPreview`, `/api/link-preview`).
- Schema: nombres **exactos** ADR 002; sin heurísticas de columnas.
- SW: **NetworkOnly** para `*.supabase.co` (el paquete no es caché del SW).

### PWA (ADR 004)

- `isInstalledMode` = **solo standalone**.
- Etiqueta inicio: **`APP Estudio`** (`lib/pwa-home-label.ts`).
- Install UI separada de hooks de datos de negocio.
- **Production Vercel:** sin Vercel Authentication (Deployment Protection); comprobación anónima 200 en manifest/íconos/sw.js — ver `docs/pwa-arranque-checklist.md`.
- No reescribir `InstallPwaButton` al diagnosticar install.

### Feedback UI móvil (ADR 006)

Antes de animar modales, FAB o menús: leer `docs/adr/006-feedback-ui-movil.md`. Por defecto: **`active:scale-95` + `FAB_OPEN_DELAY_MS`** en el botón; sheet con panel instantáneo y fade del velo; **no** slide del panel ni WAAPI al abrir en Android.

### Capas (ADR 003)

| Qué | Dónde |
|---|---|
| Delay toque → sheet | `lib/fab-open-delay.ts` |
| Snapshot + sync | `lib/estudio-offline-cache.ts`, `lib/estudio-offline-read.ts` |
| Contexto datos | `app/hooks/useEstudioData.tsx`, `components/shared/data/estudio-data-root.tsx` |
| Listado / detalle | `useTemasList`, `useTemaDetalle`, `useCursoDetalle`, `useClaseDetalle`, `use*DetalleMetrics` |
| Altas Supabase | `lib/estudio-queries.ts` (insert/update/delete) + `refreshSnapshot` tras éxito |
| Validación Zod | `lib/validations.ts` |
| Derivados de seguimiento | `lib/seguimiento-derivados.ts` |
| Tipos padre form | `lib/form-parent-types.ts` |
| Auth | login + `lib/supabase/client.ts` |
| Install PWA | `lib/pwa-*.ts`, `app/install-pwa-button.tsx`, `components/mobile/pwa/` |
| Detalle móvil tema/curso/clase | `components/mobile/detalle/` |
| Shell escritorio + explorador | `app/(desktop)/`, `components/desktop/`, `lib/shell-*.ts`, `useEstudioExplorer` |
| Mapa conocimiento (solo PC) | `app/(desktop)/mapa/`, `components/desktop/mapa/`, `lib/mapa-queries.ts`, `lib/temas-lienzo-queries.ts`, `useMapaGrafo` |
| Primitivos UI | `components/ui/` |
| Forms compartidos | `components/shared/forms/` |

## Mapa de archivos clave

```
app/page.tsx                         → home + enlace a temas
app/layout.tsx                       → EstudioDataRoot (provider global)
app/login/page.tsx                   → auth
app/temas/page.tsx                   → listado + EstudioSyncBanner
app/temas/nuevo/page.tsx             → alta tema
app/temas/[id]/page.tsx              → detalle tema (móvil)
app/cursos/[id]/page.tsx             → detalle curso (móvil)
app/clases/[id]/page.tsx             → detalle clase (móvil)
app/(desktop)/explorador/page.tsx    → explorador 3 columnas (PC)
app/(desktop)/mapa/page.tsx          → mapa conocimiento (solo PC, ADR 009)
lib/shell-detect.ts                  → detección shell en middleware
lib/shell-routes.ts                  → rutas por shell (+ DESKTOP_MAPA_PREFIX)
lib/mapa-queries.ts                  → CRUD nodos_objetivos / enlaces_nodos
lib/temas-lienzo-queries.ts          → CRUD enlaces_temas + posición temas (lienzo)
lib/mapa-lienzo-types.ts             → MapaGrafoModo, LienzoPosicionable
lib/mapa-grafo-enlaces.ts            → conteo enlaces compartido
lib/mapa-objetivo.ts                 → color/filtro por nodos_objetivos.objetivo_id
lib/nodo-cursos-stats.ts             → donut cursos por nodo (explorador)
app/hooks/useNodosObjetivos.ts       → catálogo nodos para explorador PC
app/hooks/useMapaGrafo.ts            → datos mapa dual (separado de useEstudioData)
app/hooks/useMapaNodos.ts            → wrapper nodos (compat)
lib/form-parent-types.ts             → ConceptoParent, SeguimientoParent
app/hooks/useEstudioExplorer.ts      → árbol temas/cursos/clases (PC)
app/hooks/useExploradorKeyboard.ts   → atajos teclado explorador
components/ui/                       → primitivos presentacionales
components/shared/forms/             → forms entidad (móvil + PC)
components/shared/data/              → EstudioDataRoot
components/shared/sync/              → EstudioSyncBanner
components/mobile/                   → shell, sheets, FAB, detalle, PWA
components/desktop/                  → explorador, modales, toolbar
lib/explorer-card-meta.ts            → métricas compactas cards PC
lib/estudio-detalle-metrics.ts       → métricas gauge/timeline/tiempo
lib/estudio-offline-cache.ts         → snapshot + firma remota + download
lib/estudio-offline-read.ts          → lectura local derivados
app/hooks/useEstudioData.tsx         → contexto paquete local
lib/estudio-queries.ts               → sync remoto + CRUD
middleware.ts                        → protege /temas, /seguimientos
next.config.ts                       → PWA; NetworkOnly Supabase
```

## Comandos

```bash
npm install
npm run icons    # generar PNG desde design/ o default
npm run dev      # PWA off
npm run build
npm start        # probar PWA + install
```

## Build y PWA

- Dev: `npm run dev` (PWA desactivada).
- `public/sw.js`, `workbox-*.js`, `fallback-*.js` se generan en build — **no commitear**.

## Convención de commits

Mensajes en español, imperativo breve. Cambios de reglas → actualizar ADR en el mismo cambio.

## Flujo del agente (automatización)

Política de este repo (no pedir confirmación para cerrar tareas de implementación):

| Qué | Cómo |
|-----|------|
| Modo de chat | **Agent** para implementar; Ask solo para preguntas/review. |
| Git al terminar | build si tocó app → **commit + push** sin preguntar. |
| Pedidos vs ADR | Si violan ADR vigente, avisar; paquete local **sí** está en ADR 001 actual. |
| Alcance | `.cursor/rules/scope-minimal.mdc` |

Excepciones (sí pedir confirmación): `git push --force`, `reset --hard`, rebase destructivo, borrado masivo, alcance ambiguo.
