"use client";

import {
  FWD_SWIPE_AXIS_BIAS_Y,
  FWD_SWIPE_AXIS_MIN,
  FWD_SWIPE_COMMIT_MAX_Y,
  FWD_SWIPE_COMMIT_PX,
  FWD_SWIPE_MAX_DRAG,
} from "@/lib/nav-motion";
import { useNavPanelOptional } from "@/lib/nav-panel-context";
import { navigateForwardLeave } from "@/lib/navigate-forward";
import { useCallback, useRef, type PointerEvent } from "react";

type PointerStart = {
  x: number;
  y: number;
  href: string;
  itemKey: string;
};

type UseNavItemForwardSwipeOptions = {
  router: { push: (href: string) => void };
  href: string;
  itemKey: string;
  enabled: boolean;
  /** Si true, no navegar (p. ej. menú contextual abierto). */
  blockNavigation: boolean;
  onSwipeStarted?: () => void;
};

/**
 * Swipe ← en fila de lista + tap: mueve el panel del AppShell y abre el hijo.
 */
export function useNavItemForwardSwipe({
  router,
  href,
  itemKey,
  enabled,
  blockNavigation,
  onSwipeStarted,
}: UseNavItemForwardSwipeOptions) {
  const panel = useNavPanelOptional();
  const pointerStartRef = useRef<PointerStart | null>(null);
  const suppressClickRef = useRef(false);

  const resetSwipe = useCallback(() => {
    panel?.resetSwipe();
    pointerStartRef.current = null;
    suppressClickRef.current = false;
  }, [panel]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || blockNavigation || event.pointerType !== "touch") return;

      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        href,
        itemKey,
      };
      panel?.setActiveItemKey(itemKey);
      panel?.setIsSwiping(true);
      panel?.setIsLeaving(false);
      suppressClickRef.current = false;
    },
    [blockNavigation, enabled, href, itemKey, panel],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "touch") return;
      const start = pointerStartRef.current;
      if (!start || panel?.isLeaving) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (deltaX >= 0 || absDeltaX < FWD_SWIPE_AXIS_MIN || absDeltaX <= absDeltaY + FWD_SWIPE_AXIS_BIAS_Y) {
        panel?.setSwipeOffset(0);
        return;
      }

      onSwipeStarted?.();
      panel?.setSwipeOffset(Math.max(deltaX, -FWD_SWIPE_MAX_DRAG));
    },
    [enabled, onSwipeStarted, panel],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "touch") return;
      const start = pointerStartRef.current;
      if (!start || panel?.isLeaving) {
        resetSwipe();
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const shouldOpen =
        deltaX <= -FWD_SWIPE_COMMIT_PX && Math.abs(deltaY) < FWD_SWIPE_COMMIT_MAX_Y;

      if (!shouldOpen) {
        resetSwipe();
        return;
      }

      suppressClickRef.current = true;
      navigateForwardLeave(router, start.href, panel);
      pointerStartRef.current = null;
    },
    [enabled, panel, resetSwipe, router],
  );

  const onPointerCancel = useCallback(() => {
    resetSwipe();
  }, [resetSwipe]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;

      if (suppressClickRef.current) {
        event.preventDefault();
        suppressClickRef.current = false;
        return;
      }

      if (blockNavigation) {
        event.preventDefault();
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      navigateForwardLeave(router, href, panel);
    },
    [blockNavigation, enabled, href, panel, router],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClick,
    suppressClickRef,
  };
}
