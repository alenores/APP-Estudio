/**
 * Objetivos del mapa de conocimiento (roadmap ERP).
 * Catálogo en Supabase `objetivos`; color/filtro por rango de `mapa_nodos.etapa`.
 * ADR 009 fase 7.
 */

import type { MapaObjetivo, MapaObjetivoId } from "@/app/types/mapa";
import {
  OBJETIVO_COLOR,
  OBJETIVO_SHORT,
} from "@/lib/objetivo-ui";

/** Id de objetivo en BD (objetivos.id). */
export type { MapaObjetivoId };

/** @deprecated Usar OBJETIVO_COLOR en lib/objetivo-ui.ts */
export const MAPA_OBJETIVO_COLOR: Record<MapaObjetivoId, string> = OBJETIVO_COLOR;

/** @deprecated Usar OBJETIVO_SHORT en lib/objetivo-ui.ts */
export const MAPA_OBJETIVO_SHORT: Record<MapaObjetivoId, string> = OBJETIVO_SHORT;

/** Rango inclusivo de etapa → objetivo_id. Mantener sincronizado con seed SQL. */
const ETAPA_RANGES: { id: MapaObjetivoId; min: number; max: number }[] = [
  { id: 1, min: 0, max: 8 },
  { id: 2, min: 9, max: 9 },
  { id: 3, min: 10, max: 10 },
];

/** Objetivo visual de un nodo según su etapa. null si etapa fuera de roadmap. */
export function mapaObjetivoIdFromEtapa(etapa: number): MapaObjetivoId | null {
  const e = Math.trunc(etapa);
  for (const r of ETAPA_RANGES) {
    if (e >= r.min && e <= r.max) return r.id;
  }
  return null;
}

export function mapaObjetivoColor(id: MapaObjetivoId): string {
  return OBJETIVO_COLOR[id];
}

export function mapaObjetivoToneClass(id: MapaObjetivoId): string {
  return `mapa-flow-node--objetivo-${id}`;
}

export type MapaObjetivoFiltro = "todos" | MapaObjetivoId;

export function nodoCoincideFiltroObjetivo(
  etapa: number,
  filtro: MapaObjetivoFiltro,
): boolean {
  if (filtro === "todos") return true;
  return mapaObjetivoIdFromEtapa(etapa) === filtro;
}

export function enlaceCoincideFiltroObjetivo(
  origenEtapa: number,
  destinoEtapa: number,
  filtro: MapaObjetivoFiltro,
): boolean {
  if (filtro === "todos") return true;
  return (
    nodoCoincideFiltroObjetivo(origenEtapa, filtro) &&
    nodoCoincideFiltroObjetivo(destinoEtapa, filtro)
  );
}

/** Nombre legible desde catálogo BD o fallback por id. */
export function mapaObjetivoNombre(
  objetivos: MapaObjetivo[],
  id: MapaObjetivoId,
): string {
  return objetivos.find((o) => o.id === id)?.nombre ?? `Objetivo ${id}`;
}

/** Objetivos ordenados para UI (filtro + leyenda). */
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
