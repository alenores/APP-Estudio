/**
 * Convierte segmentos de ruta o query params a id numérico de negocio (bigint en Supabase).
 * Los ids vienen como string desde la URL; user_id sigue siendo uuid y no usa esto.
 */
export function parseEntityId(value: string | undefined | null): number | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

/** Normaliza id que puede llegar como number o string desde PostgREST (bigint). */
export function normalizeEntityId(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === "string") return parseEntityId(value);
  return null;
}
