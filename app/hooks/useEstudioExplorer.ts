"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useObjetivosCatalog } from "@/app/hooks/useObjetivosCatalog";
import type {
  ClaseConDerivados,
  CursoConDerivados,
  TemaConDerivados,
} from "@/app/types/estudio";
import {
  getCursosPorObjetivoFromCache,
  getCursoDetalleFromCache,
  getTemaDetalleFromCache,
  listTemasConDerivadosFromCache,
} from "@/lib/estudio-offline-read";
import { clasesStatsMapPorCursos } from "@/lib/curso-clases-stats";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { cursosStatsMapPorObjetivos } from "@/lib/objetivo-cursos-stats";
import { cursosStatsMapPorTemas } from "@/lib/tema-cursos-stats";
import { parseObjetivoId } from "@/lib/objetivo-ui";
import { useMemo } from "react";

export type ExplorerRootMode = "temas" | "objetivos";

export type ExplorerSelection = {
  rootMode: ExplorerRootMode;
  temaId: number | null;
  objetivoId: number | null;
  cursoId: number | null;
  claseId: number | null;
};

function parseId(value: string | null): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseRootMode(params: URLSearchParams): ExplorerRootMode {
  return params.get("vista") === "objetivos" ? "objetivos" : "temas";
}

/** Resuelve tema/objetivo/curso/clase desde query (?vista=&tema=&objetivo=&curso=&clase=). */
export function parseExplorerSelection(
  params: URLSearchParams,
): ExplorerSelection {
  const rootMode = parseRootMode(params);
  const temaId = parseId(params.get("tema"));
  const objetivoId = parseId(params.get("objetivo"));
  const cursoId = parseId(params.get("curso"));
  const claseId = parseId(params.get("clase"));
  return { rootMode, temaId, objetivoId, cursoId, claseId };
}

export function normalizeExplorerSelection(
  cache: NonNullable<ReturnType<typeof useEstudioData>["cacheData"]>,
  raw: ExplorerSelection,
): ExplorerSelection {
  let { rootMode, temaId, objetivoId, cursoId, claseId } = raw;

  if (claseId != null) {
    const clase = cache.clases.find((c) => c.id === claseId);
    if (!clase) {
      claseId = null;
    } else {
      cursoId = clase.curso_id;
      const curso = cache.cursos.find((c) => c.id === cursoId);
      if (!curso) {
        claseId = null;
        cursoId = null;
      } else if (rootMode === "objetivos") {
        objetivoId = parseObjetivoId(curso.objetivo_id) ?? objetivoId;
        temaId = null;
      } else {
        temaId = curso.tema_id;
        objetivoId = null;
      }
    }
  } else if (cursoId != null) {
    const curso = cache.cursos.find((c) => c.id === cursoId);
    if (!curso) {
      cursoId = null;
    } else if (rootMode === "objetivos") {
      objetivoId = parseObjetivoId(curso.objetivo_id) ?? objetivoId;
      temaId = null;
    } else {
      temaId = curso.tema_id;
      objetivoId = null;
    }
  }

  if (rootMode === "temas") {
    objetivoId = null;
    if (temaId != null && !cache.temas.some((t) => t.id === temaId)) {
      temaId = null;
      cursoId = null;
      claseId = null;
    }
    if (cursoId != null && temaId != null) {
      const curso = cache.cursos.find((c) => c.id === cursoId);
      if (!curso || curso.tema_id !== temaId) cursoId = null;
    }
  } else {
    temaId = null;
    if (objetivoId != null && parseObjetivoId(objetivoId) == null) {
      objetivoId = null;
      cursoId = null;
      claseId = null;
    }
    if (cursoId != null && objetivoId != null) {
      const curso = cache.cursos.find((c) => c.id === cursoId);
      const oid = parseObjetivoId(curso?.objetivo_id ?? null);
      if (!curso || oid !== parseObjetivoId(objetivoId)) cursoId = null;
    }
  }

  if (claseId != null && cursoId != null) {
    const clase = cache.clases.find((c) => c.id === claseId);
    if (!clase || clase.curso_id !== cursoId) claseId = null;
  }

  return { rootMode, temaId, objetivoId, cursoId, claseId };
}

export function useEstudioExplorer(selection: ExplorerSelection) {
  const { cacheData, packReady, loadingPack, error } = useEstudioData();
  const {
    objetivos,
    loading: loadingObjetivos,
    error: objetivosError,
  } = useObjetivosCatalog();

  const normalized = useMemo(
    () =>
      cacheData
        ? normalizeExplorerSelection(cacheData, selection)
        : {
            rootMode: "temas" as const,
            temaId: null,
            objetivoId: null,
            cursoId: null,
            claseId: null,
          },
    [cacheData, selection],
  );

  const temas: TemaConDerivados[] = useMemo(
    () => (cacheData ? listTemasConDerivadosFromCache(cacheData) : []),
    [cacheData],
  );

  const cursos: CursoConDerivados[] = useMemo(() => {
    if (!cacheData) return [];
    if (normalized.rootMode === "objetivos") {
      if (normalized.objetivoId == null) return [];
      return getCursosPorObjetivoFromCache(cacheData, normalized.objetivoId);
    }
    if (normalized.temaId == null) return [];
    return getTemaDetalleFromCache(cacheData, normalized.temaId).cursos;
  }, [cacheData, normalized.rootMode, normalized.temaId, normalized.objetivoId]);

  const clases: ClaseConDerivados[] = useMemo(() => {
    if (!cacheData || normalized.cursoId == null) return [];
    return getCursoDetalleFromCache(cacheData, normalized.cursoId).clases;
  }, [cacheData, normalized.cursoId]);

  const clasesStatsPorCurso = useMemo((): Map<number, HijosProgressStats> => {
    if (!cacheData || cursos.length === 0) return new Map();
    return clasesStatsMapPorCursos(
      cacheData,
      cursos.map((c) => c.id),
    );
  }, [cacheData, cursos]);

  const cursosStatsPorTema = useMemo((): Map<number, HijosProgressStats> => {
    if (!cacheData || temas.length === 0) return new Map();
    return cursosStatsMapPorTemas(
      cacheData,
      temas.map((t) => t.id),
    );
  }, [cacheData, temas]);

  const cursosStatsPorObjetivo = useMemo((): Map<number, HijosProgressStats> => {
    if (!cacheData || objetivos.length === 0) return new Map();
    return cursosStatsMapPorObjetivos(
      cacheData,
      objetivos.map((o) => o.id),
    );
  }, [cacheData, objetivos]);

  const loading =
    loadingPack || (!packReady && !cacheData) || loadingObjetivos;

  return {
    temas,
    objetivos,
    cursos,
    clases,
    clasesStatsPorCurso,
    cursosStatsPorTema,
    cursosStatsPorObjetivo,
    selection: normalized,
    loading,
    error: error ?? objetivosError,
    packReady,
  };
}

/** Query al seleccionar entidad en el explorador. */
export function explorerHref(
  partial: Partial<ExplorerSelection> & {
    rootMode?: ExplorerRootMode;
    temaId?: number | null;
    objetivoId?: number | null;
    cursoId?: number | null;
    claseId?: number | null;
  },
): string {
  const params = new URLSearchParams();
  if (partial.rootMode === "objetivos") params.set("vista", "objetivos");
  if (partial.temaId != null) params.set("tema", String(partial.temaId));
  if (partial.objetivoId != null) {
    params.set("objetivo", String(partial.objetivoId));
  }
  if (partial.cursoId != null) params.set("curso", String(partial.cursoId));
  if (partial.claseId != null) params.set("clase", String(partial.claseId));
  const q = params.toString();
  return q ? `/explorador?${q}` : "/explorador";
}
