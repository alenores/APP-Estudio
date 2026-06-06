import type { MapaNodo } from "@/app/types/mapa";
import type { MapaObjetivoId } from "@/app/types/mapa";

export type MapaNodoNodeData = {
  nodo: MapaNodo;
  onEdit: (id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
  objetivoId?: MapaObjetivoId | null;
  objetivoNombre?: string | null;
};
