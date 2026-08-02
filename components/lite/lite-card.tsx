"use client";

import { ChevronRight } from "lucide-react";
import { LiteEstadoBadge, LiteTipoBadge } from "@/components/lite/lite-badges";
import { LiteMediaRow } from "@/components/lite/lite-media-icon";
import { liteMedios } from "@/lib/academico-lite-media";
import type { LiteItem } from "@/lib/academico-lite-read";

type LiteCardProps = {
  item: LiteItem;
  /** Muestra el nombre del padre arriba del título (listado plano de cursos). */
  mostrarPadre?: boolean;
  onSelect: (item: LiteItem) => void;
};

/**
 * Card del listado. Solo tres datos además del nombre (ADR 012):
 * medio (video / documento), estado y tipo de estudio.
 */
export function LiteCard({ item, mostrarPadre = false, onSelect }: LiteCardProps) {
  const medios = liteMedios(item);
  const progreso =
    item.hijosTotal > 0
      ? Math.round((item.hijosTerminados / item.hijosTotal) * 100)
      : null;

  return (
    <button type="button" className="lite-card p-4" onClick={() => onSelect(item)}>
      <span className="flex items-start gap-3.5">
        <LiteMediaRow medios={medios} />

        <span className="min-w-0 flex-1">
          {mostrarPadre && item.parentNombre ? (
            <span className="mb-1 block truncate text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--lt-text-3)]">
              {item.parentNombre}
            </span>
          ) : null}

          <span className="lite-title block">{item.nombre}</span>

          <span className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <LiteEstadoBadge estado={item.estado} />
            <LiteTipoBadge tipo={item.tipoEstudio} />
          </span>

          {progreso !== null ? (
            <span className="mt-3 flex items-center gap-2.5">
              <span className="lite-rail min-w-0 flex-1">
                <span style={{ width: `${progreso}%` }} />
              </span>
              <span className="flex-none text-[11.5px] font-semibold tabular-nums text-[var(--lt-text-3)]">
                {item.hijosTerminados}/{item.hijosTotal}
              </span>
            </span>
          ) : null}
        </span>

        <ChevronRight
          className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--lt-text-3)]"
          strokeWidth={2}
          aria-hidden
        />
      </span>
    </button>
  );
}
