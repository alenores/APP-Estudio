import type { CaracteristicaTipo } from "@/app/types/desarrollos";

export const CARACTERISTICA_TIPOS: CaracteristicaTipo[] = [
  "nota",
  "implicancia_tecnica",
  "prompt_cursor",
];

export const CARACTERISTICA_TIPO_LABELS: Record<CaracteristicaTipo, string> = {
  nota: "Nota",
  implicancia_tecnica: "Implicancia técnica",
  prompt_cursor: "Prompt Cursor",
};

export const CARACTERISTICA_TIPO_BADGE_CLASS: Record<CaracteristicaTipo, string> = {
  nota: "bg-slate-100 text-slate-700",
  implicancia_tecnica: "bg-amber-100 text-amber-800",
  prompt_cursor: "bg-violet-100 text-violet-800",
};
