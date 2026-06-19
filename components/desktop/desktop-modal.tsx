"use client";

import {
  desktopModalToneClass,
  type EstudioSurfaceTone,
} from "@/lib/estudio-shell-tone";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DesktopModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Clases extra para el subtítulo (ej. cursiva en buscador). */
  subtitleClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Modal grande para tablas de registros en explorador PC. */
  size?: "default" | "wide" | "xlarge";
  /** Tono visual del registro (cabecera / pie teñidos en PC). */
  tone?: EstudioSurfaceTone;
};

/** Modal escritorio (portal, velo opaco). ADR 008 — no usar en móvil. */
export function DesktopModal({
  open,
  onClose,
  title,
  subtitle,
  subtitleClassName = "",
  children,
  footer,
  wide = false,
  size,
  tone,
}: DesktopModalProps) {
  const toneClass = desktopModalToneClass(tone);
  const resolvedSize = size ?? (wide ? "wide" : "default");
  const sizeClass =
    resolvedSize === "xlarge"
      ? "max-h-[min(94vh,980px)] max-w-[min(96vw,1280px)]"
      : resolvedSize === "wide"
        ? "max-h-[min(88vh,900px)] max-w-4xl"
        : "max-h-[min(88vh,900px)] max-w-2xl";
  const rootPadClass =
    resolvedSize === "xlarge"
      ? "p-3 pt-[min(3vh,1.25rem)]"
      : "p-6 pt-[min(8vh,4rem)]";
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
    <div className={`desktop-modal-root fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto ${rootPadClass}`}>
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
        className={`desktop-modal-theme relative z-[81] flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--td-line)] shadow-[var(--td-shadow)] ${toneClass} ${sizeClass}`}
      >
        <header className="desktop-modal-header shrink-0 border-b border-[var(--td-line)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                id="desktop-modal-title"
                className="text-base font-bold text-[var(--td-ink)]"
              >
                {title}
              </p>
              {subtitle ? (
                <p
                  className={`mt-0.5 truncate text-sm text-[var(--td-ink-soft)] ${subtitleClassName}`}
                >
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
        <div className="desktop-modal-body min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="desktop-modal-footer shrink-0 border-t border-[var(--td-line)] bg-[var(--td-line-soft)]/40 px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
