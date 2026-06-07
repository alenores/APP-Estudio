/** Clasificación de filas en `nodos_objetivos` (columna `tipo`). ADR 002. */

export type NodoObjetivoClasificacion = "nodo" | "logro";

export const NODO_OBJETIVO_CLASIFICACIONES = [
  "nodo",
  "logro",
] as const satisfies readonly NodoObjetivoClasificacion[];

export function nodoAceptaCursos(
  tipo: NodoObjetivoClasificacion,
): boolean {
  return tipo === "nodo";
}

export function nodoClasificacionLabel(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "logro" ? "Logro" : "Nodo";
}

/** Clase CSS mapa React Flow por clasificación. */
export function mapaNodoClasificacionClass(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "logro"
    ? "mapa-flow-node--logro"
    : "mapa-flow-node--tipo-nodo";
}

/** Clase CSS card explorador por clasificación. */
export function exploradorNodoClasificacionClass(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "logro"
    ? "explorer-card--logro"
    : "explorer-card--tipo-nodo";
}
