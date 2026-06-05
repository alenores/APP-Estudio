import type { Seguimiento } from "@/app/types/estudio";
import type { EstadoSeguimiento } from "@/lib/estado-ui";
import { normalizarEstado } from "@/lib/estado-ui";
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
  veredictoCalendario,
  type VeredictoUi,
} from "@/lib/tema-detalle-metrics";
import {
  sumaTiempoConsumidoTema,
  tiempoRestanteUltimoSeguimiento,
} from "@/lib/tema-detalle-tiempo";

export type EstudioDetalleMetrics = {
  avancePct: number;
  tiempoPct: number | null;
  delta: number | null;
  veredicto: VeredictoUi;
  gapLeft: string;
  gapWidth: string;
  showGap: boolean;
  showToday: boolean;
  todayPct: string;
  fillPct: string;
  gzOffset: number;
  nivel: number | null;
  nivelPalabra: string | null;
  tiempoInvertidoMin: number;
  tiempoRestanteMin: number | null;
  nota: string | null;
  estado: EstadoSeguimiento | null;
};

export function buildEstudioDetalleMetrics(input: {
  avancePct: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  seguimientos: Seguimiento[];
}): EstudioDetalleMetrics {
  const { avancePct, fechaInicio, fechaFin, seguimientos } = input;
  const tiempoPct = porcentajeTiempoTranscurrido(fechaInicio, fechaFin);
  const delta = calcularDeltaCalendario(avancePct, tiempoPct);
  const veredicto = veredictoCalendario(avancePct, tiempoPct);
  const gapWidth =
    tiempoPct != null ? anchoGapPorcentaje(avancePct, tiempoPct, delta) : 0;
  const showGap = debeMostrarGapAtraso(delta) && gapWidth > 0;
  const showToday = tiempoPct != null;

  const derivados = derivarDesdeSeguimientos(seguimientos);
  const nivel = parseNivelEntendimiento(derivados.nivel_entendimiento);
  const gzOffset = nivel != null ? 251.3 - (nivel / 10) * 251.3 : 251.3;

  return {
    avancePct,
    tiempoPct,
    delta,
    veredicto,
    gapLeft: `${avancePct}%`,
    gapWidth: `${gapWidth}%`,
    showGap,
    showToday,
    todayPct: tiempoPct != null ? `${tiempoPct}%` : "0%",
    fillPct: `${avancePct}%`,
    gzOffset,
    nivel,
    nivelPalabra: nivelEntendimientoPalabra(nivel),
    tiempoInvertidoMin: sumaTiempoConsumidoTema(seguimientos),
    tiempoRestanteMin: tiempoRestanteUltimoSeguimiento(seguimientos),
    nota: notaCalendarioCriollo(avancePct, tiempoPct, delta),
    estado: normalizarEstado(derivados.etiqueta_estado),
  };
}

export function contadoresPorEstado<T extends { derivados: { etiqueta_estado: string | null } }>(
  items: T[],
): Record<"todos" | EstadoSeguimiento, number> {
  const contadores: Record<"todos" | EstadoSeguimiento, number> = {
    todos: items.length,
    "sin empezar": 0,
    "en curso": 0,
    pausado: 0,
    terminado: 0,
  };
  for (const item of items) {
    const e = normalizarEstado(item.derivados.etiqueta_estado);
    if (e) contadores[e] += 1;
  }
  return contadores;
}
