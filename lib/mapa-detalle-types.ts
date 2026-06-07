/** Capa 1 del lienzo `/mapa` — hijos de tema o nodo objetivo (ADR 010). */

export type MapaDetalleChildKind = "curso" | "logro";

export type MapaDetalleScope =
  | {
      kind: "tema";
      temaId: number;
      parentLabel: string;
      childKind: "curso";
    }
  | {
      kind: "nodo";
      nodoId: number;
      parentLabel: string;
      childKind: MapaDetalleChildKind;
    };

export type MapaDetalleHijo = {
  id: number;
  nombre: string;
  descripcion: string | null;
  kind: MapaDetalleChildKind;
};
