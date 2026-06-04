"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { getClaseDetalleFromCache } from "@/lib/estudio-offline-read";
import type { ClaseConDerivados, Concepto, Seguimiento } from "@/app/types/estudio";
import { useCallback, useMemo } from "react";

export function useClaseDetalle(claseId: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useEstudioData();

  const reload = useCallback(
    async (_opts?: { silent?: boolean }) => {
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const detalle = useMemo(() => {
    if (claseId == null || !cacheData) {
      return {
        clase: null as ClaseConDerivados | null,
        seguimientos: [] as Seguimiento[],
        conceptos: [] as Concepto[],
        notFound: false,
      };
    }
    const row = getClaseDetalleFromCache(cacheData, claseId);
    return { ...row, notFound: !row.clase };
  }, [cacheData, claseId]);

  const loading = loadingPack && !cacheData;

  const localError =
    claseId == null
      ? "Identificador de clase inválido"
      : !loading && !cacheData
        ? "Descargá los datos con el botón Actualizar."
        : cacheData && detalle.notFound
          ? "Clase no encontrada"
          : null;

  return {
    clase: detalle.clase,
    seguimientos: detalle.seguimientos,
    conceptos: detalle.conceptos,
    loading,
    error: error ?? localError,
    reload,
  };
}
