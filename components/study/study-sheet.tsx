"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

type StudySheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const PANEL_MS = 550;
const BACKDROP_MS = 350;

/**
 * Capa modal (sheet flotante desde abajo) para altas contextuales sin cambiar de ruta.
 * slideIn un frame después de open para que la transición corra en Android.
 * Ver ADR 003.
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [presented, setPresented] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [backdropIn, setBackdropIn] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setPresented(true);
      setSlideIn(false);
      setBackdropIn(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      let frame2 = 0;
      const frame1 = requestAnimationFrame(() => {
        if (panelRef.current) {
          void panelRef.current.offsetHeight;
        }
        frame2 = requestAnimationFrame(() => {
          setBackdropIn(true);
          setSlideIn(true);
        });
      });

      return () => {
        cancelAnimationFrame(frame1);
        if (frame2) cancelAnimationFrame(frame2);
      };
    }

    setSlideIn(false);
    setBackdropIn(false);
    const timer = window.setTimeout(() => setPresented(false), PANEL_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!presented) return;
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
  }, [presented, onClose]);

  if (!presented) return null;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open && !slideIn}
    >
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-ink/40 transition-opacity ease-out motion-reduce:transition-none motion-reduce:bg-ink/30 ${
          backdropIn ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: `${BACKDROP_MS}ms` }}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)] transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
          slideIn
            ? "translate-y-0 motion-reduce:translate-y-0"
            : "translate-y-full motion-reduce:translate-y-0"
        }`}
        style={{ transitionDuration: `${PANEL_MS}ms` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="max-h-[min(70vh,32rem)] overflow-y-auto px-4 pb-4 pt-3"
          tabIndex={open ? 0 : -1}
        >
          <div
            className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-ink/15"
            aria-hidden
          />
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-sm font-medium text-ink-muted transition-colors hover:bg-accent-subtle hover:text-ink"
            >
              Cerrar
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
