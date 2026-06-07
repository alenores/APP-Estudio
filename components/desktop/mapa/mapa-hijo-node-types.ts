import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";

export type MapaHijoNodeData = {
  nombre: string;
  descripcion: string | null;
  kind: MapaDetalleHijoKind;
  enlacesEntrada?: number;
  enlacesSalida?: number;
};
