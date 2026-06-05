"use client";

import type { CursoConDerivados } from "@/app/types/estudio";
import {
  ChildContextMenu,
  type ChildQuickAction,
} from "@/components/mobile/cards/child-context-menu";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { ClasesCursoStats } from "@/lib/curso-clases-stats";
import { fechaParentesisCurso } from "@/lib/curso-card-fecha";
import { LONG_PRESS_MS } from "@/lib/fab-open-delay";
import { hapticContextMenu, hapticLightTap } from "@/lib/haptic";
import { FWD_SWIPE_AXIS_MIN } from "@/lib/nav-motion";
import { useNavItemForwardSwipe } from "@/lib/use-nav-item-forward-swipe";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

const MOVE_CANCEL_PX = 14;

type TemaCursoCardProps = {
  curso: CursoConDerivados;
  clasesStats: ClasesCursoStats;
  onQuickAction: (action: ChildQuickAction) => void;
};

export function TemaCursoCard({
  curso,
  clasesStats,
  onQuickAction,
}: TemaCursoCardProps) {
  const router = useRouter();
  const href = `/cursos/${curso.id}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressDone = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [pressing, setPressing] = useState(false);

  const nav = useNavItemForwardSwipe({
    router,
    href,
    itemKey: href,
    enabled: true,
    blockNavigation: menuRect !== null,
    onSwipeStarted: () => clearTimer(),
  });

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

  const onWrapPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
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
    },
    [clearTimer],
  );

  return (
    <>
      <div
        ref={wrapRef}
        className={pressing ? "scale-[0.99] transition-transform duration-150" : ""}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onWrapPointerDown}
        onPointerMove={onWrapPointerMove}
        onPointerUp={() => clearTimer()}
        onPointerCancel={() => clearTimer()}
      >
        <EstudioProgressCard
          kind="curso"
          nombre={curso.nombre}
          derivados={curso.derivados}
          fechaParen={fechaParentesisCurso(curso)}
          clasesStats={clasesStats}
          link={curso.link}
          className={menuRect ? "z-20 ring-2 ring-[var(--td-navy)]/40" : ""}
          bodyWrapper={(content) => (
            <Link
              href={href}
              prefetch={false}
              className="block min-w-0"
              onClick={nav.onClick}
              onPointerDown={nav.onPointerDown}
              onPointerMove={nav.onPointerMove}
              onPointerUp={nav.onPointerUp}
              onPointerCancel={nav.onPointerCancel}
              style={{ touchAction: "pan-y" }}
            >
              {content}
            </Link>
          )}
        />
      </div>

      {menuRect ? (
        <ChildContextMenu
          anchorRect={menuRect}
          entityName={curso.nombre}
          onSelect={(action) => {
            setMenuRect(null);
            longPressDone.current = false;
            onQuickAction(action);
          }}
          onClose={() => {
            setMenuRect(null);
            longPressDone.current = false;
          }}
        />
      ) : null}
    </>
  );
}
