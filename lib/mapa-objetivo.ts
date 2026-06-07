/**
 * Objetivos del mapa / nodos (roadmap ERP).
 * Catálogo en Supabase `objetivos`; cada fila de `nodos_objetivos` tiene `objetivo_id`.
 * ADR 009 fase 7.
 */

import type { MapaNodo, MapaObjetivo, MapaObjetivoId } from "@/app/types/mapa";
import {
  OBJETIVO_COLOR,
  OBJETIVO_SHORT,
  parseObjetivoId,
} from "@/lib/objetivo-ui";

/** Id de objetivo en BD (objetivos.id). */
export type { MapaObjetivoId };

/** @deprecated Usar OBJETIVO_COLOR en lib/objetivo-ui.ts */
export const MAPA_OBJETIVO_COLOR: Record<MapaObjetivoId, string> = OBJETIVO_COLOR;

/** @deprecated Usar OBJETIVO_SHORT en lib/objetivo-ui.ts */
export const MAPA_OBJETIVO_SHORT: Record<MapaObjetivoId, string> = OBJETIVO_SHORT;

/** Objetivo visual de un nodo según `nodos_objetivos.objetivo_id`. */
export function mapaObjetivoIdFromNodo(
  nodo: Pick<MapaNodo, "objetivo_id"> | null | undefined,
): MapaObjetivoId | null {
  if (!nodo) return null;
  return parseObjetivoId(nodo.objetivo_id);
}

export function mapaObjetivoColor(id: MapaObjetivoId): string {
  return OBJETIVO_COLOR[id];
}

export function mapaObjetivoToneClass(id: MapaObjetivoId): string {
  return `mapa-flow-node--objetivo-${id}`;
}

export type MapaObjetivoFiltro = "todos" | MapaObjetivoId;

export function nodoCoincideFiltroObjetivo(
  nodo: Pick<MapaNodo, "objetivo_id">,
  filtro: MapaObjetivoFiltro,
): boolean {
  if (filtro === "todos") return true;
  return mapaObjetivoIdFromNodo(nodo) === filtro;
}

export function enlaceCoincideFiltroObjetivo(
  origen: Pick<MapaNodo, "objetivo_id">,
  destino: Pick<MapaNodo, "objetivo_id">,
  filtro: MapaObjetivoFiltro,
): boolean {
  if (filtro === "todos") return true;
  return (
    nodoCoincideFiltroObjetivo(origen, filtro) &&
    nodoCoincideFiltroObjetivo(destino, filtro)
  );
}

/** Nombre legible desde catálogo BD o fallback por id. */
export function mapaObjetivoNombre(
  objetivos: MapaObjetivo[],
  id: MapaObjetivoId,
): string {
  return objetivos.find((o) => o.id === id)?.nombre ?? `Objetivo ${id}`;
}

export function mapaObjetivosOrdenados(objetivos: MapaObjetivo[]): MapaObjetivo[] {
  return [...objetivos].sort(
    (a, b) => a.orden - b.orden || a.id - b.id,
  );
}

/** Ids 1–3 presentes en catálogo (fallback si BD vacía). */
export function mapaObjetivoIdsDisponibles(
  objetivos: MapaObjetivo[],
): MapaObjetivoId[] {
  const fromDb = mapaObjetivosOrdenados(objetivos)
    .map((o) => o.id)
    .filter((id): id is MapaObjetivoId => id === 1 || id === 2 || id === 3);
  if (fromDb.length > 0) return fromDb;
  return [1, 2, 3];
}

/** Orden en explorador PC y listados. */
export function sortNodosObjetivos(nodos: MapaNodo[]): MapaNodo[] {
  return [...nodos].sort(
    (a, b) =>
      (a.orden ?? a.etapa) - (b.orden ?? b.etapa) ||
      a.etapa - b.etapa ||
      a.carril - b.carril ||
      a.titulo.localeCompare(b.titulo, "es"),
  );
}
