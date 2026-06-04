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

function cancelAnims(panel: HTMLElement, backdrop: HTMLElement) {
  panel.getAnimations().forEach((a) => a.cancel());
  backdrop.getAnimations().forEach((a) => a.cancel());
}

function clearAnimStyles(panel: HTMLElement, backdrop: HTMLElement) {
  panel.style.transform = "";
  panel.style.opacity = "";
  backdrop.style.opacity = "";
}

/**
 * Sheet desde abajo. Tras el primer uso queda en el DOM; la apertura usa WAAPI + doble rAF (Android).
 * Ver ADR 003.
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const openRunRef = useRef(0);
  const [retained, setRetained] = useState(false);
  const [closing, setClosing] = useState(false);

  useLayoutEffect(() => {
    if (!open) return;
    setRetained(true);
    setClosing(false);

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    cancelAnims(panel, backdrop);
    panel.style.transform = "translateY(100%)";
    backdrop.style.opacity = "0";
  }, [open]);

  useEffect(() => {
    if (!open || !retained) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    if (prefersReducedMotion()) {
      clearAnimStyles(panel, backdrop);
      return;
    }

    const runId = ++openRunRef.current;
    let frame2 = 0;

    const frame1 = requestAnimationFrame(() => {
      void panel.offsetHeight;
      frame2 = requestAnimationFrame(() => {
        if (runId !== openRunRef.current || !open) return;

        cancelAnims(panel, backdrop);
        panel.style.transform = "";

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

        void Promise.all([panelAnim.finished, backdropAnim.finished]).catch(
          () => undefined,
        );
      });
    });

    return () => {
      openRunRef.current += 1;
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [open, retained]);

  useEffect(() => {
    if (open || !retained) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    setClosing(true);

    if (prefersReducedMotion()) {
      clearAnimStyles(panel, backdrop);
      setClosing(false);
      return;
    }

    cancelAnims(panel, backdrop);

    const panelAnim = panel.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }],
      { duration: PANEL_MS, easing: EASING, fill: "forwards" },
    );
    const backdropAnim = backdrop.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: BACKDROP_MS, easing: "ease-out", fill: "forwards" },
    );

    let cancelled = false;
    void Promise.all([panelAnim.finished, backdropAnim.finished])
      .then(() => {
        if (cancelled) return;
        clearAnimStyles(panel, backdrop);
        setClosing(false);
      })
      .catch(() => setClosing(false));

    return () => {
      cancelled = true;
      panelAnim.cancel();
      backdropAnim.cancel();
      clearAnimStyles(panel, backdrop);
      setClosing(false);
    };
  }, [open, retained]);

  const active = open || closing;

  useEffect(() => {
    if (!active) return;
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
  }, [active, onClose]);

  if (!retained) return null;

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
