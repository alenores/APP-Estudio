import { z } from "zod";

/**
 * Esquemas Zod para formularios (fase 2).
 * Ejemplo — reemplazar cuando exista ADR 002 con columnas reales:
 *
 * export const cursoFormSchema = z.object({
 *   nombre: z.string().min(1, "El nombre es obligatorio").max(200),
 * });
 */
export const placeholderSchema = z.object({
  _phase: z.literal("schema-pending"),
});

export type PlaceholderSchema = z.infer<typeof placeholderSchema>;
