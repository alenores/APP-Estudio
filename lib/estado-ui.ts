/**
 * Valores fijos de `etiqueta_estado` en Supabase (text, con espacios).
 * Mapeo estado → color en un solo lugar para badges y detalle de tema.
 */

/** Valores que se persisten en `etiqueta_estado`. */
export const ESTADOS_SEGUIMIENTO = [
  "sin empezar",
  "en curso",
  "pausado",
  "terminado",
] as const;

export type EstadoSeguimiento = (typeof ESTADOS_SEGUIMIENTO)[number];

/** Etiquetas legibles en selects y listados. */
export const ESTADO_OPCIONES: { value: EstadoSeguimiento; label: string }[] = [
  { value: "sin empezar", label: "Sin empezar" },
  { value: "en curso", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "terminado", label: "Terminado" },
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

const LEGACY_ESTADO: Record<string, EstadoSeguimiento> = {
  comenzado: "sin empezar",
  completado: "terminado",
};

/** Texto en listados (acepta valores viejos sin romper lectura). */
export function nivelEntendimientoLabel(valor: string | null): string | null {
  if (!valor?.trim()) return null;
  const n = Number(valor);
  if (Number.isInteger(n) && n >= NIVEL_MIN && n <= NIVEL_MAX) {
    return String(n);
  }
  return valor;
}

export function normalizarEstado(estado: string | null): EstadoSeguimiento | null {
  if (!estado) return null;
  const lower = estado.trim().toLowerCase();
  const legacy = LEGACY_ESTADO[lower];
  if (legacy) return legacy;
  return ESTADOS_SEGUIMIENTO.find((e) => e === lower) ?? null;
}

/** Clase Tailwind del puntito del semáforo (listado de temas/cursos/clases). */
export function estadoDotClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "sin empezar":
      return "bg-estado-sin-empezar";
    case "en curso":
      return "bg-estado-en-curso";
    case "pausado":
      return "bg-estado-pausado";
    case "terminado":
      return "bg-estado-terminado";
    default:
      return "bg-estado-sin";
  }
}

/** Clases del badge de estado en detalle de entidad. */
export function estadoBadgeClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "sin empezar":
      return "bg-estado-sin-empezar/15 text-estado-sin-empezar border border-estado-sin-empezar/30";
    case "en curso":
      return "bg-estado-en-curso/15 text-estado-en-curso";
    case "pausado":
      return "bg-estado-pausado/20 text-estado-pausado-text";
    case "terminado":
      return "bg-estado-terminado/15 text-estado-terminado";
    default:
      return "bg-border text-ink-muted";
  }
}

/** Texto legible para mostrar en UI. */
export function estadoLabel(estado: string | null): string | null {
  const key = normalizarEstado(estado);
  if (!key) return estado;
  return ESTADO_OPCIONES.find((o) => o.value === key)?.label ?? estado;
}

/** Chip de cabecera en detalle de tema (mockup). */
export function estadoChipDetalleClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "sin empezar":
      return "td-chip td-chip-sin";
    case "en curso":
      return "td-chip td-chip-curso";
    case "pausado":
      return "td-chip td-chip-pausa";
    case "terminado":
      return "td-chip td-chip-fin";
    default:
      return "td-chip td-chip-sin";
  }
}

/** Franja vertical en card de curso (detalle tema). */
export function estadoStripDetalleClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "sin empezar":
      return "td-estrip td-estrip-sin";
    case "en curso":
      return "td-estrip td-estrip-curso";
    case "pausado":
      return "td-estrip td-estrip-pausa";
    case "terminado":
      return "td-estrip td-estrip-fin";
    default:
      return "td-estrip td-estrip-sin";
  }
}

/** Relleno de % en cuerpo de card de curso. */
export function estadoFillDetalleClass(estado: string | null): string {
  switch (normalizarEstado(estado)) {
    case "sin empezar":
      return "td-cfill td-cfill-sin";
    case "en curso":
      return "td-cfill td-cfill-curso";
    case "pausado":
      return "td-cfill td-cfill-pausa";
    case "terminado":
      return "td-cfill td-cfill-fin";
    default:
      return "td-cfill td-cfill-sin";
  }
}

/** Punto de color en chip de filtro por estado. */
export function estadoFilterDotClass(estado: EstadoSeguimiento | "todos"): string {
  switch (estado) {
    case "todos":
      return "";
    case "sin empezar":
      return "td-fdot td-fdot-sin";
    case "en curso":
      return "td-fdot td-fdot-curso";
    case "pausado":
      return "td-fdot td-fdot-pausa";
    case "terminado":
      return "td-fdot td-fdot-fin";
  }
}
