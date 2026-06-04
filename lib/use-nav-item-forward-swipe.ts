"use client";

import {
  FWD_PANEL_DRAG_GAIN,
  FWD_SWIPE_AXIS_BIAS_Y,
  FWD_SWIPE_AXIS_MIN,
  FWD_SWIPE_COMMIT_MAX_Y,
  fwdSwipeCommitPx,
  fwdSwipeMaxDragPx,
  navLeaveOffsetPx,
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

type HorizontalSwipeKind = "forward" | "back" | null;

type UseNavItemForwardSwipeOptions = {
  router: { push: (href: string) => void };
  href: string;
  itemKey: string;
  enabled: boolean;
  /** Si true, no navegar (p. ej. menú contextual abierto). */
  blockNavigation: boolean;
  onSwipeStarted?: () => void;
};

function classifyHorizontalSwipe(deltaX: number, deltaY: number): HorizontalSwipeKind {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  if (absDeltaX < FWD_SWIPE_AXIS_MIN) return null;
  if (absDeltaX <= absDeltaY + FWD_SWIPE_AXIS_BIAS_Y) return null;
  if (deltaX < 0) return "forward";
  if (deltaX > 0) return "back";
  return null;
}

function panelOffsetFromFingerDelta(deltaX: number): number {
  const maxDrag = fwdSwipeMaxDragPx();
  const gained = deltaX * FWD_PANEL_DRAG_GAIN;
  return Math.max(gained, -maxDrag);
}

function shouldCommitForwardSwipe(deltaX: number, deltaY: number, panelOffset: number): boolean {
  if (Math.abs(deltaY) >= FWD_SWIPE_COMMIT_MAX_Y) return false;

  const commitPx = fwdSwipeCommitPx();
  if (deltaX <= -commitPx) return true;

  const leavePx = Math.abs(navLeaveOffsetPx());
  if (leavePx > 0 && Math.abs(panelOffset) >= leavePx * 0.32) return true;

  return false;
}

/**
 * Swipe ← en fila + tap. Swipe → burbujea al AppShell (volver atrás en cualquier zona).
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
  const swipeStartedRef = useRef(false);

  const abandonForwardGesture = useCallback(() => {
    pointerStartRef.current = null;
    suppressClickRef.current = false;
    swipeStartedRef.current = false;
    panel?.setActiveItemKey(null);
    panel?.setIsSwiping(false);
    if (!panel?.isLeaving) {
      panel?.setSwipeOffset(0);
    }
  }, [panel]);

  const resetSwipe = useCallback(() => {
    panel?.resetSwipe();
    pointerStartRef.current = null;
    suppressClickRef.current = false;
    swipeStartedRef.current = false;
  }, [panel]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || blockNavigation || event.pointerType !== "touch") return;
      /* Sin stopPropagation: el main también registra el gesto para volver atrás. */

      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        href,
        itemKey,
      };
      swipeStartedRef.current = false;
      panel?.setActiveItemKey(itemKey);
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
      const kind = classifyHorizontalSwipe(deltaX, deltaY);

      if (kind === "back") {
        abandonForwardGesture();
        return;
      }

      if (kind !== "forward") {
        if (swipeStartedRef.current) {
          panel?.setSwipeOffset(0);
        }
        return;
      }

      event.stopPropagation();

      if (!swipeStartedRef.current) {
        swipeStartedRef.current = true;
        panel?.setIsSwiping(true);
        onSwipeStarted?.();
      }

      panel?.setSwipeOffset(panelOffsetFromFingerDelta(deltaX));
    },
    [abandonForwardGesture, enabled, onSwipeStarted, panel],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!enabled || event.pointerType !== "touch") return;
      const start = pointerStartRef.current;
      if (!start || panel?.isLeaving) {
        abandonForwardGesture();
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const panelOffset = panel?.swipeOffset ?? 0;

      if (classifyHorizontalSwipe(deltaX, deltaY) === "back") {
        abandonForwardGesture();
        return;
      }

      if (!shouldCommitForwardSwipe(deltaX, deltaY, panelOffset)) {
        abandonForwardGesture();
        return;
      }

      event.stopPropagation();
      suppressClickRef.current = true;
      navigateForwardLeave(router, start.href, panel);
      pointerStartRef.current = null;
    },
    [abandonForwardGesture, enabled, panel, router],
  );

  const onPointerCancel = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      abandonForwardGesture();
    },
    [abandonForwardGesture],
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      event.stopPropagation();

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
