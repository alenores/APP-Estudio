"use client";

import { formatDuracionMinutos } from "@/lib/format-duracion";
import {
  nivelEntendimientoColor,
  nivelEntendimientoPalabra,
  porcionesTiempoPie,
} from "@/lib/nivel-entendimiento-ui";

const PIE_R = 14;
const PIE_CX = 18;
const PIE_CY = 18;

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

export function ExploradorMiniEntendimiento({
  nivel,
}: {
  nivel: number | null;
}) {
  const color = nivelEntendimientoColor(nivel);
  const palabra = nivelEntendimientoPalabra(nivel);

  return (
    <div className="td-card flex min-w-0 flex-col items-center rounded-xl px-2 py-1.5">
      <span className="truncate text-[8px] font-extrabold uppercase tracking-[0.1em] text-[var(--td-faint)]">
        Entendimiento
      </span>
      <div className="flex items-baseline gap-0.5 leading-none">
        <span className="text-xl font-extrabold" style={{ color }}>
          {nivel ?? "—"}
        </span>
        {nivel != null ? (
          <span className="text-[9px] font-bold text-[var(--td-faint)]">/10</span>
        ) : null}
      </div>
      {palabra ? (
        <span
          className="mt-0.5 truncate text-[9px] font-bold"
          style={{ color }}
        >
          {palabra}
        </span>
      ) : null}
    </div>
  );
}

export function ExploradorMiniDedicacion({
  invertidoMin,
  restanteMin,
}: {
  invertidoMin: number;
  restanteMin: number | null;
}) {
  const pie = porcionesTiempoPie(invertidoMin, restanteMin);
  const invDeg = pie.total > 0 ? (pie.invertido / pie.total) * 360 : 0;
  const invPath = invDeg > 0 ? pieSlicePath(PIE_CX, PIE_CY, PIE_R, 0, invDeg) : "";
  const restPath =
    invDeg < 360 && pie.total > 0
      ? pieSlicePath(PIE_CX, PIE_CY, PIE_R, invDeg, 360)
      : "";

  return (
    <div className="td-card flex min-w-0 items-center gap-1.5 rounded-xl px-2 py-1.5">
      <svg
        viewBox="0 0 36 36"
        className="h-9 w-9 shrink-0"
        aria-hidden
      >
        <circle cx={PIE_CX} cy={PIE_CY} r={PIE_R} fill="var(--td-line-soft)" />
        {restPath ? (
          <path d={restPath} fill="var(--td-e-gris)" />
        ) : null}
        {invPath ? <path d={invPath} fill="var(--td-navy)" /> : null}
      </svg>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.08em] text-[var(--td-faint)]">
          Dedicación
        </p>
        <p className="truncate text-[10px] font-semibold text-[var(--td-ink-soft)]">
          {formatDuracionMinutos(invertidoMin)}
        </p>
        <p className="truncate text-[9px] text-[var(--td-faint)]">
          Rest. {formatDuracionMinutos(restanteMin ?? 0)}
        </p>
      </div>
    </div>
  );
}
