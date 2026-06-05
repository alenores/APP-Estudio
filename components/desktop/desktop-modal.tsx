"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DesktopModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

/** Modal escritorio (portal, velo opaco). ADR 008 — no usar en móvil. */
export function DesktopModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: DesktopModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="desktop-modal-root fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-6 pt-[min(8vh,4rem)]">
      <button
        type="button"
        aria-label="Cerrar"
        className="fixed inset-0 bg-[rgba(15,23,42,0.52)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="desktop-modal-title"
        className={`desktop-modal-theme relative z-[81] flex max-h-[min(88vh,900px)] w-full flex-col overflow-hidden rounded-2xl border border-[var(--td-line)] shadow-[var(--td-shadow)] ${
          wide ? "max-w-4xl" : "max-w-2xl"
        }`}
      >
        <header className="shrink-0 border-b border-[var(--td-line)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                id="desktop-modal-title"
                className="text-base font-bold text-[var(--td-ink)]"
              >
                {title}
              </p>
              {subtitle ? (
                <p className="mt-0.5 truncate text-sm text-[var(--td-ink-soft)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-[var(--td-line)] px-2.5 py-1 text-sm font-medium text-[var(--td-ink-soft)] hover:bg-[var(--td-line-soft)]"
            >
              Cerrar
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-[var(--td-line)] bg-[var(--td-line-soft)]/40 px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
