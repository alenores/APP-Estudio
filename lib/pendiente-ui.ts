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

export const PENDIENTE_ESTADO_BADGE_CLASS: Record<PendienteEstado, string> = {
  abierto: "bg-sky-100 text-sky-800",
  en_progreso: "bg-indigo-100 text-indigo-800",
  resuelto: "bg-emerald-100 text-emerald-800",
  descartado: "bg-slate-100 text-slate-600",
};

export const PENDIENTE_PRIORIDAD_BADGE_CLASS: Record<PendientePrioridad, string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-orange-100 text-orange-800",
  baja: "bg-slate-100 text-slate-600",
};
