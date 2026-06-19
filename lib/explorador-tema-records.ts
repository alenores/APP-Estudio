import type { Concepto, Seguimiento } from "@/app/types/estudio";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";

export type TemaScopeIds = {
  temaId: number;
  cursoIds: Set<number>;
  claseIds: Set<number>;
};

export type RecordEntityContext = {
  temaId: number | null;
  temaNombre: string | null;
  cursoId: number | null;
  cursoNombre: string | null;
  claseId: number | null;
  claseNombre: string | null;
  /** FK activa: tema directo, curso o clase. */
  nivel: "tema" | "curso" | "clase";
};

export type TemaRecordsFilters = {
  nivel: "todos" | "tema" | "curso" | "clase";
  cursoId: number | null;
  claseId: number | null;
};

export const EMPTY_TEMA_RECORDS_FILTERS: TemaRecordsFilters = {
  nivel: "todos",
  cursoId: null,
  claseId: null,
};

export function temaScopeIds(
  cache: EstudioOfflineCacheData,
  temaId: number,
): TemaScopeIds {
  const cursoIds = new Set(
    cache.cursos.filter((c) => c.tema_id === temaId).map((c) => c.id),
  );
  const claseIds = new Set(
    cache.clases.filter((cl) => cursoIds.has(cl.curso_id)).map((cl) => cl.id),
  );
  return { temaId, cursoIds, claseIds };
}

function inTemaScope(
  scope: TemaScopeIds,
  row: { tema_id: number | null; curso_id: number | null; clase_id: number | null },
): boolean {
  if (row.tema_id === scope.temaId) return true;
  if (row.curso_id != null && scope.cursoIds.has(row.curso_id)) return true;
  if (row.clase_id != null && scope.claseIds.has(row.clase_id)) return true;
  return false;
}

export function listConceptosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
): Concepto[] {
  const scope = temaScopeIds(cache, temaId);
  return cache.conceptos
    .filter((c) => inTemaScope(scope, c))
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

export function listSeguimientosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
): Seguimiento[] {
  const scope = temaScopeIds(cache, temaId);
  return cache.seguimientos
    .filter((s) => inTemaScope(scope, s))
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

function resolveNivel(row: {
  tema_id: number | null;
  curso_id: number | null;
  clase_id: number | null;
}): RecordEntityContext["nivel"] {
  if (row.clase_id != null) return "clase";
  if (row.curso_id != null) return "curso";
  return "tema";
}

export function resolveRecordContext(
  cache: EstudioOfflineCacheData,
  row: {
    tema_id: number | null;
    curso_id: number | null;
    clase_id: number | null;
  },
): RecordEntityContext {
  const nivel = resolveNivel(row);
  let temaId = row.tema_id;
  let cursoId = row.curso_id;
  let claseId = row.clase_id;

  const clase =
    claseId != null ? (cache.clases.find((c) => c.id === claseId) ?? null) : null;
  if (clase != null) {
    cursoId = clase.curso_id;
  }

  const curso =
    cursoId != null ? (cache.cursos.find((c) => c.id === cursoId) ?? null) : null;
  if (curso != null) {
    temaId = curso.tema_id;
  }

  const tema =
    temaId != null ? (cache.temas.find((t) => t.id === temaId) ?? null) : null;

  return {
    temaId,
    temaNombre: tema?.nombre ?? null,
    cursoId,
    cursoNombre: curso?.nombre ?? null,
    claseId,
    claseNombre: clase?.nombre ?? null,
    nivel,
  };
}

function matchesFilters(
  ctx: RecordEntityContext,
  filters: TemaRecordsFilters,
): boolean {
  if (filters.nivel !== "todos" && ctx.nivel !== filters.nivel) return false;
  if (filters.cursoId != null && ctx.cursoId !== filters.cursoId) return false;
  if (filters.claseId != null && ctx.claseId !== filters.claseId) return false;
  return true;
}

export function filterConceptosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
  filters: TemaRecordsFilters,
): Concepto[] {
  return listConceptosInTemaScope(cache, temaId).filter((c) =>
    matchesFilters(resolveRecordContext(cache, c), filters),
  );
}

export function filterSeguimientosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
  filters: TemaRecordsFilters,
): Seguimiento[] {
  return listSeguimientosInTemaScope(cache, temaId).filter((s) =>
    matchesFilters(resolveRecordContext(cache, s), filters),
  );
}
