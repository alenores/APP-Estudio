/** Rectángulo de contenido del lienzo para fitBounds (solo presentación). */

import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import type { MapaCarrilSpan, MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_LIENZO_ORIGIN,
  carrilSpanFromIndices,
  mapaCarrilGuideY,
  projectCanonicalToDisplay,
} from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_CARRIL_HEIGHT,
  MAPA_ETAPA_WIDTH,
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
  posicionEnLienzo,
} from "@/lib/mapa-layout";

export type MapaLienzoContentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const NODE_W = 240;
const NODE_H = 88;
const EDGE = 12;
const ETAPA_LABEL_BAND = 40;
const CARRIL_LABEL_GUTTER = 4;

export type MapaLienzoGridPitch = {
  originX: number;
  originY: number;
  etapaPitch: number;
  carrilPitch: number;
};

export const MAPA_MACRO_GRID_PITCH: MapaLienzoGridPitch = {
  originX: MAPA_ORIGIN_X,
  originY: MAPA_ORIGIN_Y,
  etapaPitch: MAPA_ETAPA_WIDTH,
  carrilPitch: MAPA_CARRIL_HEIGHT,
};

type Indices = {
  etapaMin: number;
  etapaMax: number;
  carrilMin: number;
  carrilMax: number;
};

function rangeInclusive(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i += 1) out.push(i);
  return out;
}

/** Índices etapa/carril usados en el lienzo (sin padding extra). */
export function computeMapaLienzoIndices(
  items: LienzoPosicionable[],
  pitch: MapaLienzoGridPitch,
): Indices {
  if (items.length === 0) {
    return { etapaMin: 0, etapaMax: 0, carrilMin: 0, carrilMax: 0 };
  }

  let minEtapa = Infinity;
  let maxEtapa = -Infinity;
  let minCarril = Infinity;
  let maxCarril = -Infinity;

  for (const item of items) {
    const etapa = Number(item.etapa);
    const carril = Number(item.carril);
    minEtapa = Math.min(minEtapa, etapa);
    maxEtapa = Math.max(maxEtapa, etapa);
    minCarril = Math.min(minCarril, carril);
    maxCarril = Math.max(maxCarril, carril);

    const canonical = posicionEnLienzo(item);
    const etapaDesdeX = Math.floor(
      (canonical.x - pitch.originX + pitch.etapaPitch / 2) / pitch.etapaPitch,
    );
    const carrilDesdeY = Math.floor(
      (canonical.y - pitch.originY + pitch.carrilPitch / 2) / pitch.carrilPitch,
    );
    minEtapa = Math.min(minEtapa, etapaDesdeX);
    maxEtapa = Math.max(maxEtapa, etapaDesdeX);
    minCarril = Math.min(minCarril, carrilDesdeY);
    maxCarril = Math.max(maxCarril, carrilDesdeY);
  }

  return {
    etapaMin: Math.max(0, minEtapa),
    etapaMax: Math.max(0, maxEtapa),
    carrilMin: Math.max(0, minCarril),
    carrilMax: Math.max(0, maxCarril),
  };
}

function nodeDisplayExtents(
  items: LienzoPosicionable[],
  orientacion: MapaLienzoOrientacion,
  carrilSpan: MapaCarrilSpan,
  origin = MAPA_LIENZO_ORIGIN,
) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const item of items) {
    const display = projectCanonicalToDisplay(posicionEnLienzo(item), {
      orientacion,
      origin,
      carrilSpan,
      carrilPitch: MAPA_CARRIL_HEIGHT,
    });
    minX = Math.min(minX, display.x);
    minY = Math.min(minY, display.y);
    maxX = Math.max(maxX, display.x + NODE_W);
    maxY = Math.max(maxY, display.y + NODE_H);
  }

  if (!Number.isFinite(minX)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

/** Rectángulo útil para encuadrar el viewport (grid + nodos). */
export function mapaLienzoContentRectFromIndices(
  indices: Indices,
  orientacion: MapaLienzoOrientacion,
  pitch: MapaLienzoGridPitch,
  nodeExtents?: { minX: number; minY: number; maxX: number; maxY: number } | null,
): MapaLienzoContentRect {
  const carrilSpan = carrilSpanFromIndices(
    rangeInclusive(indices.carrilMin, indices.carrilMax),
  );
  const { originX, originY, etapaPitch, carrilPitch } = pitch;

  if (orientacion === "xy") {
    const gridX0 = originX + indices.etapaMin * etapaPitch;
    const gridX1 = originX + (indices.etapaMax + 1) * etapaPitch;
    const gridYTop = mapaCarrilGuideY(
      indices.carrilMax,
      carrilSpan,
      originY,
      carrilPitch,
    );
    const gridYBottom =
      mapaCarrilGuideY(indices.carrilMin, carrilSpan, originY, carrilPitch) +
      carrilPitch +
      ETAPA_LABEL_BAND;

    let x0 = gridX0 - CARRIL_LABEL_GUTTER;
    let y0 = gridYTop - EDGE;
    let x1 = gridX1 + EDGE;
    let y1 = gridYBottom + EDGE;

    if (nodeExtents) {
      x0 = Math.min(x0, nodeExtents.minX - EDGE);
      y0 = Math.min(y0, nodeExtents.minY - EDGE);
      x1 = Math.max(x1, nodeExtents.maxX + EDGE);
      y1 = Math.max(y1, nodeExtents.maxY + EDGE);
    }

    return {
      x: x0,
      y: y0,
      width: Math.max(etapaPitch, x1 - x0),
      height: Math.max(carrilPitch, y1 - y0),
    };
  }

  const gridX0 = originX + indices.carrilMin * carrilPitch;
  const gridX1 = originX + (indices.carrilMax + 1) * carrilPitch;
  const gridY0 = originY + indices.etapaMin * etapaPitch;
  const gridY1 = originY + (indices.etapaMax + 1) * etapaPitch + ETAPA_LABEL_BAND;

  let x0 = gridX0 - CARRIL_LABEL_GUTTER;
  let y0 = gridY0 - EDGE;
  let x1 = gridX1 + EDGE;
  let y1 = gridY1 + EDGE;

  if (nodeExtents) {
    x0 = Math.min(x0, nodeExtents.minX - EDGE);
    y0 = Math.min(y0, nodeExtents.minY - EDGE);
    x1 = Math.max(x1, nodeExtents.maxX + EDGE);
    y1 = Math.max(y1, nodeExtents.maxY + EDGE);
  }

  return {
    x: x0,
    y: y0,
    width: Math.max(carrilPitch, x1 - x0),
    height: Math.max(etapaPitch, y1 - y0),
  };
}

export function computeMapaMacroContentRect(
  items: LienzoPosicionable[],
  orientacion: MapaLienzoOrientacion = "xy",
): MapaLienzoContentRect {
  const indices = computeMapaLienzoIndices(items, MAPA_MACRO_GRID_PITCH);
  const carrilSpan = carrilSpanFromIndices(
    rangeInclusive(indices.carrilMin, indices.carrilMax),
  );
  const nodeExtents = nodeDisplayExtents(items, orientacion, carrilSpan);
  return mapaLienzoContentRectFromIndices(
    indices,
    orientacion,
    MAPA_MACRO_GRID_PITCH,
    nodeExtents,
  );
}

/** Índices desde posiciones canónicas (lienzo detalle sin etapa/carril en BD). */
export function computeLienzoIndicesFromPositions(
  positions: { x: number; y: number }[],
  pitch: MapaLienzoGridPitch,
): Indices {
  if (positions.length === 0) {
    return { etapaMin: 0, etapaMax: 0, carrilMin: 0, carrilMax: 0 };
  }

  let minEtapa = Infinity;
  let maxEtapa = -Infinity;
  let minCarril = Infinity;
  let maxCarril = -Infinity;
  const { originX, originY, etapaPitch, carrilPitch } = pitch;

  for (const { x, y } of positions) {
    const etapaDesdeX = Math.floor(
      (x - originX + etapaPitch / 2) / etapaPitch,
    );
    const carrilDesdeY = Math.floor(
      (y - originY + carrilPitch / 2) / carrilPitch,
    );
    minEtapa = Math.min(minEtapa, etapaDesdeX);
    maxEtapa = Math.max(maxEtapa, etapaDesdeX);
    minCarril = Math.min(minCarril, carrilDesdeY);
    maxCarril = Math.max(maxCarril, carrilDesdeY);
  }

  return {
    etapaMin: Math.max(0, minEtapa),
    etapaMax: Math.max(0, maxEtapa),
    carrilMin: Math.max(0, minCarril),
    carrilMax: Math.max(0, maxCarril),
  };
}

function nodeDisplayExtentsFromPositions(
  positions: { x: number; y: number }[],
  orientacion: MapaLienzoOrientacion,
  carrilSpan: MapaCarrilSpan,
  pitch: MapaLienzoGridPitch,
  origin: { x: number; y: number },
) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pos of positions) {
    const display = projectCanonicalToDisplay(pos, {
      orientacion,
      origin,
      carrilSpan,
      carrilPitch: pitch.carrilPitch,
    });
    minX = Math.min(minX, display.x);
    minY = Math.min(minY, display.y);
    maxX = Math.max(maxX, display.x + NODE_W);
    maxY = Math.max(maxY, display.y + NODE_H);
  }

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

export function computeMapaDetalleContentRect(
  positions: { x: number; y: number }[],
  orientacion: MapaLienzoOrientacion,
  pitch: MapaLienzoGridPitch,
  origin: { x: number; y: number },
): MapaLienzoContentRect {
  const indices = computeLienzoIndicesFromPositions(positions, pitch);
  const carrilSpan = carrilSpanFromIndices(
    rangeInclusive(indices.carrilMin, indices.carrilMax),
  );
  const nodeExtents = nodeDisplayExtentsFromPositions(
    positions,
    orientacion,
    carrilSpan,
    pitch,
    origin,
  );
  return mapaLienzoContentRectFromIndices(
    indices,
    orientacion,
    pitch,
    nodeExtents,
  );
}
