/** Proyección visual del lienzo — canónico X/Y (etapa→X, carril→Y) vs transpuesto Y/X. */

import type { LienzoPosicionable } from "@/lib/mapa-lienzo-types";
import { Position } from "@xyflow/react";
import {
  MAPA_CARRIL_HEIGHT,
  MAPA_ORIGIN_X,
  MAPA_ORIGIN_Y,
  posicionEnLienzo,
} from "@/lib/mapa-layout";

export type MapaLienzoOrientacion = "xy" | "yx";

export type MapaLienzoOrigin = { x: number; y: number };

/** Rango de carriles visible — para espejar el eje Y en Etapa→X. */
export type MapaCarrilSpan = { min: number; max: number };

export const MAPA_LIENZO_ORIGIN: MapaLienzoOrigin = {
  x: MAPA_ORIGIN_X,
  y: MAPA_ORIGIN_Y,
};

export const MAPA_DETALLE_LIENZO_ORIGIN: MapaLienzoOrigin = { x: 0, y: 0 };

export type MapaLienzoProjectOptions = {
  orientacion: MapaLienzoOrientacion;
  origin?: MapaLienzoOrigin;
  carrilSpan?: MapaCarrilSpan;
  carrilPitch?: number;
};

/** Espeja Y canónico: carril 0 abajo, mayor carril arriba (solo presentación). */
export function flipCanonicalYForCarrilAxis(
  y: number,
  span: MapaCarrilSpan,
  originY: number,
  pitch: number,
): number {
  const laneTop = originY + span.min * pitch;
  const laneMaxStart = originY + span.max * pitch;
  return laneTop + laneMaxStart - y;
}

/** Y de guía para un índice de carril en Etapa→X (tras flip). */
export function mapaCarrilGuideY(
  carril: number,
  span: MapaCarrilSpan,
  originY: number,
  pitch: number,
): number {
  return flipCanonicalYForCarrilAxis(
    originY + carril * pitch,
    span,
    originY,
    pitch,
  );
}

export function carrilSpanFromIndices(carriles: number[]): MapaCarrilSpan {
  return {
    min: carriles[0] ?? 0,
    max: carriles.at(-1) ?? 0,
  };
}

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

/** Canónico → pantalla (flip carril en X/Y + swap en Y/X). */
export function projectCanonicalToDisplay(
  pos: { x: number; y: number },
  {
    orientacion,
    origin = MAPA_LIENZO_ORIGIN,
    carrilSpan,
    carrilPitch = MAPA_CARRIL_HEIGHT,
  }: MapaLienzoProjectOptions,
): { x: number; y: number } {
  let projected = { ...pos };
  if (orientacion === "xy" && carrilSpan) {
    projected = {
      ...projected,
      y: flipCanonicalYForCarrilAxis(
        projected.y,
        carrilSpan,
        origin.y,
        carrilPitch,
      ),
    };
  }
  if (orientacion === "yx") {
    projected = swapLienzoCoordsAroundOrigin(projected, origin);
  }
  return projected;
}

/** Pantalla → canónico (inversa de projectCanonicalToDisplay). */
export function projectDisplayToCanonical(
  pos: { x: number; y: number },
  options: MapaLienzoProjectOptions,
): { x: number; y: number } {
  const {
    orientacion,
    origin = MAPA_LIENZO_ORIGIN,
    carrilSpan,
    carrilPitch = MAPA_CARRIL_HEIGHT,
  } = options;
  let projected = { ...pos };
  if (orientacion === "yx") {
    projected = swapLienzoCoordsAroundOrigin(projected, origin);
  }
  if (orientacion === "xy" && carrilSpan) {
    projected = {
      ...projected,
      y: flipCanonicalYForCarrilAxis(
        projected.y,
        carrilSpan,
        origin.y,
        carrilPitch,
      ),
    };
  }
  return projected;
}

/** @deprecated Usar projectCanonicalToDisplay */
export function canonicalToDisplay(
  pos: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
): { x: number; y: number } {
  return projectCanonicalToDisplay(pos, { orientacion, origin });
}

/** @deprecated Usar projectDisplayToCanonical */
export function displayToCanonical(
  pos: { x: number; y: number },
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
): { x: number; y: number } {
  return projectDisplayToCanonical(pos, { orientacion, origin });
}

export function posicionEnLienzoDisplay(
  item: LienzoPosicionable,
  orientacion: MapaLienzoOrientacion,
  origin: MapaLienzoOrigin = MAPA_LIENZO_ORIGIN,
  carrilSpan?: MapaCarrilSpan,
): { x: number; y: number } {
  return projectCanonicalToDisplay(posicionEnLienzo(item), {
    orientacion,
    origin: origin ?? MAPA_LIENZO_ORIGIN,
    carrilSpan,
  });
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
