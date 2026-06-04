/** Minutos totales → "5h 20m" (horas omitidas si 0). */
export function formatDuracionMinutos(minutos: number | null | undefined): string {
  if (minutos == null || minutos < 0 || !Number.isFinite(minutos)) return "—";
  const m = Math.round(minutos);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest}m`;
  if (rest === 0) return `${h}h`;
  return `${h}h ${rest}m`;
}
