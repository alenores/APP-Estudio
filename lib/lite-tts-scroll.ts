/**
 * Scroll “sigue el bloque” + scrub manual para TTS lite.
 * El bloque más cerca del centro visible es el candidato a reproducir.
 */

export const LITE_TTS_SCROLL_SETTLE_MS = 380;

/** Centro vertical del área scrolleable (debajo de toolbars sticky). */
export function getScrollVisibleCenterY(scrollEl: HTMLElement): number {
  const r = scrollEl.getBoundingClientRect();
  return r.top + r.height / 2;
}

/** Índice del elemento cuyo centro está más cerca de `centerY`. */
export function findClosestIndexToCenter(
  elements: Array<HTMLElement | null | undefined>,
  centerY: number,
): number {
  let best = -1;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.height <= 0 && r.width <= 0) continue;
    const mid = r.top + r.height / 2;
    const dist = Math.abs(mid - centerY);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export function findLiteDetalleScrollRoot(
  from: HTMLElement | null,
): HTMLElement | null {
  if (!from) return null;
  return from.closest(".lite-detalle-scroll") as HTMLElement | null;
}

/** Centra un bloque en el scroll; `programmaticUntilRef` evita tratarlo como scrub. */
export function scrollLiteTtsBlockToCenter(
  el: HTMLElement,
  programmaticUntilRef: { current: number },
  holdMs = 520,
): void {
  programmaticUntilRef.current = Date.now() + holdMs;
  el.scrollIntoView({
    block: "center",
    inline: "nearest",
    behavior: "smooth",
  });
}
