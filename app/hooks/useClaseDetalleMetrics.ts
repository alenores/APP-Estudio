"use client";

import { useClaseDetalle } from "@/app/hooks/useClaseDetalle";
import { buildEstudioDetalleMetrics } from "@/lib/estudio-detalle-metrics";
import { useMemo } from "react";

export function useClaseDetalleMetrics(claseId: number | null) {
  const detalle = useClaseDetalle(claseId);

  const metrics = useMemo(() => {
    const { clase, seguimientos } = detalle;
    if (!clase) return null;

    const avancePct = clase.derivados.porcentaje_avance ?? 0;
    const base = buildEstudioDetalleMetrics({
      avancePct,
      fechaInicio: null,
      fechaFin: null,
      seguimientos,
    });

    return {
      ...base,
      avanceClase: base.avancePct,
      estadoClase: base.estado,
    };
  }, [detalle]);

  return { ...detalle, metrics };
}

export type ClaseDetalleMetrics = NonNullable<
  ReturnType<typeof useClaseDetalleMetrics>["metrics"]
>;
