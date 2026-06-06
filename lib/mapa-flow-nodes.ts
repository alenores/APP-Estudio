import type { MapaEnlace, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import {
  enlaceCoincideFiltroObjetivo,
  mapaObjetivoIdFromEtapa,
  mapaObjetivoNombre,
  nodoCoincideFiltroObjetivo,
  type MapaObjetivoFiltro,
} from "@/lib/mapa-objetivo";
import { posicionNodoEnLienzo } from "@/lib/mapa-layout";
import { mapaNodoEnlaceCounts } from "@/lib/mapa-nodo-ui";
import type { Node } from "@xyflow/react";

export type MapaFlowNodeBuildOptions = {
  nodos: MapaNodo[];
  enlaces: MapaEnlace[];
  objetivos: MapaObjetivo[];
  filtroObjetivo: MapaObjetivoFiltro;
  onEditNodo: (id: number) => void;
};

/** Nodos React Flow con visibilidad por filtro de objetivo (hidden, no borrado). */
export function buildMapaFlowNodes({
  nodos,
  enlaces,
  objetivos,
  filtroObjetivo,
  onEditNodo,
}: MapaFlowNodeBuildOptions): Node[] {
  return nodos.map((nodo) => {
    const pos = posicionNodoEnLienzo(nodo);
    const { entrada, salida } = mapaNodoEnlaceCounts(nodo.id, enlaces);
    const objetivoId = mapaObjetivoIdFromEtapa(nodo.etapa);
    const visible = nodoCoincideFiltroObjetivo(nodo.etapa, filtroObjetivo);

    return {
      id: String(nodo.id),
      type: "mapaNodo",
      position: pos,
      hidden: !visible,
      data: {
        nodo,
        onEdit: onEditNodo,
        enlacesEntrada: entrada,
        enlacesSalida: salida,
        objetivoId,
        objetivoNombre:
          objetivoId != null
            ? mapaObjetivoNombre(objetivos, objetivoId)
            : null,
      },
      draggable: true,
    };
  });
}

export function buildMapaFlowNodeVisibilityPatch(
  nodos: MapaNodo[],
  filtroObjetivo: MapaObjetivoFiltro,
): { id: string; hidden: boolean }[] {
  return nodos.map((nodo) => ({
    id: String(nodo.id),
    hidden: !nodoCoincideFiltroObjetivo(nodo.etapa, filtroObjetivo),
  }));
}

export function buildMapaFlowEdgeVisibilityPatch(
  enlaces: MapaEnlace[],
  nodosById: Map<number, MapaNodo>,
  filtroObjetivo: MapaObjetivoFiltro,
): { id: string; hidden: boolean }[] {
  return enlaces.map((e) => {
    const origen = nodosById.get(e.origen_id);
    const destino = nodosById.get(e.destino_id);
    const visible =
      origen != null &&
      destino != null &&
      enlaceCoincideFiltroObjetivo(
        origen.etapa,
        destino.etapa,
        filtroObjetivo,
      );
    return { id: String(e.id), hidden: !visible };
  });
}
