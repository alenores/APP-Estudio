/**
 * Portada del material externo en académico lite (ADR 012).
 *
 * Excepción de red del ADR 001, igual que `ExternalLinkPreview`, pero con dos
 * diferencias que la pantalla lite necesita:
 *
 * 1. **YouTube se resuelve en el cliente.** La miniatura se deriva del id del
 *    video con funciones puras de `lib/link-preview.ts`, sin pedirle nada a
 *    `/api/link-preview`. Es el caso mayoritario y queda instantáneo.
 * 2. **Caché a nivel módulo, compartida entre montajes.** El listado muestra
 *    portadas en cada card; sin esto habría un pedido por card y se repetiría
 *    al filtrar, cambiar de pestaña o cerrar el detalle. El preset `apis` del
 *    service worker guarda solo 16 entradas, así que no alcanza.
 *
 * Los negativos también se cachean: un dominio que no expone `og:image` no se
 * vuelve a pedir en la sesión.
 */

import {
  normalizeHttpUrl,
  youtubeThumbnailUrl,
  youtubeVideoIdFromUrl,
  type LinkPreviewResult,
} from "@/lib/link-preview";

/** `href` normalizado → portada (o `null` si se sabe que no hay). */
const portadas = new Map<string, string | null>();

/** Pedidos en curso, para que dos cards con el mismo link no dupliquen fetch. */
const enVuelo = new Map<string, Promise<string | null>>();

export type LitePreviewEstado = {
  portada: string | null;
  /** `true` cuando ya se conoce el resultado y no hace falta pedir nada. */
  resuelto: boolean;
};

const SIN_PORTADA: LitePreviewEstado = { portada: null, resuelto: true };

/**
 * Resultado disponible sin red: link inválido, YouTube, o algo ya cacheado.
 * Devuelve `resuelto: false` cuando hay que ir a `/api/link-preview`.
 */
export function litePreviewSync(link: string | null | undefined): LitePreviewEstado {
  if (!link?.trim()) return SIN_PORTADA;

  const href = normalizeHttpUrl(link);
  if (!href) return SIN_PORTADA;

  if (portadas.has(href)) {
    return { portada: portadas.get(href) ?? null, resuelto: true };
  }

  const videoId = youtubeVideoIdFromUrl(href);
  if (videoId) {
    const portada = youtubeThumbnailUrl(videoId);
    portadas.set(href, portada);
    return { portada, resuelto: true };
  }

  return { portada: null, resuelto: false };
}

/**
 * Resuelve la portada de un link no-YouTube contra `/api/link-preview`.
 * Sin conexión no cachea el fallo: se reintenta cuando vuelva la red.
 */
export function resolveLitePreview(link: string): Promise<string | null> {
  const href = normalizeHttpUrl(link);
  if (!href) return Promise.resolve(null);

  const yaConocido = litePreviewSync(href);
  if (yaConocido.resuelto) return Promise.resolve(yaConocido.portada);

  const pendiente = enVuelo.get(href);
  if (pendiente) return pendiente;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return Promise.resolve(null);
  }

  const promesa = pedirPortada(href)
    .then((portada) => {
      portadas.set(href, portada);
      return portada;
    })
    .catch(() => null)
    .finally(() => {
      enVuelo.delete(href);
    });

  enVuelo.set(href, promesa);
  return promesa;
}

async function pedirPortada(href: string): Promise<string | null> {
  const res = await fetch(`/api/link-preview?url=${encodeURIComponent(href)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as LinkPreviewResult;
  return data.imageUrl ?? null;
}

/**
 * La imagen resolvió pero el navegador no pudo cargarla (hotlink protection,
 * 403, imagen borrada). Se marca como sin portada para no reintentarla.
 */
export function descartarLitePreview(link: string): void {
  const href = normalizeHttpUrl(link);
  if (href) portadas.set(href, null);
}
