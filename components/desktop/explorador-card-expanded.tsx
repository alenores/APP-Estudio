"use client";

import { EstudioDedicacionWidget } from "@/components/shared/widgets/estudio-dedicacion-widget";
import { EstudioNivelGauge } from "@/components/shared/widgets/estudio-nivel-gauge";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import { formatFechaCalendario } from "@/lib/format-fecha-calendario";
import { recordActionTileClass } from "@/lib/estudio-shell-tone";
import { parseNivelEntendimiento } from "@/lib/nivel-entendimiento-ui";

type ExploradorCardExpandedProps = {
  kind: "tema" | "curso" | "clase" | "nodo" | "logro";
  descripcion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  seguimientosCount: number;
  conceptosCount: number;
  derivados: SeguimientoDerivados;
  onOpenSeguimientos: () => void;
  onOpenConceptos: () => void;
};

export function ExploradorCardExpanded({
  kind,
  descripcion,
  fechaInicio,
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
  const showFechas = kind === "tema" || kind === "curso";
  const showNodoOnly = kind === "nodo" || kind === "logro";

  if (showNodoOnly) {
    return (
      <div
        className="explorer-expand-panel border-t border-[var(--td-line)]/80 pt-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="line-clamp-4 text-[11px] leading-snug text-[var(--td-ink-soft)]">
          {descripcion?.trim() ? descripcion : "Sin descripción"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="explorer-expand-panel space-y-2 border-t border-[var(--td-line)]/80 pt-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="space-y-1.5">
        <p className="line-clamp-2 text-[11px] leading-snug text-[var(--td-ink-soft)]">
          {descripcion?.trim() ? descripcion : "Sin descripción"}
        </p>
        {showFechas ? (
          <div className="flex justify-between gap-3 border-t border-[var(--td-line)]/60 pt-1.5">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)]">
                Inicio
              </p>
              <p className="text-xs font-bold text-[var(--td-ink-soft)]">
                {formatFechaCalendario(fechaInicio)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)]">
                Fin
              </p>
              <p className="text-xs font-bold text-[var(--td-ink-soft)]">
                {formatFechaCalendario(fechaFin)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <EstudioNivelGauge nivel={nivel} size="compact" />
        <EstudioDedicacionWidget
          invertidoMin={invertidoMin}
          restanteMin={restanteMin}
          size="compact"
        />
      </div>

      <div className="explorer-record-row flex gap-1.5 border-t border-[var(--td-line)]/70 pt-2">
        <RecordActionTile
          label="Seguimientos"
          count={seguimientosCount}
          onOpen={onOpenSeguimientos}
          tone="seguimiento"
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
  tone,
}: {
  label: string;
  count: number;
  onOpen: () => void;
  tone?: "seguimiento";
}) {
  const tileClass =
    tone === "seguimiento"
      ? recordActionTileClass("seguimiento")
      : "explorer-record-tile border border-[var(--td-line)] bg-[var(--td-line-soft)]/35";

  return (
    <div
      className={`${tileClass} flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg px-2 py-1.5`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.08em] text-[var(--td-faint)]">
          {label}{" "}
          <span className="font-extrabold tabular-nums text-[var(--td-ink)]">
            ({count})
          </span>
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
        className="explorer-action-plus inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] bg-white text-xs font-bold leading-none text-[var(--td-navy)] shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-[var(--td-navy)]/35 hover:bg-[var(--td-navy)] hover:text-white hover:shadow-md active:scale-95"
      >
        +
      </button>
    </div>
  );
}
