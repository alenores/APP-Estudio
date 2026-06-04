"use client";

import { useEffect, useId } from "react";

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
 * Sheet flotante para altas contextuales. Sin slide del panel (no fiable en Android).
 * Velo con fade CSS opcional + vibración al abrir. Ver ADR 003.
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-4 pb-4 pt-3">
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
