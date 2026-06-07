import type { Tema } from "@/app/types/estudio";
import type { MapaTemaFlowCardData } from "@/lib/mapa-tema-flow-card";

export type MapaTemaNodeData = {
  tema: Tema;
  onEdit: (id: number) => void;
  onAddLinked?: (id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
  cardData: MapaTemaFlowCardData;
};
