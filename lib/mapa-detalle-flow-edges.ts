import type { EnlaceHijoNodo } from "@/lib/mapa-detalle-types";
import { mapaDetalleFlowNodeId } from "@/lib/mapa-detalle-layout";
import { MarkerType, type Edge } from "@xyflow/react";

const ENLACE_STROKE: Record<
  "prerequisito" | "continuacion" | "refuerzo" | "paralelo",
  string
> = {
  prerequisito: "#264a6e",
  continuacion: "#35618f",
  refuerzo: "#b8860b",
  paralelo: "#54734f",
};

function strokeForTipo(tipo: string | null): string {
  const key = (tipo ?? "prerequisito") as keyof typeof ENLACE_STROKE;
  return ENLACE_STROKE[key] ?? ENLACE_STROKE.prerequisito;
}

/** Convierte filas `enlaces_hijos_nodos` a edges de React Flow. */
export function toMapaDetalleFlowEdges(enlaces: EnlaceHijoNodo[]): Edge[] {
  return enlaces.map((e) => {
    const stroke = strokeForTipo(e.tipo);
    return {
      id: String(e.id),
      source: mapaDetalleFlowNodeId(e.origen_kind, e.origen_id),
      target: mapaDetalleFlowNodeId(e.destino_kind, e.destino_id),
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
