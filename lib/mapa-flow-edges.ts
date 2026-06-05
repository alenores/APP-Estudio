import type { MapaEnlace, MapaEnlaceTipo } from "@/app/types/mapa";
import { MarkerType, type Edge } from "@xyflow/react";

const ENLACE_STROKE: Record<NonNullable<MapaEnlaceTipo>, string> = {
  prerequisito: "#264a6e",
  continuacion: "#35618f",
  refuerzo: "#b8860b",
  paralelo: "#54734f",
};

function strokeForTipo(tipo: MapaEnlaceTipo | null): string {
  return ENLACE_STROKE[tipo ?? "prerequisito"];
}

/** Convierte enlaces del mapa a edges de React Flow. */
export function toFlowEdges(enlaces: MapaEnlace[]): Edge[] {
  return enlaces.map((e) => {
    const stroke = strokeForTipo(e.tipo);
    return {
      id: String(e.id),
      source: String(e.origen_id),
      target: String(e.destino_id),
      type: "smoothstep",
      deletable: true,
      selectable: true,
      style: { stroke, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: stroke,
        width: 18,
        height: 18,
      },
    };
  });
}
