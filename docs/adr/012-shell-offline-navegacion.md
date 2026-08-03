# ADR 012: Shell offline y navegación sin conexión

## Estado

Aceptado — 2026-08-02

## Contexto

El ADR 001 promete consulta sin conexión: el paquete local vive en `localStorage`
y las vistas leen de ahí. Pero para **leer** ese paquete primero tiene que abrir
la pantalla, y el documento HTML lo sirve la red.

Verificación con la app instalada, sin conexión (build de producción, servidor
apagado, Chromium móvil):

| Ruta | Resultado antes de este ADR |
|---|---|
| `/` (start_url) | Abre — la cacheaba la ruta `start-url` de next-pwa |
| `/temas`, `/desarrollos` | **Error de red del navegador** |
| `/temas/12`, `/clases/840` | **Error de red del navegador** |
| `/offline` (fallback) | Nunca se mostraba |

Causas encontradas:

1. `next.config.ts` filtraba el preset `others` de next-pwa — el único que
   cacheaba documentos y payloads RSC. Sin ninguna regla que matchee una
   navegación, Workbox no interviene: no hay caché **ni** fallback (el fallback
   de next-pwa se dispara vía `handlerDidError` de una regla que sí matchee).
2. Los detalles (`/temas/[id]`, `/clases/[id]`) son rutas **dinámicas** (`ƒ` en
   el build): Next no las prefetchea enteras, así que sin red la navegación
   cliente falla y cae en recarga dura contra un documento que no existe en caché.
3. Cachear un documento por id es inviable (miles de clases) y precachearlos,
   imposible: no hay HTML por id en el build.

## Decisión

1. **Los documentos los atiende un custom worker propio** (`worker/index.js`),
   importado antes de las rutas de Workbox. Solo intercepta navegaciones
   (`request.mode === "navigate"`); el resto sigue en Workbox.
   Estrategia: red (4 s) → documento exacto en caché → **shell de la familia** →
   `/offline`.
2. **Una shell por familia de detalle**, no una por id. `/temas/7` se sirve con
   el documento cacheado de cualquier `/temas/<id>`. Es correcto porque las
   páginas son client components: el HTML del servidor es el mismo esqueleto
   para todos los ids y los datos salen del paquete local.
3. **El id lo manda la URL, no los params.** `useRouteEntityId()` lee
   `window.location.pathname`; los params del documento pueden ser de otro id
   cuando se sirvió una shell. Regla: en las páginas de detalle **no** usar
   `useParams()` para el id de negocio.
4. **Warm-up al abrir con red** (`OfflineShellWarmup`): guarda `/`, `/temas`,
   `/desarrollos`, `/pendientes` y una shell por familia, tomando un id real del
   paquete local. Así alcanza con haber abierto la app conectado una vez; no hace
   falta haber visitado antes esa pantalla. Se rehace cuando cambia
   `NEXT_PUBLIC_DEPLOY_SHA`.
5. **Familias cubiertas** (`lib/pwa-offline-shell.ts`): `/temas`, `/cursos`,
   `/clases`, `/definicion-general`, `/definicion-especifica`, `/acciones`.
   Solo detalle plano (`/temas/12`); `/temas/12/cursos/nuevo` **no** es familia:
   crear necesita red y debe mostrar `/offline`.
6. **Cachés de assets separadas y con tope alto**: los chunks compartían la
   caché `static-js-assets` con el preset genérico `.js` (32 entradas / 24 h),
   que desalojaba JavaScript de documentos ya cacheados. Ahora
   `app-static-chunks` (384), `app-static-css` (64), `app-static-media` (fuentes,
   1 año) y `app-rsc-payloads` (`?_rsc=`, con `ignoreVary`).
7. `cacheStartUrl: false`: `/` ya no tiene ruta aparte, la cubre el custom worker.
8. Sigue **NetworkOnly** para `*.supabase.co` (ADR 001 §8): el paquete local es
   lógica de app, no caché del SW.

## Verificación (obligatoria al tocar SW o rutas de detalle)

Con `npm run build && npm start`, abrir la app, y **apagar el servidor**
(no basta con el modo offline del navegador: no siempre corta el fetch del SW).
Debe funcionar: `/` → temas → tema → curso → clase, incluyendo el tab Contenido,
sin haber visitado esas pantallas online.

## Limitaciones conocidas

- Sin conexión cada cambio de pantalla es una **recarga dura** (la navegación
  cliente pide RSC y falla). Se ve un parpadeo; los datos son locales, así que
  es rápido.
- Altas y edición siguen necesitando red (ADR 001 §6): esas rutas muestran
  `/offline`.
- Previews de links (Platzi, YouTube) y el mapa PC no están cubiertos.
- La shell cacheada apunta a los chunks del deploy con el que se guardó; el
  warm-up las rehace al detectar SHA nuevo.

## Archivos

| Qué | Dónde |
|-----|--------|
| Contrato de shells (familias, caché, claves) | `lib/pwa-offline-shell.ts` |
| Custom worker de navegación | `worker/index.js` |
| Reglas de caché de assets y RSC | `next.config.ts` |
| Id desde la URL | `app/hooks/useRouteEntityId.ts` |
| Warm-up con red | `components/shared/offline/offline-shell-warmup.tsx` |
| Fallback | `app/offline/page.tsx` |
