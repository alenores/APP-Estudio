import type { MapaNodo } from "@/app/types/mapa";
import {
  MAPA_CARRIL_HEIGHT,
  MAPA_ETAPA_WIDTH,
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
  posicionNodoEnLienzo,
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

/** Extensión del grid de guías según etapas/c carriles y posiciones libres en el lienzo. */
export function computeMapaGridBounds(nodos: MapaNodo[]): MapaGridBounds {
  if (nodos.length === 0) {
    return {
      etapas: [0, 1, 2, 3],
      carriles: [0, 1, 2],
      width: MAPA_ORIGIN_X + 4 * MAPA_ETAPA_WIDTH + 64,
      height: MAPA_ORIGIN_Y + 3 * MAPA_CARRIL_HEIGHT + 80,
    };
  }

  let minEtapa = Infinity;
  let maxEtapa = -Infinity;
  let minCarril = Infinity;
  let maxCarril = -Infinity;
  let maxX = MAPA_ORIGIN_X;
  let maxY = MAPA_ORIGIN_Y;

  for (const nodo of nodos) {
    const etapa = Number(nodo.etapa);
    const carril = Number(nodo.carril);
    minEtapa = Math.min(minEtapa, etapa);
    maxEtapa = Math.max(maxEtapa, etapa);
    minCarril = Math.min(minCarril, carril);
    maxCarril = Math.max(maxCarril, carril);

    const pos = posicionNodoEnLienzo(nodo);
    const etapaDesdeX = Math.floor(
      (pos.x - MAPA_ORIGIN_X + MAPA_ETAPA_WIDTH / 2) / MAPA_ETAPA_WIDTH,
    );
    const carrilDesdeY = Math.floor(
      (pos.y - MAPA_ORIGIN_Y + MAPA_CARRIL_HEIGHT / 2) / MAPA_CARRIL_HEIGHT,
    );
    minEtapa = Math.min(minEtapa, etapaDesdeX);
    maxEtapa = Math.max(maxEtapa, etapaDesdeX);
    minCarril = Math.min(minCarril, carrilDesdeY);
    maxCarril = Math.max(maxCarril, carrilDesdeY);

    maxX = Math.max(maxX, pos.x + NODE_W);
    maxY = Math.max(maxY, pos.y + NODE_H);
  }

  const etapaMin = Math.max(0, minEtapa - PAD_ETAPA);
  const etapaMax = maxEtapa + PAD_ETAPA;
  const carrilMin = Math.max(0, minCarril - PAD_CARRIL);
  const carrilMax = maxCarril + PAD_CARRIL;

  const width = Math.max(
    maxX + 80,
    MAPA_ORIGIN_X + (etapaMax + 1) * MAPA_ETAPA_WIDTH + 48,
  );
  const height = Math.max(
    maxY + 80,
    MAPA_ORIGIN_Y + (carrilMax + 1) * MAPA_CARRIL_HEIGHT + 48,
  );

  return {
    etapas: rangeInclusive(etapaMin, etapaMax),
    carriles: rangeInclusive(carrilMin, carrilMax),
    width,
    height,
  };
}
