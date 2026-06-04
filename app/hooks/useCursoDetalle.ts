"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { getCursoDetalleFromCache } from "@/lib/estudio-offline-read";
import type {
  ClaseConDerivados,
  Concepto,
  CursoConDerivados,
  Seguimiento,
} from "@/app/types/estudio";
import { useCallback, useMemo } from "react";

export function useCursoDetalle(cursoId: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useEstudioData();

  const reload = useCallback(
    async (_opts?: { silent?: boolean }) => {
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const detalle = useMemo(() => {
    if (cursoId == null || !cacheData) {
      return {
        curso: null as CursoConDerivados | null,
        clases: [] as ClaseConDerivados[],
        seguimientos: [] as Seguimiento[],
        conceptos: [] as Concepto[],
        notFound: false,
      };
    }
    const row = getCursoDetalleFromCache(cacheData, cursoId);
    return { ...row, notFound: !row.curso };
  }, [cacheData, cursoId]);

  const loading = loadingPack && !cacheData;

  const localError =
    cursoId == null
      ? "Identificador de curso inválido"
      : !loading && !cacheData
        ? "Descargá los datos con el botón Actualizar."
        : cacheData && detalle.notFound
          ? "Curso no encontrado"
          : null;

  return {
    curso: detalle.curso,
    clases: detalle.clases,
    seguimientos: detalle.seguimientos,
    conceptos: detalle.conceptos,
    loading,
    error: error ?? localError,
    reload,
  };
}
