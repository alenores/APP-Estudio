"use client";

import { hapticSwipeCommit } from "@/lib/haptic";
import {
  BACK_SWIPE_COMMIT_MAX_Y,
  BACK_SWIPE_COMMIT_PX,
  BACK_SWIPE_DRAG_BIAS_Y,
  BACK_SWIPE_DRAG_MIN,
  BACK_SWIPE_HORIZONTAL_BIAS,
  BACK_SWIPE_IDLE_MIN,
  BACK_SWIPE_MAX_DRAG,
  BACK_SWIPE_AXIS_BIAS_Y,
  navBackLeaveOffsetPx,
  NAV_LEAVE_MS,
} from "@/lib/nav-motion";
import type { NavPanelMotion } from "@/lib/nav-panel-context";
import {
  consumeNavEnter,
  NAV_ENTER_FINAL,
  NAV_ENTER_INITIAL,
  NAV_ENTER_SETTLE_MS,
} from "@/lib/nav-transition";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type SwipeIntent = "idle" | "horizontal" | "vertical";

type UseNavDetailGesturesOptions = {
  backHref: string | undefined;
  onBack: () => void;
  panel: NavPanelMotion;
};

/**
 * Detalle: animación de entrada (sessionStorage) y swipe → para volver.
 */
export function useNavDetailGestures({
  backHref,
  onBack,
  panel,
}: UseNavDetailGesturesOptions) {
  const [enterOffset, setEnterOffset] = useState(0);
  const [enterScale, setEnterScale] = useState(1);
  const [enterOpacity, setEnterOpacity] = useState(1);
  const [isEntering, setIsEntering] = useState(false);

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeIntentRef = useRef<SwipeIntent>("idle");
  const navigatingBackRef = useRef(false);

  const { swipeOffset, isSwiping, isLeaving, setSwipeOffset, setIsSwiping, setIsLeaving } =
    panel;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!consumeNavEnter()) return;

    setIsEntering(true);
    setEnterOffset(NAV_ENTER_INITIAL.enterOffset);
    setEnterScale(NAV_ENTER_INITIAL.enterScale);
    setEnterOpacity(NAV_ENTER_INITIAL.enterOpacity);

    const frame = window.requestAnimationFrame(() => {
      setEnterOffset(NAV_ENTER_FINAL.enterOffset);
      setEnterScale(NAV_ENTER_FINAL.enterScale);
      setEnterOpacity(NAV_ENTER_FINAL.enterOpacity);
      window.setTimeout(() => {
        setIsEntering(false);
      }, NAV_ENTER_SETTLE_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const triggerBackLeave = useCallback(() => {
    if (isLeaving || !backHref) return;

    setIsLeaving(true);
    setIsSwiping(false);
    setSwipeOffset(navBackLeaveOffsetPx());

    window.setTimeout(() => {
      if (navigatingBackRef.current) return;
      navigatingBackRef.current = true;
      hapticSwipeCommit();
      onBack();
      navigatingBackRef.current = false;
    }, NAV_LEAVE_MS);
  }, [backHref, isLeaving, onBack, setIsLeaving, setIsSwiping, setSwipeOffset]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!backHref || event.pointerType !== "touch" || isLeaving) return;
      swipeStartRef.current = { x: event.clientX, y: event.clientY };
      swipeIntentRef.current = "idle";
      setIsSwiping(false);
    },
    [backHref, isLeaving, setIsSwiping],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!backHref || event.pointerType !== "touch" || isLeaving) return;
      const start = swipeStartRef.current;
      if (!start) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (swipeIntentRef.current === "idle") {
        if (absDeltaX < BACK_SWIPE_IDLE_MIN && absDeltaY < BACK_SWIPE_IDLE_MIN) return;

        if (absDeltaY > absDeltaX + BACK_SWIPE_AXIS_BIAS_Y) {
          swipeIntentRef.current = "vertical";
          setSwipeOffset(0);
          setIsSwiping(false);
          return;
        }

        if (deltaX > 0 && absDeltaX > absDeltaY + BACK_SWIPE_HORIZONTAL_BIAS) {
          swipeIntentRef.current = "horizontal";
        } else {
          swipeIntentRef.current = "vertical";
          setSwipeOffset(0);
          setIsSwiping(false);
          return;
        }
      }

      if (swipeIntentRef.current !== "horizontal") return;

      if (deltaX <= 0 || absDeltaX < BACK_SWIPE_DRAG_MIN || absDeltaX <= absDeltaY + BACK_SWIPE_DRAG_BIAS_Y) {
        return;
      }

      setIsSwiping(true);
      setSwipeOffset(Math.min(deltaX, BACK_SWIPE_MAX_DRAG));
    },
    [backHref, isLeaving, setIsSwiping, setSwipeOffset],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!backHref || event.pointerType !== "touch") return;
      const start = swipeStartRef.current;
      const intent = swipeIntentRef.current;
      swipeStartRef.current = null;
      swipeIntentRef.current = "idle";
      if (!start) return;

      if (intent !== "horizontal") {
        setSwipeOffset(0);
        setIsSwiping(false);
        return;
      }

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (deltaX > BACK_SWIPE_COMMIT_PX && Math.abs(deltaY) < BACK_SWIPE_COMMIT_MAX_Y) {
        triggerBackLeave();
        return;
      }

      setSwipeOffset(0);
      setIsSwiping(false);
    },
    [backHref, setIsSwiping, setSwipeOffset, triggerBackLeave],
  );

  const onPointerCancel = useCallback(() => {
    swipeStartRef.current = null;
    swipeIntentRef.current = "idle";
    if (!isLeaving) {
      setSwipeOffset(0);
      setIsSwiping(false);
    }
  }, [isLeaving, setIsSwiping, setSwipeOffset]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      panel.resetSwipe();
      setEnterOffset(0);
      setEnterScale(1);
      setEnterOpacity(1);
      setIsEntering(false);
      swipeStartRef.current = null;
      swipeIntentRef.current = "idle";
      navigatingBackRef.current = false;
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [panel]);

  return {
    enterOffset,
    enterScale,
    enterOpacity,
    isEntering,
    swipeOffset,
    isSwiping,
    isLeaving,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    triggerBackLeave,
  };
}
