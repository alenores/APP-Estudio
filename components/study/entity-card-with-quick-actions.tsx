"use client";

import { EntityCard, type EntityCardProps } from "@/components/study/entity-card";
import {
  ChildContextMenu,
  type ChildQuickAction,
} from "@/components/study/child-context-menu";
import { LONG_PRESS_MS } from "@/lib/fab-open-delay";
import { hapticContextMenu, hapticLightTap } from "@/lib/haptic";
import { FWD_SWIPE_AXIS_MIN } from "@/lib/nav-motion";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type EntityCardWithQuickActionsProps = EntityCardProps & {
  onQuickAction: (action: ChildQuickAction) => void;
};

const MOVE_CANCEL_PX = 14;

/**
 * Card de curso/clase: tap o swipe ← → detalle; mantener apretado → menú seguimiento/concepto.
 * Pointer en el wrapper (no touch): evita bloquear el swipe del Link en Android.
 */
export function EntityCardWithQuickActions({
  onQuickAction,
  ...card
}: EntityCardWithQuickActionsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressDone = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [pressing, setPressing] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const openMenu = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    longPressDone.current = true;
    hapticContextMenu();
    setMenuRect(el.getBoundingClientRect());
    setPressing(false);
  }, []);

  const beginPress = useCallback(
    (clientX: number, clientY: number) => {
      longPressDone.current = false;
      startX.current = clientX;
      startY.current = clientY;
      setPressing(true);
      clearTimer();
      timerRef.current = setTimeout(openMenu, LONG_PRESS_MS);
    },
    [clearTimer, openMenu],
  );

  const onWrapPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "touch" || menuRect) return;
      hapticLightTap();
      beginPress(e.clientX, e.clientY);
    },
    [beginPress, menuRect],
  );

  const onWrapPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    const absDeltaX = Math.abs(dx);
    const absDeltaY = Math.abs(dy);

    if (dx < -FWD_SWIPE_AXIS_MIN && absDeltaX > absDeltaY + 4) {
      clearTimer();
      return;
    }

    if (timerRef.current && Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      clearTimer();
    }
  }, [clearTimer]);

  const onWrapPointerEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  function closeMenu() {
    setMenuRect(null);
    longPressDone.current = false;
  }

  return (
    <>
      <div
        ref={wrapRef}
        className={`transition-transform duration-150 ${pressing ? "scale-[0.98]" : ""} ${menuRect ? "relative z-20 rounded-2xl ring-2 ring-accent/40" : ""}`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onWrapPointerDown}
        onPointerMove={onWrapPointerMove}
        onPointerUp={onWrapPointerEnd}
        onPointerCancel={onWrapPointerEnd}
      >
        <EntityCard
          {...card}
          forwardTransition
          blockNavigation={menuRect !== null}
          onForwardSwipeStart={clearTimer}
          onNavigateBlocked={() => {
            longPressDone.current = false;
          }}
        />
      </div>

      {menuRect ? (
        <ChildContextMenu
          anchorRect={menuRect}
          entityName={card.nombre}
          onSelect={(action) => {
            closeMenu();
            onQuickAction(action);
          }}
          onClose={closeMenu}
        />
      ) : null}
    </>
  );
}
