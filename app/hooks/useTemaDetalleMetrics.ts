"use client";

import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import type { EstadoSeguimiento } from "@/lib/estado-ui";
import { ESTADOS_SEGUIMIENTO } from "@/lib/estado-ui";
import { clasesStatsMapPorCursos } from "@/lib/curso-clases-stats";
import {
  buildEstudioDetalleMetrics,
  contadoresPorEstado,
} from "@/lib/estudio-detalle-metrics";
import { promedioAvanceTema } from "@/lib/tema-detalle-metrics";
import { useMemo } from "react";

export type FiltroHijoEstado = "todos" | EstadoSeguimiento;

export function useTemaDetalleMetrics(temaId: number | null) {
  const detalle = useTemaDetalle(temaId);
  const { cacheData } = useEstudioData();

  const metrics = useMemo(() => {
    const { tema, cursos, seguimientos } = detalle;
    if (!tema) return null;

    const base = buildEstudioDetalleMetrics({
      avancePct: promedioAvanceTema(cursos),
      fechaInicio: tema.fecha_estimada_inicio,
      fechaFin: tema.fecha_estimada_fin,
      seguimientos,
    });

    const clasesStats =
      cacheData && cursos.length > 0
        ? clasesStatsMapPorCursos(
            cacheData,
            cursos.map((c) => c.id),
          )
        : new Map();

    return {
      ...base,
      contadores: contadoresPorEstado(cursos),
      clasesStats,
      estadoTema: base.estado,
      avanceTema: base.avancePct,
    };
  }, [detalle, cacheData]);

  return { ...detalle, metrics };
}

export { ESTADOS_SEGUIMIENTO };

export type TemaDetalleMetrics = NonNullable<
  ReturnType<typeof useTemaDetalleMetrics>["metrics"]
>;

/** @deprecated Usar FiltroHijoEstado */
export type FiltroCursoEstado = FiltroHijoEstado;
