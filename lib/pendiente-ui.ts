import type { PendienteEstado, PendientePrioridad } from "@/app/types/desarrollos";

export const PENDIENTE_ESTADOS: PendienteEstado[] = [
  "abierto",
  "en_progreso",
  "resuelto",
  "descartado",
];

export const PENDIENTE_PRIORIDADES: PendientePrioridad[] = ["alta", "media", "baja"];

export const PENDIENTE_ESTADO_LABELS: Record<PendienteEstado, string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  resuelto: "Resuelto",
  descartado: "Descartado",
};

export const PENDIENTE_PRIORIDAD_LABELS: Record<PendientePrioridad, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

/** Outline para abierto/descartado; filled para en_progreso/resuelto */
export const PENDIENTE_ESTADO_BADGE_CLASS: Record<PendienteEstado, string> = {
  abierto:
    "border border-stone-300 bg-transparent text-stone-700 dark:border-stone-600 dark:text-stone-300",
  en_progreso: "border border-[#EA580C]/30 bg-[#EA580C] text-white",
  resuelto: "border border-emerald-600 bg-emerald-600 text-white",
  descartado:
    "border border-stone-300 bg-stone-50 text-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-400",
};

export const PENDIENTE_PRIORIDAD_BADGE_CLASS: Record<PendientePrioridad, string> = {
  alta: "border border-red-300 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300",
  media:
    "border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300",
  baja: "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
};
