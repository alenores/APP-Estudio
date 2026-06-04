"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { getTemaDetalleFromCache } from "@/lib/estudio-offline-read";
import type {
  Concepto,
  CursoConDerivados,
  Seguimiento,
  TemaConDerivados,
} from "@/app/types/estudio";
import { useCallback, useMemo } from "react";

export function useTemaDetalle(temaId: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useEstudioData();

  const reload = useCallback(
    async (_opts?: { silent?: boolean }) => {
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const detalle = useMemo(() => {
    if (temaId == null || !cacheData) {
      return {
        tema: null as TemaConDerivados | null,
        cursos: [] as CursoConDerivados[],
        seguimientos: [] as Seguimiento[],
        conceptos: [] as Concepto[],
        notFound: false,
      };
    }
    const row = getTemaDetalleFromCache(cacheData, temaId);
    return { ...row, notFound: !row.tema };
  }, [cacheData, temaId]);

  const loading = loadingPack && !cacheData;

  const localError =
    temaId == null
      ? "Identificador de tema inválido"
      : !loading && !cacheData
        ? "Descargá los datos con el botón Actualizar."
        : cacheData && detalle.notFound
          ? "Tema no encontrado"
          : null;

  return {
    tema: detalle.tema,
    cursos: detalle.cursos,
    seguimientos: detalle.seguimientos,
    conceptos: detalle.conceptos,
    loading,
    error: error ?? localError,
    reload,
  };
}
