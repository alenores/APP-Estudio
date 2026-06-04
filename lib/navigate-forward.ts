import {
  navLeaveOffsetPx,
  NAV_LEAVE_MS,
} from "@/lib/nav-motion";
import type { NavPanelMotion } from "@/lib/nav-panel-context";
import { hapticSwipeCommit } from "@/lib/haptic";
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
  hapticSwipeCommit();

  if (panel) {
    const leaveOffset = navLeaveOffsetPx();
    panel.setActiveItemKey(null);
    panel.setIsSwiping(false);
    panel.setIsLeaving(true);
    panel.setSwipeOffset(leaveOffset);

    window.setTimeout(() => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };
      if (doc.startViewTransition) {
        doc.startViewTransition(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }
    }, NAV_LEAVE_MS);
    return;
  }

  router.push(href);
}
