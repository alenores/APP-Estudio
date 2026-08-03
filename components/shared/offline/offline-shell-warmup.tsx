"use client";

import { useEffect } from "react";
import { readEstudioOfflineCache } from "@/lib/estudio-offline-cache";
import { readDesarrollosOfflineCache } from "@/lib/desarrollos-offline-cache";
import {
  OFFLINE_SHELL_CACHE,
  OFFLINE_SHELL_FAMILIES,
  documentCacheKey,
} from "@/lib/pwa-offline-shell";

/**
 * Deja lista una shell por familia de detalle mientras hay red (ADR 013).
 *
 * Sin esto, `/temas/12` solo abre sin conexión si esa pantalla exacta se visitó
 * antes. Con esto alcanza con haber abierto la app conectado una vez.
 */

/** Documentos de entrada que se aseguran en caché aunque no se hayan visitado. */
const RUTAS_BASE = ["/", "/temas", "/desarrollos", "/pendientes"];

const SHA_KEY = "app-estudio-shell-warmup-sha-v1";

let warmupEnCurso = false;

export function OfflineShellWarmup() {
  useEffect(() => {
    const warm = () => {
      void warmupShells();
    };

    warm();
    window.addEventListener("online", warm);
    return () => window.removeEventListener("online", warm);
  }, []);

  return null;
}

/** Un `/temas/<id>` real por familia, tomado del paquete local ya descargado. */
function rutasEjemploPorFamilia(): Map<string, string> {
  const estudio = readEstudioOfflineCache();
  const desarrollos = readDesarrollosOfflineCache();

  const primeros: Array<[string, number | undefined]> = [
    ["/temas", estudio?.temas[0]?.id],
    ["/cursos", estudio?.cursos[0]?.id],
    ["/clases", estudio?.clases[0]?.id],
    ["/definicion-general", desarrollos?.definicion_general[0]?.id],
    ["/definicion-especifica", desarrollos?.definicion_especifica[0]?.id],
    ["/acciones", desarrollos?.acciones[0]?.id],
  ];

  const rutas = new Map<string, string>();
  for (const [prefix, id] of primeros) {
    if (typeof id === "number") rutas.set(prefix, `${prefix}/${id}`);
  }
  return rutas;
}

async function warmupShells(): Promise<void> {
  if (warmupEnCurso) return;
  if (typeof window === "undefined") return;
  if (!("caches" in window) || !("serviceWorker" in navigator)) return;
  if (!navigator.onLine) return;

  warmupEnCurso = true;
  try {
    await navigator.serviceWorker.ready;
    const cache = await caches.open(OFFLINE_SHELL_CACHE);

    // Deploy nuevo: las shells viejas apuntan a chunks viejos, se rehacen.
    const sha = process.env.NEXT_PUBLIC_DEPLOY_SHA ?? "";
    let forzar = false;
    try {
      forzar = window.localStorage.getItem(SHA_KEY) !== sha;
    } catch {
      /* sin localStorage: warm-up normal */
    }

    const ejemplos = rutasEjemploPorFamilia();

    for (const ruta of RUTAS_BASE) {
      await guardarDocumento(cache, ruta, documentCacheKey(ruta), forzar);
    }

    for (const familia of OFFLINE_SHELL_FAMILIES) {
      const ruta = ejemplos.get(familia.prefix);
      if (!ruta) continue;
      await guardarDocumento(cache, ruta, familia.key, forzar);
    }

    try {
      window.localStorage.setItem(SHA_KEY, sha);
    } catch {
      /* ignore */
    }
  } catch {
    // Warm-up best-effort: sin red o sin permisos de caché no rompe la app.
  } finally {
    warmupEnCurso = false;
  }
}

async function guardarDocumento(
  cache: Cache,
  ruta: string,
  clave: string,
  forzar: boolean,
): Promise<void> {
  try {
    if (!forzar && (await cache.match(clave))) return;

    const response = await fetch(ruta, {
      credentials: "include",
      headers: { Accept: "text/html" },
    });
    // Redirección = middleware mandó a /login o al shell de PC: no es shell válida.
    if (!response.ok || response.redirected) return;

    await cache.put(clave, response);
  } catch {
    /* una shell que falla no bloquea las demás */
  }
}
