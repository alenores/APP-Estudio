"use client";

import { hapticSwipeCommit } from "@/lib/haptic";
import { useEffect, useRef } from "react";

const EDGE_START_PX = 40;
const DRAG_START_PX = 12;
const COMMIT_MIN_PX = 88;
const COMMIT_WIDTH_RATIO = 0.33;
const RELEASE_MS = 220;
const FULL_SWIPE_ARM_PX = 100;

/**
 * Swipe horizontal a la derecha: el panel sigue el dedo; al soltar, vuelve o navega atrás.
 * Interacción del usuario (ADR 006), no animación al montar la ruta.
 */
export function useSwipeBack(onBack: (() => void) | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const navigatingRef = useRef(false);

  useEffect(() => {
    if (!onBack) return;
    const handleBack: () => void = onBack;
    const panelEl = ref.current;
    if (!panelEl) return;
    const panelNode: HTMLDivElement = panelEl;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let currentDx = 0;

    function clearDragStyles() {
      panelNode.style.transform = "";
      panelNode.style.transition = "";
      panelNode.style.opacity = "";
      panelNode.style.boxShadow = "";
    }

    function applyDrag(dx: number) {
      const max = typeof window !== "undefined" ? window.innerWidth * 0.92 : 400;
      const clamped = Math.min(Math.max(0, dx), max);
      currentDx = clamped;
      panelNode.style.transition = "none";
      panelNode.style.transform = `translateX(${clamped}px)`;
      panelNode.style.boxShadow =
        clamped > 4 ? "-6px 0 28px rgba(30, 41, 59, 0.12)" : "";
      const w = typeof window !== "undefined" ? window.innerWidth : 400;
      panelNode.style.opacity = String(Math.max(0.86, 1 - (clamped / w) * 0.22));
    }

    function animateTo(dx: number, then?: () => void) {
      panelNode.style.transition = `transform ${RELEASE_MS}ms ease-out, opacity ${RELEASE_MS}ms ease-out, box-shadow ${RELEASE_MS}ms ease-out`;
      panelNode.style.transform = dx > 0 ? `translateX(${dx}px)` : "";
      panelNode.style.opacity = dx > 0 ? "0.9" : "";
      if (dx <= 0) {
        panelNode.style.boxShadow = "";
      }
      window.setTimeout(() => {
        if (then) {
          then();
        } else {
          clearDragStyles();
        }
      }, RELEASE_MS);
    }

    function commitBack() {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      hapticSwipeCommit();
      const w = typeof window !== "undefined" ? window.innerWidth : 400;
      animateTo(w, () => {
        clearDragStyles();
        handleBack();
        navigatingRef.current = false;
      });
    }

    function onTouchStart(e: TouchEvent) {
      if (navigatingRef.current || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
      draggingRef.current = false;
      currentDx = 0;
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking || navigatingRef.current || e.touches.length !== 1) return;

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - startX;
      const dy = y - startY;
      const fromEdge = startX <= EDGE_START_PX;

      if (!draggingRef.current) {
        if (dx <= DRAG_START_PX) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.2) {
          tracking = false;
          return;
        }
        if (!fromEdge && dx < FULL_SWIPE_ARM_PX) return;
        draggingRef.current = true;
      }

      if (dx > 0) {
        e.preventDefault();
        applyDrag(dx);
      } else {
        applyDrag(0);
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;

      const touch = e.changedTouches[0];
      if (!touch) {
        draggingRef.current = false;
        clearDragStyles();
        return;
      }

      const dx = touch.clientX - startX;
      const w = typeof window !== "undefined" ? window.innerWidth : 400;
      const commitThreshold = Math.max(COMMIT_MIN_PX, w * COMMIT_WIDTH_RATIO);

      if (draggingRef.current && dx >= commitThreshold) {
        draggingRef.current = false;
        commitBack();
        return;
      }

      draggingRef.current = false;
      if (currentDx > 0) {
        animateTo(0);
      } else {
        clearDragStyles();
      }
    }

    function onTouchCancel() {
      tracking = false;
      draggingRef.current = false;
      if (currentDx > 0) animateTo(0);
      else clearDragStyles();
    }

    panelNode.addEventListener("touchstart", onTouchStart, { passive: true });
    panelNode.addEventListener("touchmove", onTouchMove, { passive: false });
    panelNode.addEventListener("touchend", onTouchEnd, { passive: true });
    panelNode.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      panelNode.removeEventListener("touchstart", onTouchStart);
      panelNode.removeEventListener("touchmove", onTouchMove);
      panelNode.removeEventListener("touchend", onTouchEnd);
      panelNode.removeEventListener("touchcancel", onTouchCancel);
      clearDragStyles();
    };
  }, [onBack]);

  return ref;
}
