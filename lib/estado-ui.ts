/**
 * Valores fijos de estado y nivel para seguimientos (columna text en Supabase).
 * Mapeo estado → color en un solo lugar para semáforo y badges.
 */

/** Valores que se persisten en `etiqueta_estado`. */
export const ESTADOS_SEGUIMIENTO = [
  "comenzado",
  "pausado",
  "en curso",
  "completado",
] as const;

export type EstadoSeguimiento = (typeof ESTADOS_SEGUIMIENTO)[number];

/** Etiquetas legibles en selects y listados. */
export const ESTADO_OPCIONES: { value: EstadoSeguimiento; label: string }[] = [
  { value: "comenzado", label: "Comenzado" },
  { value: "en curso", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "completado", label: "Completado" },
];

/** Valores 1–10 persistidos en `nivel_entendimiento` (columna text en Supabase). */
export const NIVELES_ENTENDIMIENTO = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
] as const;

export type NivelEntendimiento = (typeof NIVELES_ENTENDIMIENTO)[number];

export const NIVEL_MIN = 1;
export const NIVEL_MAX = 10;

/** Texto en listados (acepta valores viejos alto/medio/bajo sin romper). */
export function nivelEntendimientoLabel(valor: string | null): string | null {
  if (!valor?.trim()) return null;
  const n = Number(valor);
  if (Number.isInteger(n) && n >= NIVEL_MIN && n <= NIVEL_MAX) {
    return String(n);
  }
  return valor;
}

function normalizarEstado(estado: string | null): EstadoSeguimiento | null {
  if (!estado) return null;
  const lower = estado.trim().toLowerCase();
  return ESTADOS_SEGUIMIENTO.find((e) => e === lower) ?? null;
}

/** Clase Tailwind del puntito del semáforo (listado de temas/cursos/clases). */
export function estadoDotClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "comenzado":
      return "bg-estado-comenzado";
    case "en curso":
      return "bg-estado-en-curso";
    case "pausado":
      return "bg-estado-pausado";
    case "completado":
      return "bg-estado-completado";
    default:
      return "bg-estado-sin";
  }
}

/** Clases del badge de estado en detalle de entidad. */
export function estadoBadgeClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "comenzado":
      return "bg-estado-comenzado/15 text-estado-comenzado";
    case "en curso":
      return "bg-estado-en-curso/15 text-estado-en-curso";
    case "pausado":
      return "bg-estado-pausado/15 text-estado-pausado";
    case "completado":
      return "bg-estado-completado/15 text-estado-completado";
    default:
      return "bg-border text-ink-muted";
  }
}

/** Texto legible para mostrar en UI (capitaliza el valor almacenado). */
export function estadoLabel(estado: string | null): string | null {
  const key = normalizarEstado(estado);
  if (!key) return estado;
  return ESTADO_OPCIONES.find((o) => o.value === key)?.label ?? estado;
}
