"use client";

import { EntityCard, type EntityCardProps } from "@/components/study/entity-card";
import {
  ChildContextMenu,
  type ChildQuickAction,
} from "@/components/study/child-context-menu";
import { LONG_PRESS_MS } from "@/lib/fab-open-delay";
import { hapticContextMenu, hapticLightTap } from "@/lib/haptic";
import { useCallback, useEffect, useRef, useState } from "react";

type EntityCardWithQuickActionsProps = EntityCardProps & {
  onQuickAction: (action: ChildQuickAction) => void;
};

const MOVE_CANCEL_PX = 12;

/**
 * Card de curso/clase: tap corto → detalle; mantener apretado → menú seguimiento/concepto del hijo.
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

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    hapticLightTap();
    beginPress(e.touches[0].clientX, e.touches[0].clientY);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!timerRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clearTimer();
  }

  function onTouchEnd() {
    clearTimer();
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    beginPress(e.clientX, e.clientY);
  }

  function onMouseUp() {
    clearTimer();
  }

  function closeMenu() {
    setMenuRect(null);
    longPressDone.current = false;
  }

  return (
    <>
      <div
        ref={wrapRef}
        className={`transition-transform duration-150 ${pressing ? "scale-[0.98]" : ""} ${menuRect ? "relative z-20 rounded-2xl ring-2 ring-accent/40" : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <EntityCard
          {...card}
          forwardTransition
          blockNavigation={menuRect !== null}
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
