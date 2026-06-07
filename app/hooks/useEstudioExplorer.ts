"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useNodosObjetivos } from "@/app/hooks/useNodosObjetivos";
import { useLogrosCatalog, useLogrosPorNodo } from "@/app/hooks/useLogros";
import type {
  ClaseConDerivados,
  CursoConDerivados,
  TemaConDerivados,
} from "@/app/types/estudio";
import type { MapaNodo } from "@/app/types/mapa";
import {
  getCursosPorNodoFromCache,
  getCursoDetalleFromCache,
  getTemaDetalleFromCache,
  listTemasConDerivadosFromCache,
} from "@/lib/estudio-offline-read";
import { clasesStatsMapPorCursos } from "@/lib/curso-clases-stats";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { logrosStatsMapPorNodos } from "@/lib/nodo-logros-stats";
import { cursosStatsMapPorNodos } from "@/lib/nodo-cursos-stats";
import { cursosStatsMapPorTemas } from "@/lib/tema-cursos-stats";
import { useMemo } from "react";

export type ExplorerRootMode = "temas" | "nodos";

export type ExplorerSelection = {
  rootMode: ExplorerRootMode;
  temaId: number | null;
  nodoId: number | null;
  cursoId: number | null;
  logroId: number | null;
  claseId: number | null;
};

function parseId(value: string | null): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseRootMode(params: URLSearchParams): ExplorerRootMode {
  const vista = params.get("vista");
  if (vista === "nodos" || vista === "objetivos") return "nodos";
  return "temas";
}

/** Resuelve tema/nodo/curso/clase desde query (?vista=&tema=&nodo=&curso=&clase=). */
export function parseExplorerSelection(
  params: URLSearchParams,
): ExplorerSelection {
  const rootMode = parseRootMode(params);
  const temaId = parseId(params.get("tema"));
  const nodoId =
    parseId(params.get("nodo")) ?? parseId(params.get("objetivo"));
  const cursoId = parseId(params.get("curso"));
  const logroId = parseId(params.get("logro"));
  const claseId = parseId(params.get("clase"));
  return { rootMode, temaId, nodoId, cursoId, logroId, claseId };
}

export function normalizeExplorerSelection(
  cache: NonNullable<ReturnType<typeof useEstudioData>["cacheData"]>,
  nodos: MapaNodo[],
  raw: ExplorerSelection,
): ExplorerSelection {
  let { rootMode, temaId, nodoId, cursoId, logroId, claseId } = raw;
  const nodoIds = new Set(nodos.map((n) => n.id));

  if (logroId != null) {
    cursoId = null;
    claseId = null;
  }

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
      } else if (rootMode === "nodos") {
        nodoId = curso.nodo_id;
        temaId = null;
      } else {
        temaId = curso.tema_id;
        nodoId = null;
      }
    }
  } else if (cursoId != null) {
    logroId = null;
    const curso = cache.cursos.find((c) => c.id === cursoId);
    if (!curso) {
      cursoId = null;
    } else if (rootMode === "nodos") {
      nodoId = curso.nodo_id;
      temaId = null;
    } else {
      temaId = curso.tema_id;
      nodoId = null;
    }
  }

  if (rootMode === "temas") {
    nodoId = null;
    if (temaId != null && !cache.temas.some((t) => t.id === temaId)) {
      temaId = null;
      cursoId = null;
      logroId = null;
      claseId = null;
    }
    if (cursoId != null && temaId != null) {
      const curso = cache.cursos.find((c) => c.id === cursoId);
      if (!curso || curso.tema_id !== temaId) cursoId = null;
    }
  } else {
    temaId = null;
    if (nodoId != null && !nodoIds.has(nodoId)) {
      nodoId = null;
      cursoId = null;
      logroId = null;
      claseId = null;
    }
    if (cursoId != null && nodoId != null) {
      const curso = cache.cursos.find((c) => c.id === cursoId);
      if (!curso || curso.nodo_id !== nodoId) cursoId = null;
    }
  }

  if (claseId != null && cursoId != null) {
    const clase = cache.clases.find((c) => c.id === claseId);
    if (!clase || clase.curso_id !== cursoId) claseId = null;
  }

  if (logroId != null) {
    cursoId = null;
    claseId = null;
    if (nodoId == null) logroId = null;
  }

  return { rootMode, temaId, nodoId, cursoId, logroId, claseId };
}

export function useEstudioExplorer(selection: ExplorerSelection) {
  const { cacheData, packReady, loadingPack, error } = useEstudioData();
  const {
    nodos,
    loading: loadingNodos,
    error: nodosError,
    reload: reloadNodos,
  } = useNodosObjetivos();

  const normalized = useMemo(
    () =>
      cacheData
        ? normalizeExplorerSelection(cacheData, nodos, selection)
        : {
            rootMode: "temas" as const,
            temaId: null,
            nodoId: null,
            cursoId: null,
            logroId: null,
            claseId: null,
          },
    [cacheData, nodos, selection],
  );

  const temas: TemaConDerivados[] = useMemo(
    () => (cacheData ? listTemasConDerivadosFromCache(cacheData) : []),
    [cacheData],
  );

  const selectedNodoRow =
    normalized.nodoId != null
      ? (nodos.find((n) => n.id === normalized.nodoId) ?? null)
      : null;

  const middleColumnShowsLogros =
    normalized.rootMode === "nodos" && selectedNodoRow?.tipo === "logro";

  const {
    logros,
    loading: loadingLogros,
    error: logrosError,
    reload: reloadLogros,
  } = useLogrosPorNodo(
    normalized.nodoId,
    middleColumnShowsLogros && normalized.nodoId != null,
  );

  const logroNodoIds = useMemo(
    () => nodos.filter((n) => n.tipo === "logro").map((n) => n.id),
    [nodos],
  );

  const { logros: logrosCatalog, reload: reloadLogrosCatalog } =
    useLogrosCatalog(logroNodoIds);

  const cursos: CursoConDerivados[] = useMemo(() => {
    if (!cacheData || middleColumnShowsLogros) return [];
    if (normalized.rootMode === "nodos") {
      if (normalized.nodoId == null) return [];
      return getCursosPorNodoFromCache(cacheData, normalized.nodoId);
    }
    if (normalized.temaId == null) return [];
    return getTemaDetalleFromCache(cacheData, normalized.temaId).cursos;
  }, [
    cacheData,
    middleColumnShowsLogros,
    normalized.rootMode,
    normalized.temaId,
    normalized.nodoId,
  ]);

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

  const cursosStatsPorNodo = useMemo((): Map<number, HijosProgressStats> => {
    if (!cacheData || nodos.length === 0) return new Map();
    const nodoIds = nodos.filter((n) => n.tipo === "nodo").map((n) => n.id);
    if (nodoIds.length === 0) return new Map();
    return cursosStatsMapPorNodos(cacheData, nodoIds);
  }, [cacheData, nodos]);

  const logrosStatsPorNodo = useMemo((): Map<number, HijosProgressStats> => {
    if (logroNodoIds.length === 0) return new Map();
    return logrosStatsMapPorNodos(logrosCatalog, logroNodoIds);
  }, [logrosCatalog, logroNodoIds]);

  const nodosById = useMemo(
    () => new Map(nodos.map((n) => [n.id, n])),
    [nodos],
  );

  const loading =
    loadingPack || (!packReady && !cacheData) || loadingNodos;

  const resolvedSelection = useMemo((): ExplorerSelection => {
    if (normalized.logroId == null) return normalized;
    if (!middleColumnShowsLogros) {
      return { ...normalized, logroId: null };
    }
    const valid = logros.some(
      (l) => l.id === normalized.logroId && l.nodo_id === normalized.nodoId,
    );
    if (valid) return normalized;
    return { ...normalized, logroId: null };
  }, [normalized, logros, middleColumnShowsLogros]);

  return {
    temas,
    nodos,
    nodosById,
    cursos,
    logros,
    middleColumnShowsLogros,
    clases,
    clasesStatsPorCurso,
    cursosStatsPorTema,
    cursosStatsPorNodo,
    logrosStatsPorNodo,
    selection: resolvedSelection,
    loading,
    loadingLogros,
    error: error ?? nodosError,
    logrosError,
    packReady,
    reloadNodos,
    reloadLogros,
    reloadLogrosCatalog,
  };
}

/** Query al seleccionar entidad en el explorador. */
export function explorerHref(
  partial: Partial<ExplorerSelection> & {
    rootMode?: ExplorerRootMode;
    temaId?: number | null;
    nodoId?: number | null;
    cursoId?: number | null;
    logroId?: number | null;
    claseId?: number | null;
  },
): string {
  const params = new URLSearchParams();
  if (partial.rootMode === "nodos") params.set("vista", "nodos");
  if (partial.temaId != null) params.set("tema", String(partial.temaId));
  if (partial.nodoId != null) params.set("nodo", String(partial.nodoId));
  if (partial.cursoId != null) params.set("curso", String(partial.cursoId));
  if (partial.logroId != null) params.set("logro", String(partial.logroId));
  if (partial.claseId != null) params.set("clase", String(partial.claseId));
  const q = params.toString();
  return q ? `/explorador?${q}` : "/explorador";
}
