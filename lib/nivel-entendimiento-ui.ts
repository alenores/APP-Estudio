import { NIVEL_MAX, NIVEL_MIN } from "@/lib/estado-ui";

/** Palabra descriptiva del velocímetro 1–10 (detalle tema). */
export function nivelEntendimientoPalabra(nivel: number | null): string | null {
  if (nivel == null || nivel < NIVEL_MIN || nivel > NIVEL_MAX) return null;
  if (nivel <= 2) return "Muy bajo";
  if (nivel <= 4) return "Bajo";
  if (nivel <= 6) return "Medio";
  if (nivel <= 8) return "Bueno";
  return "Excelente";
}

export function parseNivelEntendimiento(valor: string | null): number | null {
  if (!valor?.trim()) return null;
  const n = Number(valor);
  if (Number.isInteger(n) && n >= NIVEL_MIN && n <= NIVEL_MAX) return n;
  return null;
}

/** Color del valor según zona (bajo=rojo, medio=ámbar, alto=verde). */
export function nivelEntendimientoColor(nivel: number | null): string {
  if (nivel == null) return "var(--td-faint)";
  if (nivel <= 3) return "var(--td-risk-low)";
  if (nivel <= 6) return "var(--td-risk-mid)";
  return "var(--td-risk-high)";
}

/** Porciones de torta tiempo: invertido + restante = 100 %. */
export function porcionesTiempoPie(
  invertidoMin: number | null | undefined,
  restanteMin: number | null | undefined,
): {
  invertido: number;
  restante: number;
  total: number;
  pctInvertido: number;
  pctRestante: number;
} {
  const invertido = Math.max(0, invertidoMin ?? 0);
  const restante = Math.max(0, restanteMin ?? 0);
  const total = invertido + restante;
  if (total === 0) {
    return { invertido: 0, restante: 0, total: 0, pctInvertido: 0, pctRestante: 0 };
  }
  return {
    invertido,
    restante,
    total,
    pctInvertido: Math.round((invertido / total) * 100),
    pctRestante: Math.round((restante / total) * 100),
  };
}
