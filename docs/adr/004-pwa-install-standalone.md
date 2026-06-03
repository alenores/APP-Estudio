# ADR 004: PWA e instalación (standalone)

## Estado

Aceptado — 2026-06-03 (actualizado tras incidente install 2026-06-03)

## Contexto

La app debe instalarse en iOS/Android con ícono en pantalla de inicio, al nivel de experiencia de *Vías de Escalada Córdoba*, sin replicar el modelo offline de negocio (ADR 001).

## Decisión

1. **`isInstalledMode` / instalada** = solo **standalone** (ícono de inicio), no “instalada en Chrome” en pestaña.
2. **Etiqueta bajo ícono:** `APP Estudio` → `lib/pwa-home-label.ts` (`PWA_HOME_ICON_LABEL`).
3. **Manifest:** `app/manifest.ts`; íconos en `public/icon-*.png` + `app/icon.png` / `apple-icon.png`.
4. **Build:** `npm run icons` antes de `next build` (íconos en cada deploy Vercel).
5. **Android:** `InstallPwaButton` + `beforeinstallprompt`; feedback post-instalación (~5,5 s).
6. **iOS:** `IosPwaInstallHelp` (Safari, Agregar a inicio); sin botón de prompt nativo.
7. **On-device en navegador:** `usePwaOnDeviceInBrowser` + cartel verde Android (`AndroidOpenFromHomeHelp`) cuando la PWA está en el dispositivo pero se abrió en pestaña.
8. **Persistencia:** `pwa-ever-standalone-v1` al abrir desde ícono; iOS no usa solo “datos cargados” como señal de instalación.
9. **Links externos** no abren standalone automáticamente.
10. **Middleware auth (Supabase):** excluir del matcher `sw.js`, `workbox-`, `fallback-`, `manifest.webmanifest` e imágenes estáticas — el SW no debe pasar por sesión Supabase.
11. **Deploy público:** Production en Vercel **sin** Vercel Authentication (Deployment Protection). Seguridad de datos = RLS Supabase (ADR 005), no ocultar el sitio con login Vercel.
12. **Versión visible:** `DeployShaFooter` + `NEXT_PUBLIC_DEPLOY_SHA` (commit corto en build).

### Código compartido con otras apps (congelado salvo pedido)

Los siguientes archivos replican la arquitectura de otras PWAs del dueño (*Vías de Escalada Córdoba*, etc.). **No modificarlos** al diagnosticar fallos de instalación salvo instrucción explícita:

- `app/install-pwa-button.tsx`
- `lib/pwa-platform.ts`, `lib/pwa-on-device.ts`, `lib/pwa-home-label.ts`
- `components/ios-pwa-install-help.tsx`, `components/android-open-from-home-help.tsx`
- `app/hooks/usePwaOnDeviceInBrowser.ts`

### Diagnóstico «no instala» / botón deshabilitado

Orden obligatorio (detalle en [`docs/pwa-arranque-checklist.md`](../pwa-arranque-checklist.md)):

1. URLs anónimas **200** (`/`, manifest, íconos, `/sw.js`) — si **401**, Vercel Deployment Protection.
2. Íconos generados en build.
3. Middleware no intercepta SW/Workbox.
4. Atajo manual previo / navegador in-app.
5. **No** reescribir UX del botón.

El botón con `disabled={!installPrompt}` es **correcto** cuando Chrome no dispara `beforeinstallprompt`; no indica bug en el componente.

## Consecuencias

- Probar instalación con `npm run build` && `npm start` (HTTPS o localhost).
- PWA desactivada en `npm run dev`.
- Nuevo proyecto: seguir checklist completo en `docs/pwa-arranque-checklist.md` antes del primer deploy productivo.
