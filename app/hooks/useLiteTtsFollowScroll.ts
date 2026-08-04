"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  findClosestIndexToCenter,
  findLiteDetalleScrollRoot,
  getScrollVisibleCenterY,
  LITE_TTS_SCROLL_SETTLE_MS,
  scrollLiteTtsBlockToCenter,
} from "@/lib/lite-tts-scroll";

type UseLiteTtsFollowScrollArgs = {
  /** Solo mientras reproduce (no en pausa quieta sin scrub). */
  followEnabled: boolean;
  /** Scrub manual activo (reproduciendo o en pausa con sesión). */
  scrubEnabled: boolean;
  activeIndex: number;
  itemCount: number;
  getElements: () => Array<HTMLElement | null | undefined>;
  /** Nodo dentro del detalle (para hallar `.lite-detalle-scroll`). */
  anchorRef: RefObject<HTMLElement | null>;
  onSeek: (index: number) => void;
};

/**
 * Auto-centra el bloque activo y, si el usuario scrollea, al soltar
 * salta la lectura al bloque del centro.
 */
export function useLiteTtsFollowScroll({
  followEnabled,
  scrubEnabled,
  activeIndex,
  itemCount,
  getElements,
  anchorRef,
  onSeek,
}: UseLiteTtsFollowScrollArgs) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const programmaticUntilRef = useRef(0);
  const userScrubbingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const onSeekRef = useRef(onSeek);
  const getElementsRef = useRef(getElements);

  activeIndexRef.current = activeIndex;
  onSeekRef.current = onSeek;
  getElementsRef.current = getElements;

  // Auto-scroll al bloque activo.
  useEffect(() => {
    if (!followEnabled || userScrubbingRef.current) return;
    if (activeIndex < 0 || activeIndex >= itemCount) return;
    const el = getElementsRef.current()[activeIndex];
    if (!el) return;
    scrollLiteTtsBlockToCenter(el, programmaticUntilRef);
  }, [activeIndex, followEnabled, itemCount]);

  // Scrub: scroll del usuario → bloque del centro.
  useEffect(() => {
    if (!scrubEnabled) {
      setFocusIndex(null);
      userScrubbingRef.current = false;
      return;
    }

    const root =
      findLiteDetalleScrollRoot(anchorRef.current) ??
      (typeof document !== "undefined"
        ? (document.querySelector(".lite-detalle-scroll") as HTMLElement | null)
        : null);
    if (!root) return;

    const clearSettle = () => {
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };

    const onScroll = () => {
      if (Date.now() < programmaticUntilRef.current) return;

      userScrubbingRef.current = true;
      const centerY = getScrollVisibleCenterY(root);
      const closest = findClosestIndexToCenter(getElementsRef.current(), centerY);
      if (closest >= 0) setFocusIndex(closest);

      clearSettle();
      settleTimerRef.current = setTimeout(() => {
        userScrubbingRef.current = false;
        const cy = getScrollVisibleCenterY(root);
        const idx = findClosestIndexToCenter(getElementsRef.current(), cy);
        setFocusIndex(null);
        if (idx >= 0 && idx !== activeIndexRef.current) {
          onSeekRef.current(idx);
        }
      }, LITE_TTS_SCROLL_SETTLE_MS);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      clearSettle();
    };
  }, [scrubEnabled, anchorRef, itemCount]);

  return { focusIndex };
}
