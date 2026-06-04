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
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearAnimStyles(panel: HTMLElement, backdrop: HTMLElement) {
  panel.style.transform = "";
  panel.style.opacity = "";
  backdrop.style.opacity = "";
}

/**
 * Sheet desde abajo; slide con Web Animations API (fiable en Android).
 * Ver ADR 003.
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const animsRef = useRef<Animation[]>([]);
  const [presented, setPresented] = useState(false);

  useLayoutEffect(() => {
    if (open) setPresented(true);
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop || !presented) return;

    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const reduced = prefersReducedMotion();

    if (open) {
      if (reduced) {
        clearAnimStyles(panel, backdrop);
        return;
      }

      panel.style.transform = "translateY(100%)";
      backdrop.style.opacity = "0";
      void panel.offsetHeight;

      const panelAnim = panel.animate(
        [
          { transform: "translateY(100%)" },
          { transform: "translateY(0)" },
        ],
        { duration: PANEL_MS, easing: EASING, fill: "forwards" },
      );
      const backdropAnim = backdrop.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: BACKDROP_MS, easing: "ease-out", fill: "forwards" },
      );
      animsRef.current = [panelAnim, backdropAnim];

      return () => {
        panelAnim.cancel();
        backdropAnim.cancel();
        clearAnimStyles(panel, backdrop);
      };
    }

    if (reduced) {
      clearAnimStyles(panel, backdrop);
      setPresented(false);
      return;
    }

    const panelAnim = panel.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }],
      { duration: PANEL_MS, easing: EASING, fill: "forwards" },
    );
    const backdropAnim = backdrop.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: BACKDROP_MS, easing: "ease-out", fill: "forwards" },
    );
    animsRef.current = [panelAnim, backdropAnim];

    let cancelled = false;
    void Promise.all([panelAnim.finished, backdropAnim.finished]).then(() => {
      if (cancelled) return;
      clearAnimStyles(panel, backdrop);
      setPresented(false);
    });

    return () => {
      cancelled = true;
      panelAnim.cancel();
      backdropAnim.cancel();
      clearAnimStyles(panel, backdrop);
    };
  }, [open, presented]);

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
      aria-hidden={!open}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Cerrar"
        tabIndex={open ? 0 : -1}
        className="absolute inset-0 bg-ink/40 motion-reduce:bg-ink/30"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)] will-change-transform"
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
