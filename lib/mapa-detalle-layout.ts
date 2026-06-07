import type {
  LienzoHijoPosicion,
  MapaDetalleHijoKind,
} from "@/lib/mapa-detalle-types";
import type { MapaCarrilSpan, MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_DETALLE_LIENZO_ORIGIN,
  carrilSpanFromIndices,
  projectCanonicalToDisplay,
  projectDisplayToCanonical,
} from "@/lib/mapa-lienzo-orientacion";
import {
  computeLienzoIndicesFromPositions,
  computeMapaDetalleContentRect,
  mapaLienzoContentRectFromIndices,
  type MapaLienzoGridPitch,
} from "@/lib/mapa-lienzo-fit-bounds";

/** Posición en grilla / persistida para hijos del lienzo detalle. */

export const MAPA_DETALLE_COL_WIDTH = 268;
/** Alto de fila carril (canónico Y). Igual al ancho de etapa para cards de 240px en Y/X. */
export const MAPA_DETALLE_ROW_HEIGHT = 268;
/** Pitch carril anterior — solo normalización de posiciones ya guardadas. */
const MAPA_DETALLE_ROW_HEIGHT_LEGACY = 108;
const COLS = 3;

/** Slot de layout (no CSS): cards siguen max-w-[240px] en el componente. */
export const MAPA_DETALLE_NODE_W = 240;
export const MAPA_DETALLE_NODE_SLOT_H = 120;

const EDGE = 12;
const ETAPA_LABEL_BAND = 40;

export const MAPA_DETALLE_GRID_PITCH: MapaLienzoGridPitch = {
  originX: MAPA_DETALLE_LIENZO_ORIGIN.x,
  originY: MAPA_DETALLE_LIENZO_ORIGIN.y,
  etapaPitch: MAPA_DETALLE_COL_WIDTH,
  carrilPitch: MAPA_DETALLE_ROW_HEIGHT,
};

function mapaDetalleCellInsetCanonical(): { etapa: number; carril: number } {
  return {
    etapa: (MAPA_DETALLE_COL_WIDTH - MAPA_DETALLE_NODE_W) / 2,
    carril: (MAPA_DETALLE_ROW_HEIGHT - MAPA_DETALLE_NODE_SLOT_H) / 2,
  };
}

/** Inset en pantalla para centrar la card dentro de la celda etapa×carril. */
export function mapaDetalleDisplayInset(
  orientacion: MapaLienzoOrientacion,
): { dx: number; dy: number } {
  const { etapa, carril } = mapaDetalleCellInsetCanonical();
  return orientacion === "xy"
    ? { dx: etapa, dy: carril }
    : { dx: carril, dy: etapa };
}

/** Re-mapea Y guardadas con pitch 108 al pitch actual (sin escribir BD). */
export function mapaDetalleNormalizeCanonicalY(y: number): number {
  const legacyCarril = Math.round(y / MAPA_DETALLE_ROW_HEIGHT_LEGACY);
  const onLegacyGrid =
    Math.abs(y - legacyCarril * MAPA_DETALLE_ROW_HEIGHT_LEGACY) <= 1;
  if (!onLegacyGrid) return y;
  const onCurrentGrid =
    Math.abs(y - legacyCarril * MAPA_DETALLE_ROW_HEIGHT) <= 1;
  if (onCurrentGrid) return y;
  return legacyCarril * MAPA_DETALLE_ROW_HEIGHT;
}

export function mapaDetalleNormalizeCanonical(pos: {
  x: number;
  y: number;
}): { x: number; y: number } {
  return { x: pos.x, y: mapaDetalleNormalizeCanonicalY(pos.y) };
}

export type MapaDetalleGridBounds = {
  etapas: number[];
  carriles: number[];
  width: number;
  height: number;
};

function rangeInclusive(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i += 1) out.push(i);
  return out;
}

export function mapaDetalleGridPosition(index: number): { x: number; y: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return {
    x: col * MAPA_DETALLE_COL_WIDTH,
    y: row * MAPA_DETALLE_ROW_HEIGHT,
  };
}

/** Posición sugerida en detalle desde etapa (columna) y carril (fila) — canónico X/Y. */
export function mapaDetallePosicionDesdeEtapaCarril(
  etapa: number,
  carril: number,
): { x: number; y: number } {
  return {
    x: etapa * MAPA_DETALLE_COL_WIDTH,
    y: carril * MAPA_DETALLE_ROW_HEIGHT,
  };
}

export function mapaDetalleFlowNodeId(
  kind: "curso" | "logro",
  id: number,
): string {
  return `${kind}:${id}`;
}

export function parseMapaDetalleFlowNodeId(nodeId: string): {
  kind: "curso" | "logro";
  id: number;
} | null {
  const m = /^(curso|logro):(\d+)$/.exec(nodeId);
  if (!m) return null;
  return { kind: m[1] as "curso" | "logro", id: Number(m[2]) };
}

export function buildMapaDetallePosicionesMap(
  posiciones: LienzoHijoPosicion[],
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const p of posiciones) {
    map.set(mapaDetalleFlowNodeId(p.hijo_kind, p.hijo_id), {
      x: p.pos_x,
      y: p.pos_y,
    });
  }
  return map;
}

export function resolveMapaDetallePosition(
  kind: MapaDetalleHijoKind,
  id: number,
  index: number,
  posicionesByNodeId: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const saved = posicionesByNodeId.get(mapaDetalleFlowNodeId(kind, id));
  return saved ?? mapaDetalleGridPosition(index);
}

export function mapaDetallePositionDisplay(
  canonical: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  carrilSpan?: MapaCarrilSpan,
): { x: number; y: number } {
  const normalized = mapaDetalleNormalizeCanonical(canonical);
  const projected = projectCanonicalToDisplay(normalized, {
    orientacion,
    origin: MAPA_DETALLE_LIENZO_ORIGIN,
    carrilSpan,
    carrilPitch: MAPA_DETALLE_ROW_HEIGHT,
  });
  const { dx, dy } = mapaDetalleDisplayInset(orientacion);
  return { x: projected.x + dx, y: projected.y + dy };
}

/** Pantalla → canónico (resta inset usado solo en presentación). */
export function mapaDetalleDisplayToCanonical(
  display: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  carrilSpan?: MapaCarrilSpan,
): { x: number; y: number } {
  const { dx, dy } = mapaDetalleDisplayInset(orientacion);
  return projectDisplayToCanonical(
    { x: display.x - dx, y: display.y - dy },
    {
      orientacion,
      origin: MAPA_DETALLE_LIENZO_ORIGIN,
      carrilSpan,
      carrilPitch: MAPA_DETALLE_ROW_HEIGHT,
    },
  );
}

export function collectMapaDetalleCanonicalPositions(
  posiciones: LienzoHijoPosicion[],
  itemCount: number,
): { x: number; y: number }[] {
  const canonicalPositions: { x: number; y: number }[] = posiciones.map((p) => ({
    x: p.pos_x,
    y: p.pos_y,
  }));
  for (let i = canonicalPositions.length; i < itemCount; i += 1) {
    canonicalPositions.push(mapaDetalleGridPosition(i));
  }
  return canonicalPositions;
}

export function computeMapaDetalleLienzoContentRect(
  posiciones: LienzoHijoPosicion[],
  itemCount: number,
  orientacion: MapaLienzoOrientacion = "xy",
) {
  const positions = collectMapaDetalleCanonicalPositions(posiciones, itemCount);
  return computeMapaDetalleContentRect(
    positions,
    orientacion,
    MAPA_DETALLE_GRID_PITCH,
    MAPA_DETALLE_LIENZO_ORIGIN,
  );
}

/** Guías del detalle inferidas desde posiciones canónicas guardadas. */
export function computeMapaDetalleGridBounds(
  posiciones: LienzoHijoPosicion[],
  itemCount: number,
  orientacion: MapaLienzoOrientacion = "xy",
): MapaDetalleGridBounds {
  const origin = MAPA_DETALLE_LIENZO_ORIGIN;
  const positions = collectMapaDetalleCanonicalPositions(posiciones, itemCount);

  if (positions.length === 0) {
    const rect = mapaLienzoContentRectFromIndices(
      { etapaMin: 0, etapaMax: 0, carrilMin: 0, carrilMax: 0 },
      orientacion,
      MAPA_DETALLE_GRID_PITCH,
      null,
    );
    return {
      etapas: [0],
      carriles: [0],
      width: rect.x + rect.width,
      height: rect.y + rect.height,
    };
  }

  const indices = computeLienzoIndicesFromPositions(
    positions,
    MAPA_DETALLE_GRID_PITCH,
  );
  const carrilSpan = carrilSpanFromIndices(
    rangeInclusive(indices.carrilMin, indices.carrilMax),
  );

  let maxDisplayX = origin.x;
  let maxDisplayY = origin.y;

  for (const canonical of positions) {
    const display = mapaDetallePositionDisplay(canonical, orientacion, carrilSpan);
    maxDisplayX = Math.max(maxDisplayX, display.x + MAPA_DETALLE_NODE_W);
    maxDisplayY = Math.max(
      maxDisplayY,
      display.y + MAPA_DETALLE_NODE_SLOT_H,
    );
  }

  const contentRect = mapaLienzoContentRectFromIndices(
    indices,
    orientacion,
    MAPA_DETALLE_GRID_PITCH,
    null,
  );
  const tightW = contentRect.x + contentRect.width;
  const tightH = contentRect.y + contentRect.height;

  return {
    etapas: rangeInclusive(indices.etapaMin, indices.etapaMax),
    carriles: rangeInclusive(indices.carrilMin, indices.carrilMax),
    width: Math.max(maxDisplayX + EDGE, tightW),
    height: Math.max(maxDisplayY + EDGE + ETAPA_LABEL_BAND, tightH),
  };
}
