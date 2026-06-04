"use client";

import type { CSSProperties } from "react";
import {
  nivelEntendimientoColor,
  nivelEntendimientoPalabra,
} from "@/lib/nivel-entendimiento-ui";
import { NIVEL_MAX, NIVEL_MIN } from "@/lib/estado-ui";

type TemaNivelGaugeProps = {
  nivel: number | null;
  delayClass?: string;
};

const CX = 100;
const CY = 100;
const NEEDLE_R = 68;

function agujaRotacionGrados(nivel: number): number {
  const t = (nivel - NIVEL_MIN) / (NIVEL_MAX - NIVEL_MIN);
  return -90 + t * 180;
}

/** Semicírculo tipo cartel de riesgo: rojo→ámbar→verde + aguja. */
export function TemaNivelGauge({ nivel, delayClass = "td-d3" }: TemaNivelGaugeProps) {
  const palabra = nivelEntendimientoPalabra(nivel);
  const color = nivelEntendimientoColor(nivel);
  const needleRotate =
    nivel != null ? `${agujaRotacionGrados(nivel)}deg` : "-90deg";

  return (
    <section
      className={`td-card td-rise ${delayClass} flex flex-col items-center px-3 pb-3 pt-3`}
    >
      <span className="mb-1 self-start text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-faint)]">
        Nivel de entendimiento
      </span>
      <div className="relative w-full max-w-[168px]">
        <svg viewBox="0 0 200 118" className="block h-auto w-full" aria-hidden>
          <defs>
            <linearGradient
              id="td-risk-band"
              x1="20"
              y1="100"
              x2="180"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="var(--td-risk-low)" />
              <stop offset="50%" stopColor="var(--td-risk-mid)" />
              <stop offset="100%" stopColor="var(--td-risk-high)" />
            </linearGradient>
          </defs>
          <path
            d="M20,100 A80,80 0 0 1 180,100"
            fill="none"
            stroke="var(--td-line)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          <path
            d="M20,100 A80,80 0 0 1 180,100"
            fill="none"
            stroke="url(#td-risk-band)"
            strokeWidth={12}
            strokeLinecap="round"
            opacity={0.95}
          />
          {nivel != null ? (
            <g
              className="td-needle-group"
              style={
                {
                  "--td-needle-to": needleRotate,
                  transformOrigin: `${CX}px ${CY}px`,
                } as CSSProperties
              }
            >
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
          className="pointer-events-none absolute inset-x-0 top-[38%] text-center"
          style={{ color }}
        >
          <span className="text-[34px] font-extrabold leading-none tracking-tight">
            {nivel ?? "—"}
          </span>
          {nivel != null ? (
            <span className="text-xs font-bold text-[var(--td-faint)]">/10</span>
          ) : null}
        </div>
      </div>
      {palabra ? (
        <p
          className="mt-0.5 text-center text-[12px] font-extrabold"
          style={{ color }}
        >
          {palabra}
        </p>
      ) : null}
    </section>
  );
}
