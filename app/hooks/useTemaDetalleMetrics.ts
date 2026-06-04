"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import type { EstadoSeguimiento } from "@/lib/estado-ui";
import { ESTADOS_SEGUIMIENTO, normalizarEstado } from "@/lib/estado-ui";
import { clasesStatsMapPorCursos } from "@/lib/curso-clases-stats";
import {
  parseNivelEntendimiento,
  nivelEntendimientoPalabra,
} from "@/lib/nivel-entendimiento-ui";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import {
  anchoGapPorcentaje,
  calcularDeltaCalendario,
  debeMostrarGapAtraso,
  notaCalendarioCriollo,
  porcentajeTiempoTranscurrido,
  promedioAvanceTema,
  veredictoCalendario,
} from "@/lib/tema-detalle-metrics";
import {
  sumaTiempoConsumidoTema,
  tiempoRestanteUltimoSeguimiento,
} from "@/lib/tema-detalle-tiempo";
import { useMemo } from "react";

export type FiltroCursoEstado = "todos" | EstadoSeguimiento;

export type TemaDetalleMetrics = NonNullable<
  ReturnType<typeof useTemaDetalleMetrics>["metrics"]
>;

export function useTemaDetalleMetrics(temaId: number | null) {
  const detalle = useTemaDetalle(temaId);
  const { cacheData } = useEstudioData();

  const metrics = useMemo(() => {
    const { tema, cursos, seguimientos } = detalle;
    if (!tema) return null;

    const avanceTema = promedioAvanceTema(cursos);
    const tiempoPct = porcentajeTiempoTranscurrido(
      tema.fecha_estimada_inicio,
      tema.fecha_estimada_fin,
    );
    const delta = calcularDeltaCalendario(avanceTema, tiempoPct);
    const veredicto = veredictoCalendario(avanceTema, tiempoPct);
    const gapWidth = tiempoPct != null
      ? anchoGapPorcentaje(avanceTema, tiempoPct, delta)
      : 0;
    const showGap = debeMostrarGapAtraso(delta) && gapWidth > 0;
    const showToday = tiempoPct != null;

    const temaDerivados = derivarDesdeSeguimientos(seguimientos);
    const nivel = parseNivelEntendimiento(temaDerivados.nivel_entendimiento);
    const gzOffset =
      nivel != null ? 251.3 - (nivel / 10) * 251.3 : 251.3;

    const contadores: Record<FiltroCursoEstado, number> = {
      todos: cursos.length,
      "sin empezar": 0,
      "en curso": 0,
      pausado: 0,
      terminado: 0,
    };
    for (const c of cursos) {
      const e = normalizarEstado(c.derivados.etiqueta_estado);
      if (e) contadores[e] += 1;
    }

    const clasesStats =
      cacheData && cursos.length > 0
        ? clasesStatsMapPorCursos(
            cacheData,
            cursos.map((c) => c.id),
          )
        : new Map();

    return {
      avanceTema,
      tiempoPct,
      delta,
      veredicto,
      gapLeft: `${avanceTema}%`,
      gapWidth: `${gapWidth}%`,
      showGap,
      showToday,
      todayPct: tiempoPct != null ? `${tiempoPct}%` : "0%",
      fillPct: `${avanceTema}%`,
      gzOffset,
      nivel,
      nivelPalabra: nivelEntendimientoPalabra(nivel),
      tiempoInvertidoMin: sumaTiempoConsumidoTema(seguimientos),
      tiempoRestanteMin: tiempoRestanteUltimoSeguimiento(seguimientos),
      nota: notaCalendarioCriollo(avanceTema, tiempoPct, delta),
      contadores,
      clasesStats,
      estadoTema: normalizarEstado(temaDerivados.etiqueta_estado),
    };
  }, [detalle, cacheData]);

  return { ...detalle, metrics };
}

export { ESTADOS_SEGUIMIENTO };
