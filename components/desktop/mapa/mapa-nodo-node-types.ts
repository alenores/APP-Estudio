import type { MapaNodo } from "@/app/types/mapa";
import type { MapaObjetivoId } from "@/app/types/mapa";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";

export type MapaNodoNodeData = {
  nodo: MapaNodo;
  onEdit: (id: number) => void;
  onAddLinked?: (id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
  objetivoId?: MapaObjetivoId | null;
  objetivoNombre?: string | null;
  orientacionLienzo?: MapaLienzoOrientacion;
};
