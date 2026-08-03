/**
 * Contrato de shells offline (ADR 012).
 *
 * El paquete local (ADR 001) vive en `localStorage`, pero para leerlo hace falta
 * que el documento HTML de la ruta se pueda servir sin red. Los detalles
 * (`/temas/12`, `/clases/840`) son rutas dinámicas: no se pueden precachear una
 * por una. Se cachea **una shell por familia** y el id real se lee de la URL.
 *
 * Este módulo lo importan la app (warm-up) y `worker/index.js` (service worker):
 * mantenerlo puro — sin React, sin DOM, sin imports de app.
 */

/** Caché propia de documentos; no la administra Workbox. */
export const OFFLINE_SHELL_CACHE = "app-estudio-shell-v1";

/** Documento precacheado por next-pwa (`fallbacks.document`). */
export const OFFLINE_FALLBACK_PATH = "/offline";

/** Tope de documentos exactos guardados (las shells de familia no cuentan). */
export const OFFLINE_SHELL_MAX_DOCS = 60;

export type OfflineShellFamily = {
  /** Prefijo de la familia de detalle (`/temas` cubre `/temas/12`). */
  prefix: string;
  /** Clave sintética en la caché — no es una URL navegable de la app. */
  key: string;
};

/** Familias de detalle con id en la ruta (móvil académico + desarrollos). */
export const OFFLINE_SHELL_FAMILIES: OfflineShellFamily[] = [
  { prefix: "/temas", key: "/__shell/temas" },
  { prefix: "/cursos", key: "/__shell/cursos" },
  { prefix: "/clases", key: "/__shell/clases" },
  { prefix: "/definicion-general", key: "/__shell/definicion-general" },
  { prefix: "/definicion-especifica", key: "/__shell/definicion-especifica" },
  { prefix: "/acciones", key: "/__shell/acciones" },
];

/** Solo detalle plano: `/temas/12` sí, `/temas/12/cursos/nuevo` no. */
const DETALLE_PATH_RE = /^(\/[a-z-]+)\/(\d+)$/;

export function offlineShellFamilyForPath(
  pathname: string,
): OfflineShellFamily | null {
  const match = DETALLE_PATH_RE.exec(pathname);
  if (!match) return null;
  return OFFLINE_SHELL_FAMILIES.find((f) => f.prefix === match[1]) ?? null;
}

/**
 * Id de entidad según la URL real del navegador.
 * Sin conexión la shell puede venir de otro id: la ruta manda, no los params.
 */
export function entityIdFromPathname(pathname: string): number | null {
  const match = DETALLE_PATH_RE.exec(pathname);
  if (!match) return null;
  const id = Number(match[2]);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Documentos que no se guardan: auth, API y login (dependen de sesión/red). */
export function isCacheableDocumentPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/auth/")) return false;
  if (pathname === "/login") return false;
  return true;
}

/** Clave de caché de un documento: ruta sin query (la vista lee la URL real). */
export function documentCacheKey(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}
