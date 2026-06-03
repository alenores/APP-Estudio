<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Arquitectura (obligatorio)

Antes de cambiar Supabase, PWA, home o capas del frontend, leer **en este orden**:

| Documento | Contenido |
|---|---|
| `docs/adr/000-como-trabajamos.md` | Flujo con IA, un solo usuario, comentarios |
| `docs/adr/001-online-first-sin-paquete-offline.md` | Sin paquete offline de tablas |
| `docs/adr/002-supabase-schema-contract.md` | Nombres exactos de tablas/columnas (borrador) |
| `docs/adr/003-frontend-layer-separation.md` | Hook vs page vs components |
| `docs/adr/004-pwa-install-standalone.md` | Instalación, standalone, APP Estudio |

**No** copiar ADR 001 offline ni `useOfflineData` de *Vías de Escalada Córdoba*.

## Reglas rápidas

### Datos (ADR 001 + 002)

- Online-first; Supabase en red; **NetworkOnly** para API Supabase en SW.
- Schema: nombres **exactos** cuando exista ADR 002; sin heurísticas de columnas.

### PWA (ADR 004)

- `isInstalledMode` = **solo standalone**.
- Etiqueta inicio: **`APP Estudio`** (`lib/pwa-home-label.ts`).
- Install UI separada de hooks de datos de negocio.

### Capas (ADR 003)

| Qué | Dónde |
|---|---|
| Ping / cliente Supabase | `lib/supabase.ts`, `lib/supabase-health.ts` |
| Validación Zod | `lib/validations.ts` |
| Install PWA | `lib/pwa-*.ts`, `app/install-pwa-button.tsx`, `components/*` |
| Home | `app/page.tsx` |

## Mapa de archivos clave

```
app/page.tsx                    → home semilla
app/manifest.ts                 → PWA manifest
app/install-pwa-button.tsx      → Android install
app/hooks/usePwaOnDeviceInBrowser.ts
lib/supabase.ts                 → cliente
lib/supabase-health.ts          → ping auth health
lib/validations.ts              → Zod (fase 2)
next.config.ts                  → next-pwa online-first
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
