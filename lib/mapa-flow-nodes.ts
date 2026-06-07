import type { Tema } from "@/app/types/estudio";
import type { MapaEnlace, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import type { MapaGrafoEnlace, MapaGrafoModo } from "@/lib/mapa-lienzo-types";
import {
  enlaceCoincideFiltroObjetivo,
  mapaObjetivoIdFromNodo,
  mapaObjetivoNombre,
  nodoCoincideFiltroObjetivo,
  type MapaObjetivoFiltro,
} from "@/lib/mapa-objetivo";
import { posicionEnLienzo, posicionNodoEnLienzo } from "@/lib/mapa-layout";
import { mapaGrafoEnlaceCounts } from "@/lib/mapa-grafo-enlaces";
import type { Node } from "@xyflow/react";

export type MapaFlowNodeBuildOptions = {
  nodos: MapaNodo[];
  enlaces: MapaEnlace[];
  objetivos: MapaObjetivo[];
  filtroObjetivo: MapaObjetivoFiltro;
  onEditNodo: (id: number) => void;
  onAddLinkedNodo?: (id: number) => void;
};

/** Nodos React Flow con visibilidad por filtro de objetivo (hidden, no borrado). */
export function buildMapaFlowNodes({
  nodos,
  enlaces,
  objetivos,
  filtroObjetivo,
  onEditNodo,
  onAddLinkedNodo,
}: MapaFlowNodeBuildOptions): Node[] {
  return nodos.map((nodo) => {
    const pos = posicionNodoEnLienzo(nodo);
    const { entrada, salida } = mapaGrafoEnlaceCounts(nodo.id, enlaces);
    const objetivoId = mapaObjetivoIdFromNodo(nodo);
    const visible = nodoCoincideFiltroObjetivo(nodo, filtroObjetivo);

    return {
      id: String(nodo.id),
      type: "mapaNodo",
      position: pos,
      hidden: !visible,
      data: {
        nodo,
        onEdit: onEditNodo,
        onAddLinked: onAddLinkedNodo,
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
    hidden: !nodoCoincideFiltroObjetivo(nodo, filtroObjetivo),
  }));
}

export type MapaFlowTemaBuildOptions = {
  temas: Tema[];
  enlaces: MapaGrafoEnlace[];
  onEditTema: (id: number) => void;
  onAddLinkedTema?: (id: number) => void;
};

/** Nodos React Flow para vista Temas (tono shell tema, sin filtro objetivo). */
export function buildMapaFlowNodesTemas({
  temas,
  enlaces,
  onEditTema,
  onAddLinkedTema,
}: MapaFlowTemaBuildOptions): Node[] {
  return temas.map((tema) => {
    const pos = posicionEnLienzo(tema);
    const { entrada, salida } = mapaGrafoEnlaceCounts(tema.id, enlaces);

    return {
      id: String(tema.id),
      type: "mapaTema",
      position: pos,
      data: {
        tema,
        onEdit: onEditTema,
        onAddLinked: onAddLinkedTema,
        enlacesEntrada: entrada,
        enlacesSalida: salida,
      },
      draggable: true,
    };
  });
}

export type MapaFlowGrafoBuildOptions = {
  modo: MapaGrafoModo;
  nodos: MapaNodo[];
  temas: Tema[];
  enlaces: MapaGrafoEnlace[];
  objetivos: MapaObjetivo[];
  filtroObjetivo: MapaObjetivoFiltro;
  onEditItem: (id: number) => void;
  onAddLinkedItem?: (id: number) => void;
};

/** Dispatcher lienzo dual — misma firma para nodos y temas. */
export function buildMapaFlowNodesForGrafo({
  modo,
  nodos,
  temas,
  enlaces,
  objetivos,
  filtroObjetivo,
  onEditItem,
  onAddLinkedItem,
}: MapaFlowGrafoBuildOptions): Node[] {
  if (modo === "temas") {
    return buildMapaFlowNodesTemas({
      temas,
      enlaces,
      onEditTema: onEditItem,
      onAddLinkedTema: onAddLinkedItem,
    });
  }
  return buildMapaFlowNodes({
    nodos,
    enlaces: enlaces as MapaEnlace[],
    objetivos,
    filtroObjetivo,
    onEditNodo: onEditItem,
    onAddLinkedNodo: onAddLinkedItem,
  });
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
      enlaceCoincideFiltroObjetivo(origen, destino, filtroObjetivo);
    return { id: String(e.id), hidden: !visible };
  });
}
