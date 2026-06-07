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
  /** `comfortable` = panel detalle mapa (widgets más grandes, en filas). */
  layout?: "compact" | "comfortable";
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
  layout = "compact",
}: ExploradorCardExpandedProps) {
  const comfortable = layout === "comfortable";
  const nivel = parseNivelEntendimiento(derivados.nivel_entendimiento);
  const invertidoMin = derivados.tiempo_consumido ?? 0;
  const restanteMin = derivados.tiempo_faltante_estimado;
  const showFechas = kind === "tema" || kind === "curso";
  const showNodoOnly = kind === "nodo" || kind === "logro";

  if (showNodoOnly) {
    return (
      <div
        className={`explorer-expand-panel border-t border-[var(--td-line)]/80 pt-2 ${
          comfortable ? "pt-3" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p
          className={`leading-snug text-[var(--td-ink-soft)] ${
            comfortable
              ? "text-sm leading-relaxed"
              : "line-clamp-4 text-[11px] leading-snug"
          }`}
        >
          {descripcion?.trim() ? descripcion : "Sin descripción"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`explorer-expand-panel border-t border-[var(--td-line)]/80 pt-2 ${
        comfortable ? "space-y-3.5 pt-3" : "space-y-2"
      }`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className={comfortable ? "space-y-2" : "space-y-1.5"}>
        <p
          className={`leading-snug text-[var(--td-ink-soft)] ${
            comfortable
              ? "text-sm leading-relaxed"
              : "line-clamp-2 text-[11px] leading-snug"
          }`}
        >
          {descripcion?.trim() ? descripcion : "Sin descripción"}
        </p>
        {showFechas ? (
          <div
            className={`flex justify-between gap-3 border-t border-[var(--td-line)]/60 ${
              comfortable ? "pt-2.5" : "pt-1.5"
            }`}
          >
            <div>
              <p
                className={`font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)] ${
                  comfortable ? "text-[10px]" : "text-[9px]"
                }`}
              >
                Inicio
              </p>
              <p
                className={`font-bold text-[var(--td-ink-soft)] ${
                  comfortable ? "text-sm" : "text-xs"
                }`}
              >
                {formatFechaCalendario(fechaInicio)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)] ${
                  comfortable ? "text-[10px]" : "text-[9px]"
                }`}
              >
                Fin
              </p>
              <p
                className={`font-bold text-[var(--td-ink-soft)] ${
                  comfortable ? "text-sm" : "text-xs"
                }`}
              >
                {formatFechaCalendario(fechaFin)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={
          comfortable ? "flex flex-col gap-2.5" : "grid grid-cols-2 gap-2"
        }
      >
        <EstudioNivelGauge
          nivel={nivel}
          size={comfortable ? "full" : "compact"}
        />
        <EstudioDedicacionWidget
          invertidoMin={invertidoMin}
          restanteMin={restanteMin}
          size={comfortable ? "full" : "compact"}
        />
      </div>

      <div
        className={`explorer-record-row flex gap-1.5 border-t border-[var(--td-line)]/70 ${
          comfortable ? "gap-2 pt-3" : "pt-2"
        }`}
      >
        <RecordActionTile
          label="Seguimientos"
          count={seguimientosCount}
          onOpen={onOpenSeguimientos}
          tone="seguimiento"
          comfortable={comfortable}
        />
        <RecordActionTile
          label="Conceptos"
          count={conceptosCount}
          onOpen={onOpenConceptos}
          comfortable={comfortable}
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
  comfortable = false,
}: {
  label: string;
  count: number;
  onOpen: () => void;
  tone?: "seguimiento";
  comfortable?: boolean;
}) {
  const tileClass =
    tone === "seguimiento"
      ? recordActionTileClass("seguimiento")
      : "explorer-record-tile border border-[var(--td-line)] bg-[var(--td-line-soft)]/35";

  return (
    <div
      className={`${tileClass} flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg ${
        comfortable ? "px-2.5 py-2" : "px-2 py-1.5"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <p
          className={`truncate font-extrabold uppercase tracking-[0.08em] text-[var(--td-faint)] ${
            comfortable ? "text-[10px]" : "text-[9px]"
          }`}
        >
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
        className={`explorer-action-plus inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] bg-white font-bold leading-none text-[var(--td-navy)] shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-[var(--td-navy)]/35 hover:bg-[var(--td-navy)] hover:text-white hover:shadow-md active:scale-95 ${
          comfortable ? "h-7 w-7 text-sm" : "h-6 w-6 text-xs"
        }`}
      >
        +
      </button>
    </div>
  );
}
