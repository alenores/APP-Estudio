/** Valor ISO de Supabase → input type="date" (yyyy-mm-dd). */
export function isoToDateInputValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  return iso.trim().slice(0, 10);
}

/** Número opcional → string para inputs controlados. */
export function numberFieldInitial(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "";
  return String(n);
}
