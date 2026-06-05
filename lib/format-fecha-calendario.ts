/** Fechas en UI: dd/mm/aaaa desde ISO o timestamp Supabase. */
export function formatFechaCalendario(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const iso = value.trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  } catch {
    return value;
  }
}
