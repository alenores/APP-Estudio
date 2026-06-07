import type { MapaDetalleChildKind } from "@/lib/mapa-detalle-types";

export type MapaHijoNodeData = {
  nombre: string;
  descripcion: string | null;
  kind: MapaDetalleChildKind;
};
