"use client";

import { useEffect, useId } from "react";

type StudySheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/**
 * Capa modal (sheet flotante desde abajo) para altas contextuales sin cambiar de ruta.
 * Clic en el fondo o Escape cierra. Panel con margen inferior para ver el padre debajo.
 * Ver ADR 003.
 */
export function StudySheet({ open, onClose, title, children }: StudySheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
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

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-end px-3 pb-[max(1rem,env(safe-area-inset-bottom))] transition-opacity duration-350 ease-out motion-reduce:transition-none ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={open ? 0 : -1}
        className="absolute inset-0 bg-ink/40 motion-reduce:bg-ink/30"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        className={`relative z-50 mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-paper-elevated shadow-[0_8px_40px_rgba(30,41,59,0.22),0_-4px_20px_rgba(30,41,59,0.08)] transition-transform duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "translate-y-0 motion-reduce:translate-y-0"
            : "translate-y-full motion-reduce:translate-y-0"
        }`}
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
