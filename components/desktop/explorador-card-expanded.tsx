"use client";

import {
  ExploradorMiniDedicacion,
  ExploradorMiniEntendimiento,
} from "@/components/desktop/explorador-mini-widgets";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import { formatFechaCalendario } from "@/lib/format-fecha-calendario";
import { parseNivelEntendimiento } from "@/lib/nivel-entendimiento-ui";

type ExploradorCardExpandedProps = {
  descripcion: string | null;
  fechaFin: string | null;
  seguimientosCount: number;
  conceptosCount: number;
  derivados: SeguimientoDerivados;
  onOpenSeguimientos: () => void;
  onOpenConceptos: () => void;
};

export function ExploradorCardExpanded({
  descripcion,
  fechaFin,
  seguimientosCount,
  conceptosCount,
  derivados,
  onOpenSeguimientos,
  onOpenConceptos,
}: ExploradorCardExpandedProps) {
  const nivel = parseNivelEntendimiento(derivados.nivel_entendimiento);
  const invertidoMin = derivados.tiempo_consumido ?? 0;
  const restanteMin = derivados.tiempo_faltante_estimado;

  return (
    <div
      className="space-y-2.5 border-t border-[var(--td-line)]/80 pt-2.5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <p className="text-xs leading-relaxed text-[var(--td-ink-soft)]">
        {descripcion?.trim() ? descripcion : "Sin descripción"}
      </p>
      <p className="text-[10px] font-semibold text-[var(--td-faint)]">
        Fin estimado{" "}
        <span className="font-bold text-[var(--td-ink-soft)]">
          {formatFechaCalendario(fechaFin)}
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <RecordCountRow
          label="Seguimientos"
          count={seguimientosCount}
          onOpen={onOpenSeguimientos}
        />
        <RecordCountRow
          label="Conceptos"
          count={conceptosCount}
          onOpen={onOpenConceptos}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <ExploradorMiniEntendimiento nivel={nivel} />
        <ExploradorMiniDedicacion
          invertidoMin={invertidoMin}
          restanteMin={restanteMin}
        />
      </div>
    </div>
  );
}

function RecordCountRow({
  label,
  count,
  onOpen,
}: {
  label: string;
  count: number;
  onOpen: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--td-ink-soft)]">
      <span className="font-semibold text-[var(--td-faint)]">{label}</span>
      <b className="text-[var(--td-ink)]">{count}</b>
      <button
        type="button"
        title={`Abrir ${label.toLowerCase()}`}
        aria-label={`Abrir ${label.toLowerCase()}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] bg-white text-[11px] font-bold leading-none text-[var(--td-navy)] transition-colors hover:border-[var(--td-navy)]/40 hover:bg-[var(--td-line-soft)]"
      >
        +
      </button>
    </span>
  );
}
