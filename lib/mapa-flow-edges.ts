import type { MapaEnlace } from "@/app/types/mapa";
import { MarkerType, type Edge } from "@xyflow/react";

/** Convierte enlaces del mapa a edges de React Flow. */
export function toFlowEdges(enlaces: MapaEnlace[]): Edge[] {
  return enlaces.map((e) => ({
    id: String(e.id),
    source: String(e.origen_id),
    target: String(e.destino_id),
    type: "smoothstep",
    deletable: true,
    selectable: true,
    style: { stroke: "#264a6e", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#264a6e",
      width: 18,
      height: 18,
    },
  }));
}
