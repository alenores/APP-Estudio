"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatFechaCalendario } from "@/lib/format-fecha-calendario";
import {
  LITE_RECIENTES_VISIBLES,
  type LiteEmpezado,
} from "@/lib/academico-lite-recientes";
import type { LiteItem } from "@/lib/academico-lite-read";
import { hapticOpen } from "@/lib/haptic";

type LiteRecientesProps = {
  filas: LiteEmpezado[];
  onSelect: (item: LiteItem) => void;
};

/**
 * Arriba del listado de Temas: las últimas clases y cursos empezados, y el
 * historial completo en un sheet (ADR 012 §10). Panel instantáneo, fade solo del velo.
 */
export function LiteRecientes({ filas, onSelect }: LiteRecientesProps) {
  const [abierto, setAbierto] = useState(false);
  const visibles = filas.slice(0, LITE_RECIENTES_VISIBLES);

  if (filas.length === 0) return null;

  const elegir = (item: LiteItem) => {
    setAbierto(false);
    onSelect(item);
  };

  return (
    <section aria-label="Lo último que estudiaste">
      <p className="lite-eyebrow mb-2">Lo último</p>
      <div className="lite-recientes">
        {visibles.map((fila) => (
          <FilaEmpezado
            key={`${fila.item.kind}-${fila.item.id}`}
            fila={fila}
            onSelect={() => elegir(fila.item)}
          />
        ))}
        <button
          type="button"
          className="lite-recientes-mas"
          onClick={() => setAbierto(true)}
        >
          Más
        </button>
      </div>

      <HistorialSheet
        open={abierto}
        filas={filas}
        onSelect={elegir}
        onClose={() => setAbierto(false)}
      />
    </section>
  );
}

function FilaEmpezado({
  fila,
  onSelect,
  conFecha = false,
}: {
  fila: LiteEmpezado;
  onSelect: () => void;
  conFecha?: boolean;
}) {
  const padre = fila.item.parentNombre;

  return (
    <button type="button" className="lite-recientes-row" onClick={onSelect}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-semibold leading-snug text-[var(--lt-text)]">
          {fila.item.nombre}
        </span>
        {padre ? (
          <span className="mt-0.5 block truncate text-[12px] text-[var(--lt-text-3)]">
            {padre}
          </span>
        ) : null}
      </span>
      {conFecha ? (
        <span className="flex-none text-[12px] font-semibold tabular-nums text-[var(--lt-text-2)]">
          {formatFechaCalendario(fila.fecha)}
        </span>
      ) : null}
      <ChevronRight
        className="h-[16px] w-[16px] flex-none text-[var(--lt-text-3)]"
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

function HistorialSheet({
  open,
  filas,
  onSelect,
  onClose,
}: {
  open: boolean;
  filas: LiteEmpezado[];
  onSelect: (item: LiteItem) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    hapticOpen();
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", onKey);
    };
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
        aria-label="Historial de lo último que estudiaste"
        className="lite-sheet"
      >
        <div className="lite-sheet-grab" aria-hidden />
        <div className="mx-auto w-full max-w-[560px] px-5 pb-6 pt-3">
          <p className="lite-eyebrow">Lo último</p>
          <p className="lite-title mt-1">Historial</p>
          <div className="lite-sheet-scroll mt-4">
            <div className="lite-recientes">
              {filas.map((fila) => (
                <FilaEmpezado
                  key={`${fila.item.kind}-${fila.item.id}`}
                  fila={fila}
                  conFecha
                  onSelect={() => onSelect(fila.item)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
