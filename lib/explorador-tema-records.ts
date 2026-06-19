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

/** Filtros de la pantalla general de conceptos / seguimientos (explorador PC). */
export type RecordsScopeFilters = {
  temaId: number | null;
  cursoId: number | null;
  claseId: number | null;
  nivel: "todos" | "tema" | "curso" | "clase";
};

/** @deprecated Usar `RecordsScopeFilters`. */
export type TemaRecordsFilters = Omit<RecordsScopeFilters, "temaId">;

export const EMPTY_RECORDS_SCOPE_FILTERS: RecordsScopeFilters = {
  temaId: null,
  cursoId: null,
  claseId: null,
  nivel: "todos",
};

/** @deprecated Usar `EMPTY_RECORDS_SCOPE_FILTERS`. */
export const EMPTY_TEMA_RECORDS_FILTERS: TemaRecordsFilters = {
  nivel: "todos",
  cursoId: null,
  claseId: null,
};

export function mergeInitialRecordsFilters(
  initial?: Partial<RecordsScopeFilters>,
): RecordsScopeFilters {
  return { ...EMPTY_RECORDS_SCOPE_FILTERS, ...initial };
}

export function recordsFiltersFromExplorerSelection(input: {
  rootMode: "temas" | "nodos";
  temaId: number | null;
  cursoId: number | null;
  claseId: number | null;
}): Partial<RecordsScopeFilters> {
  if (input.rootMode !== "temas") return {};
  return {
    temaId: input.temaId,
    cursoId: input.cursoId,
    claseId: input.claseId,
  };
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

function recordMatchesScope(
  ctx: RecordEntityContext,
  filters: RecordsScopeFilters,
): boolean {
  if (filters.temaId != null && ctx.temaId !== filters.temaId) return false;
  if (filters.cursoId != null && ctx.cursoId !== filters.cursoId) return false;
  if (filters.claseId != null && ctx.claseId !== filters.claseId) return false;
  if (filters.nivel !== "todos" && ctx.nivel !== filters.nivel) return false;
  return true;
}

export function filterConceptosInScope(
  cache: EstudioOfflineCacheData,
  filters: RecordsScopeFilters,
): Concepto[] {
  return cache.conceptos
    .filter((c) => recordMatchesScope(resolveRecordContext(cache, c), filters))
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

export function filterSeguimientosInScope(
  cache: EstudioOfflineCacheData,
  filters: RecordsScopeFilters,
): Seguimiento[] {
  return cache.seguimientos
    .filter((s) => recordMatchesScope(resolveRecordContext(cache, s), filters))
    .sort((a, b) => (b.fecha_registro ?? "").localeCompare(a.fecha_registro ?? ""));
}

export function listConceptosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
): Concepto[] {
  return filterConceptosInScope(cache, {
    ...EMPTY_RECORDS_SCOPE_FILTERS,
    temaId,
  });
}

export function listSeguimientosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
): Seguimiento[] {
  return filterSeguimientosInScope(cache, {
    ...EMPTY_RECORDS_SCOPE_FILTERS,
    temaId,
  });
}

/** @deprecated Usar `filterConceptosInScope`. */
export function filterConceptosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
  filters: TemaRecordsFilters,
): Concepto[] {
  return filterConceptosInScope(cache, { ...filters, temaId });
}

/** @deprecated Usar `filterSeguimientosInScope`. */
export function filterSeguimientosInTemaScope(
  cache: EstudioOfflineCacheData,
  temaId: number,
  filters: TemaRecordsFilters,
): Seguimiento[] {
  return filterSeguimientosInScope(cache, { ...filters, temaId });
}
