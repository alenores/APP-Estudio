"use client";

import {
  nivelEntendimientoColor,
  nivelEntendimientoPalabra,
} from "@/lib/nivel-entendimiento-ui";
import { NIVEL_MAX, NIVEL_MIN } from "@/lib/estado-ui";
import { useId } from "react";

export type EstudioNivelGaugeProps = {
  nivel: number | null;
  /** `compact` = card expandida explorador PC; `full` = detalle móvil. */
  size?: "compact" | "full";
  delayClass?: string;
  className?: string;
};

const CX = 100;
const CY = 100;
const R = 80;
const NEEDLE_R = 68;

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
const SEGMENT_GAP = 1.2;

export function agujaRotacionGrados(nivel: number): number {
  const t = (nivel - NIVEL_MIN) / (NIVEL_MAX - NIVEL_MIN);
  return -90 + t * 180;
}

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

export function EstudioNivelGauge({
  nivel,
  size = "full",
  delayClass = "",
  className = "",
}: EstudioNivelGaugeProps) {
  const uid = useId().replace(/:/g, "");
  const palabra = nivelEntendimientoPalabra(nivel);
  const color = nivelEntendimientoColor(nivel);
  const compact = size === "compact";
  const stroke = compact ? 9 : 12;
  const needleTransform =
    nivel != null
      ? `rotate(${agujaRotacionGrados(nivel)}, ${CX}, ${CY})`
      : undefined;

  const segments = SEGMENT_COLORS.map((strokeColor, i) => {
    const u0 = i * SEGMENT_ARC + SEGMENT_GAP / 2;
    const u1 = (i + 1) * SEGMENT_ARC - SEGMENT_GAP / 2;
    return { stroke: strokeColor, d: semiArcSegmentPath(u0, u1) };
  });

  return (
    <section
      className={`td-card flex min-w-0 flex-col items-center justify-between ${
        compact ? "min-h-[7.5rem] px-2.5 py-2" : "h-full px-2 pb-2 pt-2.5"
      } ${delayClass ? `td-rise ${delayClass}` : ""} ${className}`}
    >
      <span
        className={`w-full truncate text-center font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)] ${
          compact ? "text-[9px]" : "mb-0.5 text-[9px]"
        }`}
      >
        Entendimiento
      </span>
      <div className={`relative w-full ${compact ? "flex-1" : ""}`}>
        <svg
          viewBox="0 0 200 118"
          className={`block w-full ${compact ? "max-h-[4.25rem]" : "h-auto"}`}
          aria-hidden
        >
          <path
            d={semiArcSegmentPath(0, ARC_SPAN)}
            fill="none"
            stroke="var(--td-line)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {segments.map((seg, i) =>
            seg.d ? (
              <path
                key={`${uid}-seg-${i}`}
                d={seg.d}
                fill="none"
                stroke={seg.stroke}
                strokeWidth={stroke}
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
                strokeWidth={compact ? 2 : 2.5}
                strokeLinecap="round"
              />
              <circle
                cx={CX}
                cy={CY}
                r={compact ? 4 : 5}
                fill="var(--td-card)"
                stroke="var(--td-ink)"
                strokeWidth={compact ? 2 : 2.5}
              />
            </g>
          ) : (
            <circle cx={CX} cy={CY} r={4} fill="var(--td-faint)" opacity={0.5} />
          )}
        </svg>
        <div
          className={`pointer-events-none absolute inset-x-0 text-center leading-none ${
            compact ? "top-[28%]" : "top-[36%]"
          }`}
          style={{ color }}
        >
          <span
            className={`font-extrabold tracking-tight ${
              compact ? "text-[22px]" : "text-[26px]"
            }`}
          >
            {nivel ?? "—"}
          </span>
          {nivel != null ? (
            <span className="text-[10px] font-bold text-[var(--td-faint)]">/10</span>
          ) : null}
        </div>
      </div>
      {palabra ? (
        <p
          className={`truncate text-center font-extrabold ${
            compact ? "mt-1 text-[10px]" : "mt-0.5 text-[10px]"
          }`}
          style={{ color }}
        >
          {palabra}
        </p>
      ) : (
        <span className="mt-1 block h-[14px]" aria-hidden />
      )}
    </section>
  );
}
