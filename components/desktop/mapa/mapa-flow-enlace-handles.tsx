"use client";

import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import { mapaLienzoFlowHandleConfig } from "@/lib/mapa-lienzo-orientacion";
import { Handle } from "@xyflow/react";

type MapaFlowEnlaceHandleProps = {
  orientacionLienzo?: MapaLienzoOrientacion;
};

/** Entrada de enlaces — izquierda (X/Y) o arriba (Y/X). */
export function MapaFlowEnlaceHandleTarget({
  orientacionLienzo = "xy",
}: MapaFlowEnlaceHandleProps) {
  const { targetPosition, axis } = mapaLienzoFlowHandleConfig(orientacionLienzo);
  return (
    <Handle
      type="target"
      position={targetPosition}
      id="target"
      className={`mapa-flow-handle mapa-flow-handle--target mapa-flow-handle--axis-${axis}`}
      title="Recibe enlaces (entrada)"
    />
  );
}

/** Salida de enlaces — derecha (X/Y) o abajo (Y/X). */
export function MapaFlowEnlaceHandleSource({
  orientacionLienzo = "xy",
}: MapaFlowEnlaceHandleProps) {
  const { sourcePosition, axis } = mapaLienzoFlowHandleConfig(orientacionLienzo);
  return (
    <Handle
      type="source"
      position={sourcePosition}
      id="source"
      className={`mapa-flow-handle mapa-flow-handle--source mapa-flow-handle--axis-${axis}`}
      title="Creá enlaces (salida)"
    />
  );
}
