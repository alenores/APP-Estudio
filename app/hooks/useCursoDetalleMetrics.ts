"use client";

import { useCursoDetalle } from "@/app/hooks/useCursoDetalle";
import {
  buildEstudioDetalleMetrics,
  contadoresPorEstado,
} from "@/lib/estudio-detalle-metrics";
import { useMemo } from "react";

export function useCursoDetalleMetrics(cursoId: number | null) {
  const detalle = useCursoDetalle(cursoId);

  const metrics = useMemo(() => {
    const { curso, clases, seguimientos } = detalle;
    if (!curso) return null;

    const avancePct = curso.derivados.porcentaje_avance ?? 0;
    const base = buildEstudioDetalleMetrics({
      avancePct,
      fechaInicio: curso.fecha_estimada_inicio,
      fechaFin: curso.fecha_estimada_fin,
      seguimientos,
    });

    return {
      ...base,
      contadores: contadoresPorEstado(clases),
      avanceCurso: base.avancePct,
      estadoCurso: base.estado,
    };
  }, [detalle]);

  return { ...detalle, metrics };
}

export type CursoDetalleMetrics = NonNullable<
  ReturnType<typeof useCursoDetalleMetrics>["metrics"]
>;
