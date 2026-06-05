"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import type {
  ClaseConDerivados,
  CursoConDerivados,
  TemaConDerivados,
} from "@/app/types/estudio";
import {
  getCursoDetalleFromCache,
  getTemaDetalleFromCache,
  listTemasConDerivadosFromCache,
} from "@/lib/estudio-offline-read";
import type { ClasesCursoStats } from "@/lib/curso-clases-stats";
import { clasesStatsMapPorCursos } from "@/lib/curso-clases-stats";
import { useMemo } from "react";

export type ExplorerSelection = {
  temaId: number | null;
  cursoId: number | null;
  claseId: number | null;
};

function parseId(value: string | null): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Resuelve tema/curso/clase desde query (?tema=&curso=&clase=). */
export function parseExplorerSelection(
  params: URLSearchParams,
): ExplorerSelection {
  let temaId = parseId(params.get("tema"));
  let cursoId = parseId(params.get("curso"));
  let claseId = parseId(params.get("clase"));
  return { temaId, cursoId, claseId };
}

export function normalizeExplorerSelection(
  cache: NonNullable<ReturnType<typeof useEstudioData>["cacheData"]>,
  raw: ExplorerSelection,
): ExplorerSelection {
  let { temaId, cursoId, claseId } = raw;

  if (claseId != null) {
    const clase = cache.clases.find((c) => c.id === claseId);
    if (!clase) {
      claseId = null;
    } else {
      cursoId = clase.curso_id;
      const curso = cache.cursos.find((c) => c.id === cursoId);
      temaId = curso?.tema_id ?? temaId;
    }
  } else if (cursoId != null) {
    const curso = cache.cursos.find((c) => c.id === cursoId);
    if (!curso) {
      cursoId = null;
    } else {
      temaId = curso.tema_id;
    }
  }

  if (temaId != null && !cache.temas.some((t) => t.id === temaId)) {
    temaId = null;
    cursoId = null;
    claseId = null;
  }

  if (cursoId != null && temaId != null) {
    const curso = cache.cursos.find((c) => c.id === cursoId);
    if (!curso || curso.tema_id !== temaId) cursoId = null;
  }

  if (claseId != null && cursoId != null) {
    const clase = cache.clases.find((c) => c.id === claseId);
    if (!clase || clase.curso_id !== cursoId) claseId = null;
  }

  return { temaId, cursoId, claseId };
}

export function useEstudioExplorer(selection: ExplorerSelection) {
  const { cacheData, packReady, loadingPack, error } = useEstudioData();

  const normalized = useMemo(
    () =>
      cacheData
        ? normalizeExplorerSelection(cacheData, selection)
        : { temaId: null, cursoId: null, claseId: null },
    [cacheData, selection],
  );

  const temas: TemaConDerivados[] = useMemo(
    () => (cacheData ? listTemasConDerivadosFromCache(cacheData) : []),
    [cacheData],
  );

  const cursos: CursoConDerivados[] = useMemo(() => {
    if (!cacheData || normalized.temaId == null) return [];
    return getTemaDetalleFromCache(cacheData, normalized.temaId).cursos;
  }, [cacheData, normalized.temaId]);

  const clases: ClaseConDerivados[] = useMemo(() => {
    if (!cacheData || normalized.cursoId == null) return [];
    return getCursoDetalleFromCache(cacheData, normalized.cursoId).clases;
  }, [cacheData, normalized.cursoId]);

  const clasesStatsPorCurso = useMemo((): Map<number, ClasesCursoStats> => {
    if (!cacheData || cursos.length === 0) return new Map();
    return clasesStatsMapPorCursos(
      cacheData,
      cursos.map((c) => c.id),
    );
  }, [cacheData, cursos]);

  const loading = loadingPack || (!packReady && !cacheData);

  return {
    temas,
    cursos,
    clases,
    clasesStatsPorCurso,
    selection: normalized,
    loading,
    error,
    packReady,
  };
}

/** Query al seleccionar entidad en el explorador. */
export function explorerHref(partial: {
  temaId?: number | null;
  cursoId?: number | null;
  claseId?: number | null;
}): string {
  const params = new URLSearchParams();
  if (partial.temaId != null) params.set("tema", String(partial.temaId));
  if (partial.cursoId != null) params.set("curso", String(partial.cursoId));
  if (partial.claseId != null) params.set("clase", String(partial.claseId));
  const q = params.toString();
  return q ? `/explorador?${q}` : "/explorador";
}
