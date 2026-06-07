"use client";

import type { LienzoHijoPosicion } from "@/lib/mapa-detalle-types";
import {
  MAPA_DETALLE_COL_WIDTH,
  MAPA_DETALLE_ROW_HEIGHT,
  computeMapaDetalleGridBounds,
} from "@/lib/mapa-detalle-layout";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_DETALLE_LIENZO_ORIGIN,
  carrilSpanFromIndices,
  mapaCarrilGuideY,
} from "@/lib/mapa-lienzo-orientacion";
import { ViewportPortal } from "@xyflow/react";
import { useMemo } from "react";

type MapaDetalleTimelineGuidesProps = {
  posiciones: LienzoHijoPosicion[];
  itemCount: number;
  orientacion?: MapaLienzoOrientacion;
};

/** Guías etapa/carril en lienzo detalle (capa 1). */
export function MapaDetalleTimelineGuides({
  posiciones,
  itemCount,
  orientacion = "xy",
}: MapaDetalleTimelineGuidesProps) {
  const bounds = useMemo(
    () => computeMapaDetalleGridBounds(posiciones, itemCount, orientacion),
    [posiciones, itemCount, orientacion],
  );

  const isYx = orientacion === "yx";
  const { x: originX, y: originY } = MAPA_DETALLE_LIENZO_ORIGIN;
  const carrilSpan = useMemo(
    () => carrilSpanFromIndices(bounds.carriles),
    [bounds.carriles],
  );

  return (
    <ViewportPortal>
      <svg
        className="mapa-timeline-guides mapa-detalle-timeline-guides"
        width={bounds.width}
        height={bounds.height}
        aria-hidden
      >
        {bounds.etapas.map((etapa) => {
          if (!isYx) {
            const x = originX + etapa * MAPA_DETALLE_COL_WIDTH;
            return (
              <g key={`etapa-${etapa}`}>
                <rect
                  x={x}
                  y={0}
                  width={MAPA_DETALLE_COL_WIDTH}
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

          const y = originY + etapa * MAPA_DETALLE_COL_WIDTH;
          return (
            <g key={`etapa-${etapa}`}>
              <rect
                x={0}
                y={y}
                width={bounds.width}
                height={MAPA_DETALLE_COL_WIDTH}
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
              originX + (bounds.etapas.at(-1)! + 1) * MAPA_DETALLE_COL_WIDTH
            }
            y1={0}
            x2={
              originX + (bounds.etapas.at(-1)! + 1) * MAPA_DETALLE_COL_WIDTH
            }
            y2={bounds.height}
            className="mapa-guide-vline"
          />
        ) : (
          <line
            x1={0}
            y1={
              originY + (bounds.etapas.at(-1)! + 1) * MAPA_DETALLE_COL_WIDTH
            }
            x2={bounds.width}
            y2={
              originY + (bounds.etapas.at(-1)! + 1) * MAPA_DETALLE_COL_WIDTH
            }
            className="mapa-guide-hline"
          />
        )}
        {bounds.carriles.map((carril) => {
          if (!isYx) {
            const y = mapaCarrilGuideY(
              carril,
              carrilSpan,
              originY,
              MAPA_DETALLE_ROW_HEIGHT,
            );
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

          const x = originX + carril * MAPA_DETALLE_ROW_HEIGHT;
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
