"use client";

import { MiniCard } from "@/components/ui/mini-card";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import { porcionesTiempoPie } from "@/lib/nivel-entendimiento-ui";

export type EstudioDedicacionWidgetProps = {
  invertidoMin: number;
  restanteMin: number | null;
  size?: "compact" | "full";
  delayClass?: string;
  className?: string;
};

const PIE_VIEW = 48;

function polar(cx: number, cy: number, r: number, degFromTop: number) {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  if (endDeg - startDeg >= 360) endDeg = startDeg + 359.999;
  if (endDeg <= startDeg) return "";
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

const COLOR_INV = "var(--td-navy)";
const COLOR_REST = "var(--td-e-gris)";

export function EstudioDedicacionWidget({
  invertidoMin,
  restanteMin,
  size = "full",
  delayClass = "",
  className = "",
}: EstudioDedicacionWidgetProps) {
  const compact = size === "compact";
  const cx = PIE_VIEW / 2;
  const cy = PIE_VIEW / 2;
  const r = compact ? 20.5 : 21.5;

  const pie = porcionesTiempoPie(invertidoMin, restanteMin);
  const invDeg = pie.total > 0 ? (pie.invertido / pie.total) * 360 : 0;
  const invPath = invDeg > 0 ? pieSlicePath(cx, cy, r, 0, invDeg) : "";
  const restPath =
    invDeg < 360 && pie.total > 0
      ? pieSlicePath(cx, cy, r, invDeg, 360)
      : "";

  return (
    <MiniCard
      title="Dedicación"
      delayClass={delayClass}
      className={`${compact ? "min-h-[5.25rem] !py-1.5" : ""} ${className}`}
    >
      <div className="flex min-h-0 flex-1 items-stretch gap-1.5">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <TiempoLinea
            label="Consumido"
            value={formatDuracionMinutos(invertidoMin)}
            dotClass="bg-[var(--td-navy)]"
            compact={compact}
          />
          <TiempoLinea
            label="Restante"
            value={formatDuracionMinutos(restanteMin)}
            dotClass="bg-[var(--td-e-gris)] ring-1 ring-[var(--td-faint)]/35"
            compact={compact}
          />
          {pie.total === 0 ? (
            <p className="text-[9px] text-[var(--td-faint)]">Sin datos</p>
          ) : null}
        </div>
        <div
          className={`flex shrink-0 items-center justify-center self-stretch ${
            compact
              ? "aspect-square w-[2.75rem] max-w-[38%]"
              : "aspect-square w-[4rem] max-w-[44%]"
          }`}
          aria-hidden
        >
          <svg
            viewBox={`0 0 ${PIE_VIEW} ${PIE_VIEW}`}
            className="block h-full w-full"
          >
            {pie.total === 0 ? (
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="var(--td-line-soft)"
                stroke="var(--td-line)"
                strokeWidth="1"
              />
            ) : (
              <>
                {invPath ? <path d={invPath} fill={COLOR_INV} /> : null}
                {restPath ? <path d={restPath} fill={COLOR_REST} /> : null}
              </>
            )}
          </svg>
        </div>
      </div>
    </MiniCard>
  );
}

function TiempoLinea({
  label,
  value,
  dotClass,
  compact,
}: {
  label: string;
  value: string;
  dotClass: string;
  compact: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ring-1 ring-[var(--td-faint)]/35 ${dotClass}`}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-[9px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
        {label}
      </span>
      <span
        className={`shrink-0 font-extrabold tabular-nums leading-none text-[var(--td-ink)] ${
          compact ? "text-xs" : "text-[13px]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
