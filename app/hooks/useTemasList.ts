"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { listTemasConDerivadosFromCache } from "@/lib/estudio-offline-read";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { cursosStatsMapPorTemas } from "@/lib/tema-cursos-stats";
import type { TemaConDerivados } from "@/app/types/estudio";
import { useMemo } from "react";

export function useTemasList() {
  const { cacheData, loadingPack, error, setError, refreshSnapshot } = useEstudioData();

  const temas: TemaConDerivados[] = useMemo(() => {
    if (!cacheData) return [];
    return listTemasConDerivadosFromCache(cacheData);
  }, [cacheData]);

  const cursosStatsPorTema = useMemo((): Map<number, HijosProgressStats> => {
    if (!cacheData || temas.length === 0) return new Map();
    return cursosStatsMapPorTemas(
      cacheData,
      temas.map((t) => t.id),
    );
  }, [cacheData, temas]);

  const reload = refreshSnapshot;

  return {
    temas,
    cursosStatsPorTema,
    loading: loadingPack,
    error,
    setError,
    reload,
  };
}
