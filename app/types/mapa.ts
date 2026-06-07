/** Nodo del mapa de conocimiento (grafo PC). Tabla `nodos_objetivos`. */

export type MapaObjetivoId = 1 | 2 | 3;

/** Catálogo global de objetivos (tabla `objetivos`). */
export type MapaObjetivo = {
  id: MapaObjetivoId;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string;
};

export type NodoObjetivoTipo = "dominio" | string;

/** Fila en `nodos_objetivos` (antes `mapa_nodos`). */
export type MapaNodo = {
  id: number;
  user_id: string;
  titulo: string;
  descripcion: string | null;
  pos_x: number;
  pos_y: number;
  carril: number;
  etapa: number;
  /** Orden en listados (explorador PC). Fallback UI: `etapa`. */
  orden: number;
  tipo: NodoObjetivoTipo | null;
  objetivo_id: number;
  created_at: string;
};

export type MapaEnlaceTipo =
  | "prerequisito"
  | "continuacion"
  | "refuerzo"
  | "paralelo";

/** Fila en `enlaces_nodos` (antes `mapa_enlaces`). */
export type MapaEnlace = {
  id: number;
  user_id: string;
  origen_id: number;
  destino_id: number;
  tipo: MapaEnlaceTipo | null;
  created_at: string;
};
