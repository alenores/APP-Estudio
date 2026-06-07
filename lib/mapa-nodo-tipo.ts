/** Clasificación macro de filas en `nodos_objetivos` (columna `tipo`). ADR 002. */

export type NodoObjetivoClasificacion = "formacion" | "produccion";

export const NODO_OBJETIVO_CLASIFICACIONES = [
  "formacion",
  "produccion",
] as const satisfies readonly NodoObjetivoClasificacion[];

/** Acepta filas en `cursos` como hijos. */
export function nodoAceptaCursos(
  tipo: NodoObjetivoClasificacion,
): boolean {
  return tipo === "formacion";
}

/** Acepta filas en tabla `logros` como hijos. */
export function nodoAceptaLogrosRegistro(
  tipo: NodoObjetivoClasificacion,
): boolean {
  return tipo === "formacion" || tipo === "produccion";
}

export function nodoClasificacionLabel(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "produccion" ? "Producción" : "Formación";
}

/** Clase CSS mapa React Flow por clasificación. */
export function mapaNodoClasificacionClass(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "produccion"
    ? "mapa-flow-node--produccion"
    : "mapa-flow-node--formacion";
}

/** Clase CSS card explorador por clasificación. */
export function exploradorNodoClasificacionClass(
  tipo: NodoObjetivoClasificacion,
): string {
  return tipo === "produccion"
    ? "explorer-card--produccion"
    : "explorer-card--formacion";
}

/** Normaliza valores legacy (nodo/logro) leídos antes de migrar SQL 010. */
export function normalizeNodoObjetivoClasificacion(
  raw: unknown,
): NodoObjetivoClasificacion {
  if (raw === "produccion" || raw === "logro") return "produccion";
  return "formacion";
}

export type ExplorerMiddleColumnMode = "cursos" | "logros" | "mixto";

export function middleColumnModeForNodo(
  tipo: NodoObjetivoClasificacion | undefined,
): ExplorerMiddleColumnMode {
  if (tipo === "produccion") return "logros";
  if (tipo === "formacion") return "mixto";
  return "cursos";
}
