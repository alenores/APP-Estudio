import type { MapaNodo } from "@/app/types/mapa";
import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";

/** Ancho entre columnas de etapa en el lienzo (eje X / timeline). */
export const MAPA_ETAPA_WIDTH = 280;

/** Alto entre carriles paralelos (eje Y). */
export const MAPA_CARRIL_HEIGHT = 120;

const MAPA_ORIGIN_X = 48;
const MAPA_ORIGIN_Y = 48;

export { MAPA_ORIGIN_X, MAPA_ORIGIN_Y };

/** Posición inicial sugerida desde etapa + carril (sin depender del padre). */
export function posicionDesdeEtapaCarril(
  etapa: number,
  carril: number,
): { x: number; y: number } {
  return {
    x: MAPA_ORIGIN_X + etapa * MAPA_ETAPA_WIDTH,
    y: MAPA_ORIGIN_Y + carril * MAPA_CARRIL_HEIGHT,
  };
}

/** Posición en React Flow: guardada en BD o derivada de etapa/carril si aún está en origen. */
export function posicionEnLienzo(item: LienzoPosicionable): { x: number; y: number } {
  const px = Number(item.pos_x ?? 0);
  const py = Number(item.pos_y ?? 0);
  const enOrigen = px === 0 && py === 0;
  const etapa = Number(item.etapa ?? 0);
  const carril = Number(item.carril ?? 0);
  const tieneSemantica = etapa !== 0 || carril !== 0;
  if (enOrigen && tieneSemantica) {
    return posicionDesdeEtapaCarril(etapa, carril);
  }
  if (enOrigen) {
    return posicionDesdeEtapaCarril(0, 0);
  }
  return { x: px, y: py };
}

/** Alias para nodos_objetivos (misma lógica que temas en lienzo). */
export function posicionNodoEnLienzo(nodo: MapaNodo): { x: number; y: number } {
  return posicionEnLienzo(nodo);
}
