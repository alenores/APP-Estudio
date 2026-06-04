"use client";

import { useEffect, useRef } from "react";

const SWIPE_MIN_PX = 72;
const EDGE_START_PX = 40;
const FULL_SWIPE_MIN_PX = 100;

/**
 * Gesto swipe hacia la derecha (o desde borde izquierdo) → mismo efecto que «Volver».
 * Solo en pantallas con backHref; no anima la salida (ADR 006).
 */
export function useSwipeBack(onBack: (() => void) | undefined) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onBack) return;
    const handleBack: () => void = onBack;
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const fromEdge = startX <= EDGE_START_PX;
      const horizontal =
        dx >= SWIPE_MIN_PX && dx > Math.abs(dy) * 1.5;
      const qualifies = horizontal && (fromEdge || dx >= FULL_SWIPE_MIN_PX);

      if (qualifies) handleBack();
    }

    function onTouchCancel() {
      tracking = false;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onBack]);

  return ref;
}
