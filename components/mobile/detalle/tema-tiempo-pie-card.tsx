"use client";

import { MiniCard } from "@/components/ui/mini-card";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import { porcionesTiempoPie } from "@/lib/nivel-entendimiento-ui";

type TemaTiempoPieCardProps = {
  invertidoMin: number;
  restanteMin: number | null;
  delayClass?: string;
  className?: string;
};

const PIE = 46;
const CX = PIE / 2;
const CY = PIE / 2;
const R = 20;

const COLOR_INV = "var(--td-navy)";
const COLOR_REST = "var(--td-e-gris)";

function polar(cx: number, cy: number, r: number, degFromTop: number) {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Porción de torta (pizza) desde degFromTop inicio hasta fin (sentido horario). */
function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  if (endDeg - startDeg >= 360) {
    endDeg = startDeg + 359.999;
  }
  if (endDeg <= startDeg) return "";
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

export function TemaTiempoPieCard({
  invertidoMin,
  restanteMin,
  delayClass = "td-d4",
  className = "",
}: TemaTiempoPieCardProps) {
  const pie = porcionesTiempoPie(invertidoMin, restanteMin);
  const invDeg = pie.total > 0 ? (pie.invertido / pie.total) * 360 : 0;
  const invPath =
    invDeg > 0 ? pieSlicePath(CX, CY, R, 0, invDeg) : "";
  const restPath =
    invDeg < 360 && pie.total > 0
      ? pieSlicePath(CX, CY, R, invDeg, 360)
      : "";

  return (
    <MiniCard
      title="DEDICACIÓN"
      delayClass={delayClass}
      className={className}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <TiempoLinea
            label="Consum:"
            value={formatDuracionMinutos(invertidoMin)}
            dotClass="bg-[var(--td-navy)]"
          />
          <TiempoLinea
            label="Restante:"
            value={formatDuracionMinutos(restanteMin)}
            dotClass="bg-[var(--td-e-gris)] ring-1 ring-[var(--td-faint)]/35"
          />
          {pie.total === 0 ? (
            <p className="text-[9px] text-[var(--td-faint)]">Sin datos</p>
          ) : null}
        </div>
        <div className="shrink-0" aria-hidden>
          <svg width={PIE} height={PIE} viewBox={`0 0 ${PIE} ${PIE}`}>
            {pie.total === 0 ? (
              <circle
                cx={CX}
                cy={CY}
                r={R}
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
}: {
  label: string;
  value: string;
  dotClass: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className={`${TD_TIEMPO_DOT} ${dotClass}`} aria-hidden />
      <div className="min-w-0 truncate leading-tight">
        <span className="text-[9px] font-bold uppercase text-[var(--td-faint)]">
          {label}
        </span>
        <span className="ml-1 text-[12px] font-extrabold text-[var(--td-ink)]">
          {value}
        </span>
      </div>
    </div>
  );
}
