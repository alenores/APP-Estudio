import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import { projectCanonicalToDisplay } from "@/lib/mapa-lienzo-orientacion";
import { carrilSpanFromIndices } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_MACRO_GRID_PITCH,
  computeMapaLienzoIndices,
  mapaLienzoContentRectFromIndices,
  type MapaLienzoContentRect,
} from "@/lib/mapa-lienzo-fit-bounds";
import {
  MAPA_CARRIL_HEIGHT,
  MAPA_ETAPA_WIDTH,
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
  posicionEnLienzo,
} from "@/lib/mapa-layout";

export type MapaGridBounds = {
  etapas: number[];
  carriles: number[];
  width: number;
  height: number;
};

const EDGE = 12;
const ETAPA_LABEL_BAND = 40;

function rangeInclusive(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i += 1) out.push(i);
  return out;
}

function emptyMapaGridBounds(orientacion: MapaLienzoOrientacion): MapaGridBounds {
  const rect = mapaLienzoContentRectFromIndices(
    { etapaMin: 0, etapaMax: 0, carrilMin: 0, carrilMax: 0 },
    orientacion,
    MAPA_MACRO_GRID_PITCH,
    null,
  );
  return {
    etapas: [0],
    carriles: [0],
    width: rect.x + rect.width,
    height: rect.y + rect.height,
  };
}

function gridSizeFromContentRect(rect: MapaLienzoContentRect): {
  width: number;
  height: number;
} {
  return {
    width: rect.x + rect.width,
    height: rect.y + rect.height,
  };
}

/** Extensión del grid de guías según etapas/c carriles y posiciones en el lienzo. */
export function computeMapaGridBounds(
  items: LienzoPosicionable[],
  orientacion: MapaLienzoOrientacion = "xy",
): MapaGridBounds {
  if (items.length === 0) {
    return emptyMapaGridBounds(orientacion);
  }

  const indices = computeMapaLienzoIndices(items, MAPA_MACRO_GRID_PITCH);
  const carrilSpan = carrilSpanFromIndices(
    rangeInclusive(indices.carrilMin, indices.carrilMax),
  );

  let maxDisplayX = MAPA_ORIGIN_X;
  let maxDisplayY = MAPA_ORIGIN_Y;

  for (const item of items) {
    const display = projectCanonicalToDisplay(posicionEnLienzo(item), {
      orientacion,
      carrilSpan,
    });
    maxDisplayX = Math.max(maxDisplayX, display.x + 240);
    maxDisplayY = Math.max(maxDisplayY, display.y + 88);
  }

  const contentRect = mapaLienzoContentRectFromIndices(
    indices,
    orientacion,
    MAPA_MACRO_GRID_PITCH,
    null,
  );
  const { width: tightW, height: tightH } = gridSizeFromContentRect(contentRect);

  return {
    etapas: rangeInclusive(indices.etapaMin, indices.etapaMax),
    carriles: rangeInclusive(indices.carrilMin, indices.carrilMax),
    width: Math.max(maxDisplayX + EDGE, tightW),
    height: Math.max(maxDisplayY + EDGE + ETAPA_LABEL_BAND, tightH),
  };
}

export { computeMapaMacroContentRect, type MapaLienzoContentRect } from "@/lib/mapa-lienzo-fit-bounds";
