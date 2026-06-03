# ADR 004: PWA e instalación (standalone)

## Estado

Aceptado — 2026-06-03

## Contexto

La app debe instalarse en iOS/Android con ícono en pantalla de inicio, al nivel de experiencia de *Vías de Escalada Córdoba*, sin replicar el modelo offline de negocio (ADR 001).

## Decisión

1. **`isInstalledMode` / instalada** = solo **standalone** (ícono de inicio), no “instalada en Chrome” en pestaña.
2. **Etiqueta bajo ícono:** `APP Estudio` → `lib/pwa-home-label.ts` (`PWA_HOME_ICON_LABEL`).
3. **Manifest:** `app/manifest.ts`; íconos en `public/icon-*.png` + `app/icon.png` / `apple-icon.png`.
4. **Android:** `InstallPwaButton` + `beforeinstallprompt`; feedback post-instalación (~5,5 s).
5. **iOS:** `IosPwaInstallHelp` (Safari, Agregar a inicio); sin botón de prompt nativo.
6. **On-device en navegador:** `usePwaOnDeviceInBrowser` + cartel verde Android (`AndroidOpenFromHomeHelp`) cuando la PWA está en el dispositivo pero se abrió en pestaña.
7. **Persistencia:** `pwa-ever-standalone-v1` al abrir desde ícono; iOS no usa solo “datos cargados” como señal de instalación.
8. **Links externos** no abren standalone automáticamente.

## Consecuencias

- Probar instalación con `npm run build` && `npm start` (HTTPS o localhost).
- PWA desactivada en `npm run dev`.
