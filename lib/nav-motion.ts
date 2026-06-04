/** Constantes de transición de navegación (paridad con app hermana de escalada). */

export const NAV_ENTER_ANIMATION_KEY = "app-estudio-nav-enter-v1";

export const NAV_LEAVE_MS = 170;
export const NAV_ENTER_SETTLE_MS = 220;

export const NAV_OPACITY_DIVISOR = 340;
export const NAV_MAX_OPACITY_FADE = 0.45;

export const NAV_TRANSFORM_TRANSITION =
  "transform 210ms cubic-bezier(0.22, 1, 0.36, 1)";
export const NAV_OPACITY_TRANSITION = "opacity 180ms ease";
export const NAV_ENTER_TRANSITION =
  "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease";

export const NAV_LEAVE_OFFSET_MIN = 320;
export const NAV_LEAVE_WIDTH_RATIO = 0.92;

export const NAV_ENTER_OFFSET_PX = 44;
export const NAV_ENTER_SCALE_FROM = 0.992;
export const NAV_ENTER_OPACITY_FROM = 0.92;

/** Swipe en ítem de lista → abrir hijo (izquierda). */
export const FWD_SWIPE_COMMIT_PX = 80;
export const FWD_SWIPE_COMMIT_MAX_Y = 70;
export const FWD_SWIPE_MAX_DRAG = 220;
export const FWD_SWIPE_AXIS_MIN = 14;
export const FWD_SWIPE_AXIS_BIAS_Y = 10;
export const FWD_SWIPE_HINT_DIVISOR = 80;
export const FWD_SWIPE_HINT_THRESHOLD = 0.55;

/** Swipe en detalle → volver (derecha). */
export const BACK_SWIPE_COMMIT_PX = 70;
export const BACK_SWIPE_COMMIT_MAX_Y = 90;
export const BACK_SWIPE_MAX_DRAG = 260;
export const BACK_SWIPE_IDLE_MIN = 6;
export const BACK_SWIPE_AXIS_BIAS_Y = 10;
export const BACK_SWIPE_HORIZONTAL_BIAS = 4;
export const BACK_SWIPE_DRAG_MIN = 10;
export const BACK_SWIPE_DRAG_BIAS_Y = 6;

export function navLeaveOffsetPx(): number {
  if (typeof window === "undefined") return NAV_LEAVE_OFFSET_MIN;
  return -Math.max(window.innerWidth * NAV_LEAVE_WIDTH_RATIO, NAV_LEAVE_OFFSET_MIN);
}

export function navBackLeaveOffsetPx(): number {
  if (typeof window === "undefined") return NAV_LEAVE_OFFSET_MIN;
  return Math.max(window.innerWidth * NAV_LEAVE_WIDTH_RATIO, NAV_LEAVE_OFFSET_MIN);
}

export function navPanelOpacity(offsetPx: number): number {
  return 1 - Math.min(Math.abs(offsetPx) / NAV_OPACITY_DIVISOR, NAV_MAX_OPACITY_FADE);
}
