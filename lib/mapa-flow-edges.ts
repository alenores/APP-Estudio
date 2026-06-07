import type { MapaNodo } from "@/app/types/mapa";
import type { MapaGrafoEnlace } from "@/lib/mapa-lienzo-types";
import {
  enlaceCoincideFiltroObjetivo,
  type MapaObjetivoFiltro,
} from "@/lib/mapa-objetivo";
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

export type ToFlowEdgesOptions = {
  nodosById?: Map<number, MapaNodo>;
  filtroObjetivo?: MapaObjetivoFiltro;
};

/** Convierte enlaces del grafo (nodos o temas) a edges de React Flow. */
export function toFlowEdges(
  enlaces: MapaGrafoEnlace[],
  options?: ToFlowEdgesOptions,
): Edge[] {
  const filtro = options?.filtroObjetivo ?? "todos";
  const nodosById = options?.nodosById;

  return enlaces.map((e) => {
    const stroke = strokeForTipo(e.tipo);
    let hidden = false;
    if (filtro !== "todos" && nodosById) {
      const origen = nodosById.get(e.origen_id);
      const destino = nodosById.get(e.destino_id);
      if (origen && destino) {
        hidden = !enlaceCoincideFiltroObjetivo(origen, destino, filtro);
      }
    }
    return {
      id: String(e.id),
      source: String(e.origen_id),
      target: String(e.destino_id),
      type: "smoothstep",
      deletable: true,
      selectable: true,
      hidden,
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
