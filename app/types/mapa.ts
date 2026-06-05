/** Nodo del mapa de conocimiento (grafo PC). No confundir con `conceptos` de estudio. */

export type MapaNodo = {
  id: number;
  user_id: string;
  titulo: string;
  descripcion: string | null;
  pos_x: number;
  pos_y: number;
  carril: number;
  etapa: number;
  created_at: string;
};

export type MapaEnlaceTipo =
  | "prerequisito"
  | "continuacion"
  | "refuerzo"
  | "paralelo";

export type MapaEnlace = {
  id: number;
  user_id: string;
  origen_id: number;
  destino_id: number;
  tipo: MapaEnlaceTipo | null;
  created_at: string;
};
