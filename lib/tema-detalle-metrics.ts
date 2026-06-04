import type { CursoConDerivados } from "@/app/types/estudio";

const VEREDICTO_DELTA_ADELANTADO = 5;
const VEREDICTO_DELTA_ATENCION = -5;
const VEREDICTO_DELTA_ATRASADO = -15;

export type VeredictoCalendario =
  | "sin_fechas"
  | "adelantado"
  | "al_dia"
  | "atencion"
  | "atrasado";

export type VeredictoUi = {
  key: VeredictoCalendario;
  label: string;
  chipClass: string;
  gapClass: string;
};

/** % del tema = promedio del % de cada curso hijo (no manual en seguimiento de tema). */
export function promedioAvanceTema(cursos: CursoConDerivados[]): number {
  if (cursos.length === 0) return 0;
  const sum = cursos.reduce(
    (acc, c) => acc + (c.derivados.porcentaje_avance ?? 0),
    0,
  );
  return Math.round(sum / cursos.length);
}

/** % de tiempo transcurrido entre fechas estimadas del tema, acotado 0–100. */
export function porcentajeTiempoTranscurrido(
  fechaInicio: string | null,
  fechaFin: string | null,
  hoy: Date = new Date(),
): number | null {
  if (!fechaInicio?.trim() || !fechaFin?.trim()) return null;
  const t0 = Date.parse(fechaInicio);
  const t1 = Date.parse(fechaFin);
  if (Number.isNaN(t0) || Number.isNaN(t1) || t1 <= t0) return null;
  const th = hoy.getTime();
  if (th <= t0) return 0;
  if (th >= t1) return 100;
  return Math.round(((th - t0) / (t1 - t0)) * 100);
}

export function calcularDeltaCalendario(
  avanceTema: number,
  tiempoPct: number | null,
): number | null {
  if (tiempoPct == null) return null;
  return avanceTema - tiempoPct;
}

export function veredictoCalendario(
  avanceTema: number,
  tiempoPct: number | null,
): VeredictoUi {
  if (tiempoPct == null) {
    return {
      key: "sin_fechas",
      label: "Sin fechas",
      chipClass: "td-verdict td-verdict-neutro",
      gapClass: "",
    };
  }
  const delta = avanceTema - tiempoPct;
  if (delta >= VEREDICTO_DELTA_ADELANTADO) {
    return {
      key: "adelantado",
      label: "Adelantado",
      chipClass: "td-verdict td-verdict-ok",
      gapClass: "td-tl-gap td-tl-gap-ok",
    };
  }
  if (delta >= VEREDICTO_DELTA_ATENCION) {
    return {
      key: "al_dia",
      label: "Al día",
      chipClass: "td-verdict td-verdict-ok",
      gapClass: "td-tl-gap td-tl-gap-ok",
    };
  }
  if (delta >= VEREDICTO_DELTA_ATRASADO) {
    return {
      key: "atencion",
      label: "Atención",
      chipClass: "td-verdict td-verdict-warn",
      gapClass: "td-tl-gap td-tl-gap-warn",
    };
  }
  return {
    key: "atrasado",
    label: "Atrasado",
    chipClass: "td-verdict td-verdict-late",
    gapClass: "td-tl-gap td-tl-gap-late",
  };
}

/** Zona rayada solo si vas atrasado (avance < tiempo). */
export function debeMostrarGapAtraso(delta: number | null): boolean {
  return delta != null && delta < 0;
}

export function anchoGapPorcentaje(
  avancePct: number,
  tiempoPct: number,
  delta: number | null,
): number {
  if (!debeMostrarGapAtraso(delta)) return 0;
  return Math.max(0, Math.min(100 - avancePct, tiempoPct - avancePct));
}

export function notaCalendarioCriollo(
  avancePct: number,
  tiempoPct: number | null,
  delta: number | null,
): string | null {
  if (tiempoPct == null || delta == null) return null;
  if (delta >= VEREDICTO_DELTA_ATENCION) {
    return "Vas al ritmo del calendario o por delante.";
  }
  const puntos = Math.abs(Math.round(delta));
  return `Llevás ${puntos} puntos por detrás del calendario: ya pasó el ${tiempoPct}% del tiempo y vas por el ${avancePct}% del temario.`;
}
