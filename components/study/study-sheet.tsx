"use client";

import { useEffect, useId, useRef } from "react";

/** Desplazamiento hacia abajo (px) para cerrar con swipe. */
const SWIPE_DISMISS_PX = 80;

type StudySheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/** Vibración corta al abrir (Android); falla en silencio si no hay soporte. */
function hapticOpen() {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  } catch {
    /* sin permiso o navegador sin API */
  }
}

/**
 * Sheet flotante para altas contextuales. Sin slide al abrir (ADR 006).
 * Cierre: tap fuera, Cerrar, Escape, swipe abajo (manija/cabecera o scroll arriba).
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    hapticOpen();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const scrollEl = scrollRef.current;
    const panelEl = panelRef.current;
    if (!scrollEl || !panelEl) return;
    const scrollNode: HTMLDivElement = scrollEl;
    const panelNode: HTMLDivElement = panelEl;

    let startY = 0;
    let dragging = false;
    let offset = 0;
    let allowDrag = false;

    function clearDragTransform() {
      panelNode.style.transform = "";
      panelNode.style.transition = "";
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const atTop = scrollNode.scrollTop <= 2;
      const onGrab = (e.target as Element).closest("[data-sheet-grab]");
      if (!atTop && !onGrab) return;

      startY = e.touches[0].clientY;
      dragging = true;
      allowDrag = true;
      offset = 0;
      panelNode.style.transition = "none";
    }

    function onTouchMove(e: TouchEvent) {
      if (!dragging || !allowDrag) return;
      const dy = e.touches[0].clientY - startY;

      if (dy <= 0) {
        offset = 0;
        clearDragTransform();
        return;
      }

      if (scrollNode.scrollTop > 2) {
        dragging = false;
        allowDrag = false;
        clearDragTransform();
        return;
      }

      e.preventDefault();
      offset = dy;
      panelNode.style.transform = `translateY(${dy}px)`;
    }

    function onTouchEnd() {
      if (!dragging) return;
      dragging = false;
      allowDrag = false;
      clearDragTransform();
      if (offset >= SWIPE_DISMISS_PX) onClose();
      offset = 0;
    }

    scrollNode.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollNode.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollNode.addEventListener("touchend", onTouchEnd);
    scrollNode.addEventListener("touchcancel", onTouchEnd);

    return () => {
      scrollNode.removeEventListener("touchstart", onTouchStart);
      scrollNode.removeEventListener("touchmove", onTouchMove);
      scrollNode.removeEventListener("touchend", onTouchEnd);
      scrollNode.removeEventListener("touchcancel", onTouchEnd);
      clearDragTransform();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="Cerrar"
        className="sheet-backdrop-enter absolute inset-0 bg-ink/40"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)] touch-pan-y"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollRef}
          className="max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain px-4 pb-4 pt-3"
        >
          <div data-sheet-grab className="touch-none select-none">
            <div
              className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-ink/20"
              aria-hidden
            />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm font-medium text-ink-muted transition-colors hover:bg-accent-subtle hover:text-ink"
              >
                Cerrar
              </button>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
