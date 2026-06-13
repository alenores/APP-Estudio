"use client";

import { hapticOpen } from "@/lib/haptic";
import {
  studySheetToneClass,
  type EstudioSurfaceTone,
} from "@/lib/estudio-shell-tone";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Desplazamiento hacia abajo (px) para cerrar con swipe. */
const SWIPE_DISMISS_PX = 80;

type StudySheetProps = {
  open: boolean;
  onClose: () => void;
  /** Título en la franja superior (ej. «Nuevo seguimiento»). */
  title: string;
  /** Segunda línea: tema, curso o clase al que se agrega el registro. */
  subtitle?: string;
  /** Tono visual del registro que se carga (tema, curso, clase, seguimiento). */
  tone?: EstudioSurfaceTone;
  children: React.ReactNode;
};

/**
 * Sheet flotante para altas contextuales. Sin slide al abrir (ADR 006).
 * Cierre: tap fuera, ✕, Escape, swipe abajo (manija/cabecera o scroll arriba).
 */
export function StudySheet({
  open,
  onClose,
  title,
  subtitle,
  tone,
  children,
}: StudySheetProps) {
  const toneClass = studySheetToneClass(tone);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!open || !mounted) return null;

  return createPortal(
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
        className={`relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)] touch-pan-y ${toneClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-sheet-grab
          className={`study-sheet-header touch-none select-none px-4 pb-3 pt-2 ${
            tone ? "" : "bg-accent text-white"
          }`}
        >
          <div
            className={`study-sheet-grab mx-auto mb-2 h-1 w-10 shrink-0 rounded-full ${
              tone ? "" : "bg-white/35"
            }`}
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-semibold leading-tight">
                {title}
              </h2>
              {subtitle ? (
                <p
                  className={`study-sheet-subtitle mt-0.5 truncate text-sm font-medium ${
                    tone ? "" : "text-white/85"
                  }`}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className={`study-sheet-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl leading-none transition-colors active:opacity-80 ${
                tone ? "" : "bg-white/15 text-white active:bg-white/25"
              }`}
            >
              ×
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={`study-sheet-body max-h-[min(62vh,30rem)] overflow-y-auto overscroll-contain px-4 pb-4 pt-4 ${
            tone ? "" : "bg-paper-elevated"
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
