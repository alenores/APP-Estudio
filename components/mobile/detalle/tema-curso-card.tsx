"use client";

import type { CursoConDerivados } from "@/app/types/estudio";
import {
  ChildContextMenu,
  type ChildQuickAction,
} from "@/components/mobile/cards/child-context-menu";
import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";
import type { ClasesCursoStats } from "@/lib/curso-clases-stats";
import { fechaParentesisCurso } from "@/lib/curso-card-fecha";
import { LONG_PRESS_MS } from "@/lib/fab-open-delay";
import {
  estadoFillDetalleClass,
  estadoLabel,
  estadoStripDetalleClass,
} from "@/lib/estado-ui";
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
  type CSSProperties,
  type PointerEvent,
} from "react";

const MOVE_CANCEL_PX = 14;
const DONUT_R = 11;
const DONUT_C = 2 * Math.PI * DONUT_R;

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

  const pct = curso.derivados.porcentaje_avance ?? 0;
  const estadoTexto = estadoLabel(curso.derivados.etiqueta_estado) ?? "—";
  const fechaParen = fechaParentesisCurso(curso);
  const { terminadas, total } = clasesStats;
  const donutOffset =
    total > 0 ? DONUT_C * (1 - terminadas / total) : DONUT_C;

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

  const fillStyle: CSSProperties =
    pct > 0 ? { width: `${Math.min(100, pct)}%` } : { display: "none" };

  return (
    <>
      <div
        ref={wrapRef}
        className={`td-ccard relative flex cursor-pointer overflow-hidden rounded-[15px] border border-[var(--td-line)] bg-[var(--td-card)] transition-[transform,box-shadow] duration-150 ${pressing ? "scale-[0.99]" : ""} ${menuRect ? "z-20 ring-2 ring-[var(--td-navy)]/40" : ""}`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onWrapPointerDown}
        onPointerMove={onWrapPointerMove}
        onPointerUp={() => clearTimer()}
        onPointerCancel={() => clearTimer()}
      >
        <div className={estadoStripDetalleClass(curso.derivados.etiqueta_estado)}>
          <span>{estadoTexto}</span>
        </div>
        <div className="relative min-w-0 flex-1 px-4 py-3.5">
          {pct > 0 ? (
            <div
              className={estadoFillDetalleClass(curso.derivados.etiqueta_estado)}
              style={fillStyle}
              aria-hidden
            />
          ) : null}
          <Link
            href={href}
            prefetch={false}
            className="relative z-[1] block min-w-0"
            onClick={nav.onClick}
            onPointerDown={nav.onPointerDown}
            onPointerMove={nav.onPointerMove}
            onPointerUp={nav.onPointerUp}
            onPointerCancel={nav.onPointerCancel}
            style={{ touchAction: "pan-y" }}
          >
            <div className="text-[15px] font-bold leading-snug text-[var(--td-ink)]">
              {curso.nombre}
              {fechaParen ? (
                <span className="ml-1 text-[13px] font-semibold text-[var(--td-fecha-muted)]">
                  {fechaParen}
                </span>
              ) : null}
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--td-donut-text)]">
                <svg
                  className="h-6 w-6 shrink-0"
                  viewBox="0 0 28 28"
                  aria-hidden
                >
                  <circle
                    className="fill-none stroke-[var(--td-donut-track)]"
                    cx="14"
                    cy="14"
                    r={DONUT_R}
                    strokeWidth="4.5"
                  />
                  <circle
                    className="fill-none stroke-[var(--td-donut-val)]"
                    cx="14"
                    cy="14"
                    r={DONUT_R}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={DONUT_C}
                    strokeDashoffset={donutOffset}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
                <span>
                  <b className="font-extrabold text-[var(--td-donut-num)]">
                    {terminadas}
                  </b>
                  /{total} clases
                </span>
              </span>
              <span className="ml-auto flex items-center gap-3">
                <span className="text-base font-extrabold text-[var(--td-ink)]">
                  {pct}%
                </span>
                {curso.link?.trim() ? (
                  <PlatformLinkIcon
                    link={curso.link}
                    size="sm"
                    className="!h-7 !w-7 shrink-0 rounded-[9px]"
                  />
                ) : null}
              </span>
            </div>
          </Link>
        </div>
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
