"use client";

import {
  nivelEntendimientoColor,
  nivelEntendimientoPalabra,
} from "@/lib/nivel-entendimiento-ui";
import { NIVEL_MAX, NIVEL_MIN } from "@/lib/estado-ui";
import { useId } from "react";

type TemaNivelGaugeProps = {
  nivel: number | null;
  delayClass?: string;
  className?: string;
};

const CX = 100;
const CY = 100;
const R = 80;
const NEEDLE_R = 68;
const STROKE = 12;

/** Cinco tramos del 20% en el semicírculo (180°), de rojo a verde. */
const SEGMENT_COLORS = [
  "var(--td-risk-low)",
  "#c96830",
  "var(--td-risk-mid)",
  "#7d9848",
  "var(--td-risk-high)",
] as const;

const SEGMENT_COUNT = SEGMENT_COLORS.length;
const ARC_SPAN = 180;
const SEGMENT_ARC = ARC_SPAN / SEGMENT_COUNT;
/** Pequeño hueco entre tramos para leerlos separados. */
const SEGMENT_GAP = 1.2;

/** Grados SVG: 1 = izquierda (-90°), 10 = derecha (+90°). */
export function agujaRotacionGrados(nivel: number): number {
  const t = (nivel - NIVEL_MIN) / (NIVEL_MAX - NIVEL_MIN);
  return -90 + t * 180;
}

/** u: 0 = extremo izquierdo del arco, 180 = derecho (por arriba). */
function pointOnSemiArc(u: number): { x: number; y: number } {
  const theta = Math.PI + (u / 180) * Math.PI;
  return { x: CX + R * Math.cos(theta), y: CY + R * Math.sin(theta) };
}

function semiArcSegmentPath(uStart: number, uEnd: number): string {
  if (uEnd <= uStart) return "";
  const p0 = pointOnSemiArc(uStart);
  const p1 = pointOnSemiArc(uEnd);
  const large = uEnd - uStart > 90 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${R} ${R} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/** Semicírculo con banda en 5 tramos de color + aguja. */
export function TemaNivelGauge({
  nivel,
  delayClass = "td-d3",
  className = "",
}: TemaNivelGaugeProps) {
  const uid = useId().replace(/:/g, "");
  const palabra = nivelEntendimientoPalabra(nivel);
  const color = nivelEntendimientoColor(nivel);
  const needleTransform =
    nivel != null
      ? `rotate(${agujaRotacionGrados(nivel)}, ${CX}, ${CY})`
      : undefined;

  const segments = SEGMENT_COLORS.map((stroke, i) => {
    const u0 = i * SEGMENT_ARC + SEGMENT_GAP / 2;
    const u1 = (i + 1) * SEGMENT_ARC - SEGMENT_GAP / 2;
    return { stroke, d: semiArcSegmentPath(u0, u1) };
  });

  return (
    <section
      className={`td-card td-rise ${delayClass} flex h-full min-w-0 flex-col items-center px-2 pb-2 pt-2.5 ${className}`}
    >
      <span className="mb-0.5 w-full truncate text-center text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        Entendimiento
      </span>
      <div className="relative w-full">
        <svg viewBox="0 0 200 118" className="block h-auto w-full" aria-hidden>
          <path
            d={semiArcSegmentPath(0, ARC_SPAN)}
            fill="none"
            stroke="var(--td-line)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {segments.map((seg, i) =>
            seg.d ? (
              <path
                key={`${uid}-seg-${i}`}
                d={seg.d}
                fill="none"
                stroke={seg.stroke}
                strokeWidth={STROKE}
                strokeLinecap="butt"
              />
            ) : null,
          )}
          {needleTransform ? (
            <g transform={needleTransform}>
              <line
                x1={CX}
                y1={CY}
                x2={CX}
                y2={CY - NEEDLE_R}
                stroke="var(--td-ink)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <circle
                cx={CX}
                cy={CY}
                r={5}
                fill="var(--td-card)"
                stroke="var(--td-ink)"
                strokeWidth={2.5}
              />
            </g>
          ) : (
            <circle cx={CX} cy={CY} r={4} fill="var(--td-faint)" opacity={0.5} />
          )}
        </svg>
        <div
          className="pointer-events-none absolute inset-x-0 top-[36%] text-center leading-none"
          style={{ color }}
        >
          <span className="text-[26px] font-extrabold tracking-tight">
            {nivel ?? "—"}
          </span>
          {nivel != null ? (
            <span className="text-[10px] font-bold text-[var(--td-faint)]">/10</span>
          ) : null}
        </div>
      </div>
      {palabra ? (
        <p
          className="mt-0.5 truncate text-center text-[10px] font-extrabold"
          style={{ color }}
        >
          {palabra}
        </p>
      ) : null}
    </section>
  );
}
