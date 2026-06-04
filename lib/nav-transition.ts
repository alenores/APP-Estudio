import type { CSSProperties } from "react";
import {
  NAV_ENTER_ANIMATION_KEY,
  NAV_ENTER_OPACITY_FROM,
  NAV_ENTER_OFFSET_FALLBACK_PX,
  navEnterFromRightOffsetPx,
  NAV_ENTER_SCALE_FROM,
  NAV_ENTER_SETTLE_MS,
  NAV_ENTER_TRANSITION,
  NAV_LEAVE_MS,
  NAV_OPACITY_TRANSITION,
  NAV_TRANSFORM_TRANSITION,
  navPanelOpacity,
} from "@/lib/nav-motion";

export { NAV_ENTER_ANIMATION_KEY };

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function markNavEnter() {
  try {
    sessionStorage.setItem(NAV_ENTER_ANIMATION_KEY, "1");
  } catch {
    /* storage privado */
  }
}

export function consumeNavEnter(): boolean {
  try {
    const v = sessionStorage.getItem(NAV_ENTER_ANIMATION_KEY);
    if (v) sessionStorage.removeItem(NAV_ENTER_ANIMATION_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export type NavPanelStyleInput = {
  swipeOffset: number;
  isSwiping: boolean;
  isLeaving: boolean;
  isEntering: boolean;
  enterOffset: number;
  enterScale: number;
  enterOpacity: number;
};

/** Estilo inline del panel (lista o detalle). */
export function buildNavPanelStyle({
  swipeOffset,
  isSwiping,
  isLeaving,
  isEntering,
  enterOffset,
  enterScale,
  enterOpacity,
}: NavPanelStyleInput): CSSProperties | undefined {
  const hasMotion =
    swipeOffset !== 0 ||
    isLeaving ||
    enterOffset !== 0 ||
    enterScale !== 1 ||
    enterOpacity !== 1;

  if (!hasMotion && !isEntering) return undefined;

  const totalX = swipeOffset + enterOffset;
  const baseOpacity = navPanelOpacity(swipeOffset);

  return {
    transform: `translateX(${totalX}px) scale(${enterScale})`,
    opacity: baseOpacity * enterOpacity,
    transition:
      isSwiping && !isLeaving
        ? "none"
        : isEntering
          ? NAV_ENTER_TRANSITION
          : `${NAV_TRANSFORM_TRANSITION}, ${NAV_OPACITY_TRANSITION}`,
  };
}

export function getNavEnterInitial() {
  const fromRight =
    typeof window !== "undefined"
      ? navEnterFromRightOffsetPx()
      : NAV_ENTER_OFFSET_FALLBACK_PX;
  return {
    enterOffset: fromRight,
    enterScale: NAV_ENTER_SCALE_FROM,
    enterOpacity: NAV_ENTER_OPACITY_FROM,
  };
}

export const NAV_ENTER_FINAL = {
  enterOffset: 0,
  enterScale: 1,
  enterOpacity: 1,
};

export { NAV_ENTER_SETTLE_MS, NAV_LEAVE_MS };
