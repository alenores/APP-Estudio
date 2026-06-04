"use client";

import { useEffect, useId } from "react";

type StudySheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

/**
 * Capa modal (sheet desde abajo) para altas contextuales sin cambiar de ruta.
 * Clic en el fondo o Escape cierra. Ver ADR 003.
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-border bg-paper-elevated px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
  );
}
