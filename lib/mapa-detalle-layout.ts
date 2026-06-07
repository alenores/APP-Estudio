import type {
  LienzoHijoPosicion,
  MapaDetalleHijoKind,
} from "@/lib/mapa-detalle-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import {
  MAPA_DETALLE_LIENZO_ORIGIN,
  canonicalToDisplay,
} from "@/lib/mapa-lienzo-orientacion";

/** Posición en grilla / persistida para hijos del lienzo detalle. */

export const MAPA_DETALLE_COL_WIDTH = 268;
export const MAPA_DETALLE_ROW_HEIGHT = 108;
const COLS = 3;

const PAD = 1;
const NODE_W = 240;
const NODE_H = 88;

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
  return { x: col * MAPA_DETALLE_COL_WIDTH, y: row * MAPA_DETALLE_ROW_HEIGHT };
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
): { x: number; y: number } {
  return canonicalToDisplay(
    canonical,
    orientacion,
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

  if (posiciones.length === 0 && itemCount === 0) {
    const etapas = [0, 1, 2];
    const carriles = [0, 1];
    const canonicalWidth = 3 * MAPA_DETALLE_COL_WIDTH + 64;
    const canonicalHeight = 2 * MAPA_DETALLE_ROW_HEIGHT + 80;
    if (orientacion === "xy") {
      return { etapas, carriles, width: canonicalWidth, height: canonicalHeight };
    }
    return {
      etapas,
      carriles,
      width: canonicalToDisplay(
        { x: canonicalWidth, y: 0 },
        "yx",
        origin,
      ).x,
      height: canonicalToDisplay(
        { x: 0, y: canonicalHeight },
        "yx",
        origin,
      ).y,
    };
  }

  let minEtapa = Infinity;
  let maxEtapa = -Infinity;
  let minCarril = Infinity;
  let maxCarril = -Infinity;
  let maxDisplayX = origin.x;
  let maxDisplayY = origin.y;

  const canonicalPositions: { x: number; y: number }[] = posiciones.map((p) => ({
    x: p.pos_x,
    y: p.pos_y,
  }));

  for (let i = canonicalPositions.length; i < itemCount; i += 1) {
    canonicalPositions.push(mapaDetalleGridPosition(i));
  }

  for (const canonical of canonicalPositions) {
    const etapaDesdeX = Math.floor(
      (canonical.x + MAPA_DETALLE_COL_WIDTH / 2) / MAPA_DETALLE_COL_WIDTH,
    );
    const carrilDesdeY = Math.floor(
      (canonical.y + MAPA_DETALLE_ROW_HEIGHT / 2) / MAPA_DETALLE_ROW_HEIGHT,
    );
    minEtapa = Math.min(minEtapa, etapaDesdeX);
    maxEtapa = Math.max(maxEtapa, etapaDesdeX);
    minCarril = Math.min(minCarril, carrilDesdeY);
    maxCarril = Math.max(maxCarril, carrilDesdeY);

    const display = canonicalToDisplay(canonical, orientacion, origin);
    maxDisplayX = Math.max(maxDisplayX, display.x + NODE_W);
    maxDisplayY = Math.max(maxDisplayY, display.y + NODE_H);
  }

  const etapaMin = Math.max(0, minEtapa - PAD);
  const etapaMax = maxEtapa + PAD;
  const carrilMin = Math.max(0, minCarril - PAD);
  const carrilMax = maxCarril + PAD;

  const gridWidthDisplay =
    orientacion === "xy"
      ? (etapaMax + 1) * MAPA_DETALLE_COL_WIDTH + 48
      : (carrilMax + 1) * MAPA_DETALLE_ROW_HEIGHT + 48;
  const gridHeightDisplay =
    orientacion === "xy"
      ? (carrilMax + 1) * MAPA_DETALLE_ROW_HEIGHT + 48
      : (etapaMax + 1) * MAPA_DETALLE_COL_WIDTH + 48;

  return {
    etapas: rangeInclusive(etapaMin, etapaMax),
    carriles: rangeInclusive(carrilMin, carrilMax),
    width: Math.max(maxDisplayX + 80, gridWidthDisplay),
    height: Math.max(maxDisplayY + 80, gridHeightDisplay),
  };
}
