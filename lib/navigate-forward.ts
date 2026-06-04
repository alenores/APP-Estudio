import {
  navLeaveOffsetPx,
  NAV_LEAVE_MS,
} from "@/lib/nav-motion";
import type { NavPanelMotion } from "@/lib/nav-panel-context";
import { markNavEnter, prefersReducedMotion } from "@/lib/nav-transition";

type RouterPush = { push: (href: string) => void };

/** Salida hacia hijo (tap o swipe en ítem): panel a la izquierda y navegación. */
export function navigateForwardLeave(
  router: RouterPush,
  href: string,
  panel?: NavPanelMotion | null,
): void {
  if (prefersReducedMotion()) {
    markNavEnter();
    router.push(href);
    return;
  }

  markNavEnter();

  if (panel) {
    panel.setIsSwiping(false);
    panel.setIsLeaving(true);
    panel.setActiveItemKey(null);
    panel.setSwipeOffset(navLeaveOffsetPx());
    window.setTimeout(() => {
      router.push(href);
    }, NAV_LEAVE_MS);
    return;
  }

  router.push(href);
}
