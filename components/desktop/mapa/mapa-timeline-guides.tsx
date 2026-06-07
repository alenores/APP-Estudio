"use client";

import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import { computeMapaGridBounds } from "@/lib/mapa-grid-bounds";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_CARRIL_HEIGHT,
  MAPA_ETAPA_WIDTH,
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
} from "@/lib/mapa-layout";
import { ViewportPortal } from "@xyflow/react";
import { useMemo } from "react";

type MapaTimelineGuidesProps = {
  items: LienzoPosicionable[];
  orientacion?: MapaLienzoOrientacion;
};

/** Columnas de etapa + carriles (ADR 009); transpone guías en orientación Y/X. */
export function MapaTimelineGuides({
  items,
  orientacion = "xy",
}: MapaTimelineGuidesProps) {
  const bounds = useMemo(
    () => computeMapaGridBounds(items, orientacion),
    [items, orientacion],
  );

  const isYx = orientacion === "yx";

  return (
    <ViewportPortal>
      <svg
        className="mapa-timeline-guides"
        width={bounds.width}
        height={bounds.height}
        aria-hidden
      >
        {bounds.etapas.map((etapa) => {
          if (!isYx) {
            const x = MAPA_ORIGIN_X + etapa * MAPA_ETAPA_WIDTH;
            return (
              <g key={`etapa-${etapa}`}>
                <rect
                  x={x}
                  y={0}
                  width={MAPA_ETAPA_WIDTH}
                  height={bounds.height}
                  className={
                    etapa % 2 === 0
                      ? "mapa-guide-col-even"
                      : "mapa-guide-col-odd"
                  }
                />
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={bounds.height}
                  className="mapa-guide-vline"
                />
                <text
                  x={x + 10}
                  y={bounds.height - 14}
                  className="mapa-guide-etapa-label mapa-guide-etapa-label--bottom"
                >
                  Etapa {etapa}
                </text>
              </g>
            );
          }

          const y = MAPA_ORIGIN_Y + etapa * MAPA_ETAPA_WIDTH;
          return (
            <g key={`etapa-${etapa}`}>
              <rect
                x={0}
                y={y}
                width={bounds.width}
                height={MAPA_ETAPA_WIDTH}
                className={
                  etapa % 2 === 0
                    ? "mapa-guide-col-even"
                    : "mapa-guide-col-odd"
                }
              />
              <line
                x1={0}
                y1={y}
                x2={bounds.width}
                y2={y}
                className="mapa-guide-hline"
              />
              <text x={10} y={y + 32} className="mapa-guide-etapa-label">
                Etapa {etapa}
              </text>
            </g>
          );
        })}
        {!isYx ? (
          <line
            x1={
              MAPA_ORIGIN_X + (bounds.etapas.at(-1)! + 1) * MAPA_ETAPA_WIDTH
            }
            y1={0}
            x2={
              MAPA_ORIGIN_X + (bounds.etapas.at(-1)! + 1) * MAPA_ETAPA_WIDTH
            }
            y2={bounds.height}
            className="mapa-guide-vline"
          />
        ) : (
          <line
            x1={0}
            y1={
              MAPA_ORIGIN_Y + (bounds.etapas.at(-1)! + 1) * MAPA_ETAPA_WIDTH
            }
            x2={bounds.width}
            y2={
              MAPA_ORIGIN_Y + (bounds.etapas.at(-1)! + 1) * MAPA_ETAPA_WIDTH
            }
            className="mapa-guide-hline"
          />
        )}
        {bounds.carriles.map((carril) => {
          if (!isYx) {
            const y = MAPA_ORIGIN_Y + carril * MAPA_CARRIL_HEIGHT;
            return (
              <g key={`carril-${carril}`}>
                <line
                  x1={0}
                  y1={y}
                  x2={bounds.width}
                  y2={y}
                  className="mapa-guide-hline"
                />
                <text x={6} y={y - 12} className="mapa-guide-carril-label">
                  Carril {carril}
                </text>
              </g>
            );
          }

          const x = MAPA_ORIGIN_X + carril * MAPA_CARRIL_HEIGHT;
          return (
            <g key={`carril-${carril}`}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={bounds.height}
                className="mapa-guide-vline"
              />
              <text x={x + 10} y={32} className="mapa-guide-carril-label">
                Carril {carril}
              </text>
            </g>
          );
        })}
      </svg>
    </ViewportPortal>
  );
}
