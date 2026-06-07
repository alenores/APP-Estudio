import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";

export type MapaHijoNodeData = {
  hijoId: number;
  nombre: string;
  descripcion: string | null;
  kind: MapaDetalleHijoKind;
  onAddLinked?: (kind: MapaDetalleHijoKind, id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
  orientacionLienzo?: MapaLienzoOrientacion;
};
