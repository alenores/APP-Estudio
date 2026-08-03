"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { liteEstadoClass, liteEstadoLabel } from "@/components/lite/lite-badges";
import { ESTADOS_SEGUIMIENTO, type EstadoSeguimiento } from "@/lib/estado-ui";
import { hapticOpen } from "@/lib/haptic";

type LiteEstadoSheetProps = {
  open: boolean;
  titulo: string;
  estadoActual: EstadoSeguimiento | null;
  guardando: boolean;
  onSelect: (estado: EstadoSeguimiento) => void;
  onClose: () => void;
};

/**
 * Único alta de seguimiento en lite: el estado (ADR 012).
 *
 * Panel instantáneo + fade solo del velo, según ADR 006 — nada de `translateY`
 * animado al montar.
 */
export function LiteEstadoSheet({
  open,
  titulo,
  estadoActual,
  guardando,
  onSelect,
  onClose,
}: LiteEstadoSheetProps) {
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
        aria-label={`Estado de ${titulo}`}
        className="lite-sheet"
      >
        <div className="lite-sheet-grab" aria-hidden />
        <div className="mx-auto w-full max-w-[560px] px-5 pb-6 pt-3">
          <p className="lite-eyebrow">Estado</p>
          <p className="lite-title mt-1 line-clamp-2">{titulo}</p>

          <div className="mt-4 space-y-2">
            {ESTADOS_SEGUIMIENTO.map((estado) => {
              const activo = estado === estadoActual;
              return (
                <button
                  key={estado}
                  type="button"
                  className="lite-option"
                  data-active={activo}
                  disabled={guardando}
                  onClick={() => onSelect(estado)}
                >
                  <span
                    className={`lite-estado-dot ${liteEstadoClass(estado)}`}
                    aria-hidden
                  />
                  <span className="flex-1 text-[15px] font-semibold text-[var(--lt-text)]">
                    {liteEstadoLabel(estado)}
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

          <p className="mt-4 text-center text-[12px] leading-relaxed text-[var(--lt-text-3)]">
            {guardando
              ? "Guardando…"
              : "En esta pantalla solo se registra el estado."}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
