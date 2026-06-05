"use client";

import { EstudioDedicacionWidget } from "@/components/shared/widgets/estudio-dedicacion-widget";
import { EstudioNivelGauge } from "@/components/shared/widgets/estudio-nivel-gauge";
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
      className="explorer-expand-panel space-y-3 border-t border-[var(--td-line)]/80 pt-3"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="space-y-1.5">
        <p className="text-xs leading-relaxed text-[var(--td-ink-soft)]">
          {descripcion?.trim() ? descripcion : "Sin descripción"}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--td-faint)]">
          Fin estimado{" "}
          <span className="normal-case tracking-normal text-[var(--td-ink-soft)]">
            {formatFechaCalendario(fechaFin)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <EstudioNivelGauge nivel={nivel} size="compact" />
        <EstudioDedicacionWidget
          invertidoMin={invertidoMin}
          restanteMin={restanteMin}
          size="compact"
        />
      </div>

      <div className="explorer-record-row flex gap-2 border-t border-[var(--td-line)]/70 pt-3">
        <RecordActionTile
          label="Seguimientos"
          count={seguimientosCount}
          onOpen={onOpenSeguimientos}
        />
        <RecordActionTile
          label="Conceptos"
          count={conceptosCount}
          onOpen={onOpenConceptos}
        />
      </div>
    </div>
  );
}

function RecordActionTile({
  label,
  count,
  onOpen,
}: {
  label: string;
  count: number;
  onOpen: () => void;
}) {
  return (
    <div className="explorer-record-tile flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)]/35 px-2.5 py-2">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)]">
          {label}
        </p>
        <p className="text-lg font-extrabold leading-none text-[var(--td-ink)]">
          {count}
        </p>
      </div>
      <button
        type="button"
        title={`Abrir ${label.toLowerCase()}`}
        aria-label={`Abrir ${label.toLowerCase()}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="explorer-action-plus inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] bg-white text-sm font-bold leading-none text-[var(--td-navy)] shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-[var(--td-navy)]/35 hover:bg-[var(--td-navy)] hover:text-white hover:shadow-md active:scale-95"
      >
        +
      </button>
    </div>
  );
}
