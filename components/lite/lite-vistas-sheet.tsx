"use client";

import { Check, LayoutGrid, LayoutList, RectangleHorizontal } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { hapticOpen } from "@/lib/haptic";

export type CursosViewMode = "list" | "grid" | "hero";

type LiteVistasSheetProps = {
  open: boolean;
  viewActual: CursosViewMode;
  onSelect: (view: CursosViewMode) => void;
  onClose: () => void;
};

const VISTAS: { id: CursosViewMode; label: string; icon: any }[] = [
  { id: "list", label: "Vista de Lista", icon: LayoutList },
  { id: "grid", label: "Vista de Grilla", icon: LayoutGrid },
  { id: "hero", label: "Vista Extendida", icon: RectangleHorizontal },
];

export function LiteVistasSheet({
  open,
  viewActual,
  onSelect,
  onClose,
}: LiteVistasSheetProps) {
  useEffect(() => {
    if (!open) return;
    hapticOpen();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="lite-root lite-no-halo">
      <div
        className="lite-sheet-backdrop sheet-backdrop-enter"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vistas de Cursos"
        className="lite-sheet"
      >
        <div className="lite-sheet-grab" aria-hidden />
        <div className="mx-auto w-full max-w-[560px] px-5 pb-6 pt-3">
          <p className="lite-eyebrow">Visualización</p>
          <p className="lite-title mt-1 line-clamp-2">Tipo de vista</p>

          <div className="mt-4 space-y-2">
            {VISTAS.map((vista) => {
              const activo = vista.id === viewActual;
              const Icono = vista.icon;
              return (
                <button
                  key={vista.id}
                  type="button"
                  className="lite-option"
                  data-active={activo}
                  onClick={() => {
                    onSelect(vista.id);
                    onClose();
                  }}
                >
                  <Icono className="h-[18px] w-[18px] text-[var(--lt-text-3)]" />
                  <span className="flex-1 text-[15px] font-semibold text-[var(--lt-text)] ml-2 text-left">
                    {vista.label}
                  </span>
                  {activo ? (
                    <Check
                      className="h-[18px] w-[18px] text-[var(--lt-accent)]"
                      strokeWidth={2.4}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
