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
import { posicionEnLienzoDisplay } from "@/lib/mapa-lienzo-orientacion";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import { mapaGrafoEnlaceCounts } from "@/lib/mapa-grafo-enlaces";
import {
  buildMapaTemaFlowCardDataMap,
  type MapaTemaFlowCardData,
} from "@/lib/mapa-tema-flow-card";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import type { Node } from "@xyflow/react";

const EMPTY_TEMA_CARD: MapaTemaFlowCardData = {
  derivados: derivarDesdeSeguimientos([]),
  fechaParen: null,
  hijosStats: { terminadas: 0, total: 0 },
};

export type MapaFlowNodeBuildOptions = {
  nodos: MapaNodo[];
  enlaces: MapaEnlace[];
  objetivos: MapaObjetivo[];
  filtroObjetivo: MapaObjetivoFiltro;
  onEditNodo: (id: number) => void;
  onAddLinkedNodo?: (id: number) => void;
  orientacionLienzo?: MapaLienzoOrientacion;
};

/** Nodos React Flow con visibilidad por filtro de objetivo (hidden, no borrado). */
export function buildMapaFlowNodes({
  nodos,
  enlaces,
  objetivos,
  filtroObjetivo,
  onEditNodo,
  onAddLinkedNodo,
  orientacionLienzo = "xy",
}: MapaFlowNodeBuildOptions): Node[] {
  return nodos.map((nodo) => {
    const pos = posicionEnLienzoDisplay(nodo, orientacionLienzo);
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
  temaCardDataMap?: Map<number, MapaTemaFlowCardData>;
  orientacionLienzo?: MapaLienzoOrientacion;
};

/** Nodos React Flow para vista Temas (tono shell tema, sin filtro objetivo). */
export function buildMapaFlowNodesTemas({
  temas,
  enlaces,
  onEditTema,
  onAddLinkedTema,
  temaCardDataMap,
  orientacionLienzo = "xy",
}: MapaFlowTemaBuildOptions): Node[] {
  return temas.map((tema) => {
    const pos = posicionEnLienzoDisplay(tema, orientacionLienzo);
    const { entrada, salida } = mapaGrafoEnlaceCounts(tema.id, enlaces);
    const cardData = temaCardDataMap?.get(tema.id);

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
        cardData: cardData ?? EMPTY_TEMA_CARD,
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
  temaCardDataMap?: Map<number, MapaTemaFlowCardData>;
  orientacionLienzo?: MapaLienzoOrientacion;
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
  temaCardDataMap,
  orientacionLienzo = "xy",
}: MapaFlowGrafoBuildOptions): Node[] {
  if (modo === "temas") {
    return buildMapaFlowNodesTemas({
      temas,
      enlaces,
      onEditTema: onEditItem,
      onAddLinkedTema: onAddLinkedItem,
      temaCardDataMap,
      orientacionLienzo,
    });
  }
  return buildMapaFlowNodes({
    nodos,
    enlaces: enlaces as MapaEnlace[],
    objetivos,
    filtroObjetivo,
    onEditNodo: onEditItem,
    onAddLinkedNodo: onAddLinkedItem,
    orientacionLienzo,
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
