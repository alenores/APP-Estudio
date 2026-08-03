/**
 * Custom worker de next-pwa (ADR 012).
 *
 * Se importa con `importScripts` antes de las rutas de Workbox, así este
 * listener de `fetch` atiende primero las navegaciones (documentos HTML).
 * Todo lo demás (chunks, css, Supabase, API) sigue en manos de Workbox.
 *
 * Estrategia de documento: red primero (4 s) → documento exacto en caché →
 * shell de la familia (`/temas/12` se sirve con la shell de `/temas/*`) →
 * `/offline`.
 */

import {
  OFFLINE_FALLBACK_PATH,
  OFFLINE_SHELL_CACHE,
  OFFLINE_SHELL_MAX_DOCS,
  documentCacheKey,
  isCacheableDocumentPath,
  offlineShellFamilyForPath,
} from "../lib/pwa-offline-shell";

const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.mode !== "navigate") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(handleNavigation(event, request, url));
});

async function handleNavigation(event, request, url) {
  const cache = await caches.open(OFFLINE_SHELL_CACHE);

  const network = fetch(request).then((response) => {
    event.waitUntil(storeDocument(cache, url, response.clone()));
    return response;
  });

  const raced = await Promise.race([
    network.then((response) => ({ kind: "network", response })).catch(() => ({ kind: "failed" })),
    delay(NETWORK_TIMEOUT_MS).then(() => ({ kind: "timeout" })),
  ]);

  if (raced.kind === "network") return raced.response;

  const cached = await matchDocument(cache, url);
  if (cached) {
    if (raced.kind === "timeout") event.waitUntil(network.catch(() => {}));
    return cached;
  }

  if (raced.kind === "timeout") {
    try {
      return await network;
    } catch {
      /* sin caché y sin red: cae al fallback */
    }
  }

  const fallback = await caches.match(OFFLINE_FALLBACK_PATH, { ignoreSearch: true });
  return fallback || Response.error();
}

/** Documento exacto de la ruta; si no está, shell de la familia de detalle. */
async function matchDocument(cache, url) {
  const exact = await cache.match(documentCacheKey(url.pathname));
  if (exact) return exact;

  const family = offlineShellFamilyForPath(url.pathname);
  if (!family) return null;
  return (await cache.match(family.key)) || null;
}

async function storeDocument(cache, url, response) {
  if (!response || !response.ok || response.redirected) return;
  if (response.type !== "basic") return;
  if (!isCacheableDocumentPath(url.pathname)) return;

  await cache.put(documentCacheKey(url.pathname), response.clone());

  const family = offlineShellFamilyForPath(url.pathname);
  if (family) await cache.put(family.key, response.clone());

  await trimDocuments(cache);
}

/** Poda FIFO de documentos exactos; las shells de familia nunca se borran. */
async function trimDocuments(cache) {
  const keys = await cache.keys();
  const removable = keys.filter(
    (request) => !new URL(request.url).pathname.startsWith("/__shell/"),
  );
  const excess = removable.length - OFFLINE_SHELL_MAX_DOCS;
  for (let i = 0; i < excess; i += 1) {
    await cache.delete(removable[i]);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
