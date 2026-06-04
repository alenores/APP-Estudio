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
