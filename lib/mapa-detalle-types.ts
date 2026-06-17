/** Capa 1 del lienzo `/mapa` — hijos de tema o nodo objetivo (ADR 010). */

export type MapaDetalleHijoKind = "curso" | "logro";

/** Qué hijos cargar para un nodo macro (`mixto` = cursos + logros). */
export type MapaDetalleChildKind = MapaDetalleHijoKind | "mixto";

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
  kind: MapaDetalleHijoKind;
  link?: string | null;
  link_chat?: string | null;
  tipo_estudio?: import("@/lib/tipo-estudio").TipoEstudio | null;
};

/** Fila en `enlaces_hijos_nodos` — flechas en lienzo detalle (ADR 010 v2). */
export type EnlaceHijoNodo = {
  id: number;
  user_id: string;
  scope_kind: EnlaceHijoNodoScopeKind;
  scope_id: number;
  origen_kind: MapaDetalleHijoKind;
  origen_id: number;
  destino_kind: MapaDetalleHijoKind;
  destino_id: number;
  tipo: string | null;
  created_at: string;
};

export type EnlaceHijoNodoScopeKind = "tema" | "nodo";

/** Fila en `lienzo_hijos_posiciones` — posición en overlay detalle (ADR 010 fase B). */
export type LienzoHijoPosicion = {
  hijo_kind: MapaDetalleHijoKind;
  hijo_id: number;
  pos_x: number;
  pos_y: number;
};

export function mapaDetalleScopeKey(
  scope: MapaDetalleScope,
): { scope_kind: EnlaceHijoNodoScopeKind; scope_id: number } {
  if (scope.kind === "tema") {
    return { scope_kind: "tema", scope_id: scope.temaId };
  }
  return { scope_kind: "nodo", scope_id: scope.nodoId };
}
