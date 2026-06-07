/** Tipos compartidos del lienzo dual (nodos objetivo | temas) — ADR 009 fase 9b. */

/** Modo del grafo en `/mapa`. */
export type MapaGrafoModo = "nodos" | "temas";

/** Fila con posición persistida o derivable de etapa/carril. */
export type LienzoPosicionable = {
  pos_x: number;
  pos_y: number;
  etapa: number;
  carril: number;
};

/** Enlace mínimo para React Flow (nodos o temas). */
export type MapaGrafoEnlace = {
  id: number;
  origen_id: number;
  destino_id: number;
  tipo: string | null;
};

/** Par origen/destino — suficiente para contar enlaces en cards. */
export type MapaGrafoEnlaceEndpoints = Pick<
  MapaGrafoEnlace,
  "origen_id" | "destino_id"
>;
