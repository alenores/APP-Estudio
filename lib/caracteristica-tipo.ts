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
  nota: "border border-stone-300/80 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300",
  implicancia_tecnica:
    "border border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300",
  prompt_cursor:
    "border border-stone-700/80 bg-stone-900 text-stone-100 dark:border-stone-600 dark:bg-stone-950",
};
