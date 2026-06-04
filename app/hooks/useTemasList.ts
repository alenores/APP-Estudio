"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { listTemasConDerivadosFromCache } from "@/lib/estudio-offline-read";
import type { TemaConDerivados } from "@/app/types/estudio";
import { useMemo } from "react";

export function useTemasList() {
  const { cacheData, loadingPack, error, setError, refreshSnapshot } = useEstudioData();

  const temas: TemaConDerivados[] = useMemo(() => {
    if (!cacheData) return [];
    return listTemasConDerivadosFromCache(cacheData);
  }, [cacheData]);

  const reload = refreshSnapshot;

  return {
    temas,
    loading: loadingPack,
    error,
    setError,
    reload,
  };
}
