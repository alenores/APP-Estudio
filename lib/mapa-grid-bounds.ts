import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import { canonicalToDisplay } from "@/lib/mapa-lienzo-orientacion";
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

const PAD_ETAPA = 1;
const PAD_CARRIL = 1;
const NODE_W = 240;
const NODE_H = 88;

function rangeInclusive(min: number, max: number): number[] {
  const out: number[] = [];
  for (let i = min; i <= max; i += 1) out.push(i);
  return out;
}

function emptyMapaGridBounds(orientacion: MapaLienzoOrientacion): MapaGridBounds {
  const etapas = [0, 1, 2, 3];
  const carriles = [0, 1, 2];
  const canonicalWidth = MAPA_ORIGIN_X + 4 * MAPA_ETAPA_WIDTH + 64;
  const canonicalHeight = MAPA_ORIGIN_Y + 3 * MAPA_CARRIL_HEIGHT + 80;
  if (orientacion === "xy") {
    return { etapas, carriles, width: canonicalWidth, height: canonicalHeight };
  }
  return {
    etapas,
    carriles,
    width: canonicalToDisplay({ x: canonicalWidth, y: 0 }, "yx").x,
    height: canonicalToDisplay({ x: 0, y: canonicalHeight }, "yx").y,
  };
}

/** Extensión del grid de guías según etapas/c carriles y posiciones libres en el lienzo. */
export function computeMapaGridBounds(
  items: LienzoPosicionable[],
  orientacion: MapaLienzoOrientacion = "xy",
): MapaGridBounds {
  if (items.length === 0) {
    return emptyMapaGridBounds(orientacion);
  }

  let minEtapa = Infinity;
  let maxEtapa = -Infinity;
  let minCarril = Infinity;
  let maxCarril = -Infinity;
  let maxDisplayX = MAPA_ORIGIN_X;
  let maxDisplayY = MAPA_ORIGIN_Y;

  for (const item of items) {
    const etapa = Number(item.etapa);
    const carril = Number(item.carril);
    minEtapa = Math.min(minEtapa, etapa);
    maxEtapa = Math.max(maxEtapa, etapa);
    minCarril = Math.min(minCarril, carril);
    maxCarril = Math.max(maxCarril, carril);

    const canonical = posicionEnLienzo(item);
    const etapaDesdeX = Math.floor(
      (canonical.x - MAPA_ORIGIN_X + MAPA_ETAPA_WIDTH / 2) / MAPA_ETAPA_WIDTH,
    );
    const carrilDesdeY = Math.floor(
      (canonical.y - MAPA_ORIGIN_Y + MAPA_CARRIL_HEIGHT / 2) /
        MAPA_CARRIL_HEIGHT,
    );
    minEtapa = Math.min(minEtapa, etapaDesdeX);
    maxEtapa = Math.max(maxEtapa, etapaDesdeX);
    minCarril = Math.min(minCarril, carrilDesdeY);
    maxCarril = Math.max(maxCarril, carrilDesdeY);

    const display = canonicalToDisplay(canonical, orientacion);
    maxDisplayX = Math.max(maxDisplayX, display.x + NODE_W);
    maxDisplayY = Math.max(maxDisplayY, display.y + NODE_H);
  }

  const etapaMin = Math.max(0, minEtapa - PAD_ETAPA);
  const etapaMax = maxEtapa + PAD_ETAPA;
  const carrilMin = Math.max(0, minCarril - PAD_CARRIL);
  const carrilMax = maxCarril + PAD_CARRIL;

  const gridWidthCanonical =
    MAPA_ORIGIN_X + (etapaMax + 1) * MAPA_ETAPA_WIDTH + 48;
  const gridHeightCanonical =
    MAPA_ORIGIN_Y + (carrilMax + 1) * MAPA_CARRIL_HEIGHT + 48;

  const gridWidthDisplay =
    orientacion === "xy"
      ? gridWidthCanonical
      : MAPA_ORIGIN_X + (carrilMax + 1) * MAPA_CARRIL_HEIGHT + 48;
  const gridHeightDisplay =
    orientacion === "xy"
      ? gridHeightCanonical
      : MAPA_ORIGIN_Y + (etapaMax + 1) * MAPA_ETAPA_WIDTH + 48;

  return {
    etapas: rangeInclusive(etapaMin, etapaMax),
    carriles: rangeInclusive(carrilMin, carrilMax),
    width: Math.max(maxDisplayX + 80, gridWidthDisplay),
    height: Math.max(maxDisplayY + 80, gridHeightDisplay),
  };
}
