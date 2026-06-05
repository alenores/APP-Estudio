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

const PIE_FULL = 46;
const PIE_COMPACT = 40;

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
  const pieSize = compact ? PIE_COMPACT : PIE_FULL;
  const cx = pieSize / 2;
  const cy = pieSize / 2;
  const r = compact ? 17 : 20;

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
      className={`${compact ? "min-h-[7.5rem]" : ""} ${className}`}
    >
      <div
        className={`flex min-w-0 items-center ${
          compact ? "h-full gap-2.5 py-0.5" : "gap-1.5"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <TiempoLinea
            label="Consum:"
            value={formatDuracionMinutos(invertidoMin)}
            dotClass="bg-[var(--td-navy)]"
            compact={compact}
          />
          <TiempoLinea
            label="Restante:"
            value={formatDuracionMinutos(restanteMin)}
            dotClass="bg-[var(--td-e-gris)] ring-1 ring-[var(--td-faint)]/35"
            compact={compact}
          />
          {pie.total === 0 ? (
            <p className="text-[9px] text-[var(--td-faint)]">Sin datos</p>
          ) : null}
        </div>
        <div className="shrink-0 self-center" aria-hidden>
          <svg width={pieSize} height={pieSize} viewBox={`0 0 ${pieSize} ${pieSize}`}>
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

const TD_TIEMPO_DOT =
  "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-[var(--td-faint)]/35";

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
    <div className="flex min-w-0 items-start gap-1.5">
      <span className={`${TD_TIEMPO_DOT} ${dotClass}`} aria-hidden />
      <div className="min-w-0 leading-tight">
        <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
          {label}
        </p>
        <p
          className={`font-extrabold text-[var(--td-ink)] ${
            compact ? "text-[13px]" : "text-[12px]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
