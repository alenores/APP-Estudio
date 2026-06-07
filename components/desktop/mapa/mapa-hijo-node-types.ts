import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";

export type MapaHijoNodeData = {
  hijoId: number;
  nombre: string;
  descripcion: string | null;
  kind: MapaDetalleHijoKind;
  onAddLinked?: (kind: MapaDetalleHijoKind, id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
};
