/** Proyección visual del lienzo — canónico X/Y (etapa→X, carril→Y) vs transpuesto Y/X. */

import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import { Position } from "@xyflow/react";
import {
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
  posicionEnLienzo,
} from "@/lib/mapa-layout";

export type MapaLienzoOrientacion = "xy" | "yx";

export type MapaLienzoOrigin = { x: number; y: number };

export const MAPA_LIENZO_ORIGIN: MapaLienzoOrigin = {
  x: MAPA_ORIGIN_X,
  y: MAPA_ORIGIN_Y,
};

export const MAPA_DETALLE_LIENZO_ORIGIN: MapaLienzoOrigin = { x: 0, y: 0 };

/** Intercambia offsets respecto al origen (opción B — incluye posiciones arrastradas). */
export function swapLienzoCoordsAroundOrigin(
  pos: { x: number; y: number },
  origin: MapaLienzoOrigin,
): { x: number; y: number } {
  return {
    x: origin.x + (pos.y - origin.y),
    y: origin.y + (pos.x - origin.x),
  };
}

export function canonicalToDisplay(
  pos: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
): { x: number; y: number } {
  if (orientacion === "xy") return pos;
  return swapLienzoCoordsAroundOrigin(pos, origin);
}

export function displayToCanonical(
  pos: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
): { x: number; y: number } {
  if (orientacion === "xy") return pos;
  return swapLienzoCoordsAroundOrigin(pos, origin);
}

export function posicionEnLienzoDisplay(
  item: LienzoPosicionable,
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
): { x: number; y: number } {
  return canonicalToDisplay(posicionEnLienzo(item), orientacion, origin);
}

/** Handles y badges de enlaces según orientación del lienzo. */
export function mapaLienzoFlowHandleConfig(
  orientacion: MapaLienzoOrientacion = "xy",
) {
  const vertical = orientacion === "yx";
  return {
    axis: vertical ? ("y" as const) : ("x" as const),
    targetPosition: vertical ? Position.Top : Position.Left,
    sourcePosition: vertical ? Position.Bottom : Position.Right,
    badgeEntrada: vertical ? "↑" : "←",
    badgeSalida: vertical ? "↓" : "→",
  };
}
