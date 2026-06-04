import { z } from "zod";
import { ESTADOS_SEGUIMIENTO, NIVELES_ENTENDIMIENTO } from "@/lib/estado-ui";

const optionalText = z.string().trim().optional().or(z.literal(""));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Fecha inválida");

const optionalInt = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : Number(v)))
  .refine((v) => v === undefined || (Number.isInteger(v) && v >= 0), "Entero ≥ 0");

const optionalPercent = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : Number(v)))
  .refine(
    (v) => v === undefined || (v >= 0 && v <= 100),
    "Entre 0 y 100",
  );

export const temaFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  descripcion: optionalText,
  orden: optionalInt,
  jerarquia: optionalInt,
  fecha_estimada_inicio: optionalDate,
  fecha_estimada_fin: optionalDate,
});

export const cursoFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  descripcion: optionalText,
  orden: optionalInt,
  jerarquia: optionalInt,
  fecha_estimada_inicio: optionalDate,
  fecha_estimada_fin: optionalDate,
  plataforma: optionalText,
  link: optionalText,
});

export const claseFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  descripcion: optionalText,
  orden: optionalInt,
  jerarquia: optionalInt,
  dificultad: optionalText,
});

const optionalNivel = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || (NIVELES_ENTENDIMIENTO as readonly string[]).includes(v),
    "Nivel inválido",
  );

export const seguimientoFormSchema = z.object({
  etiqueta_estado: z
    .string()
    .trim()
    .min(1, "El estado es obligatorio")
    .refine(
      (v) => (ESTADOS_SEGUIMIENTO as readonly string[]).includes(v),
      "Estado inválido",
    ),
  porcentaje_avance: optionalPercent,
  comentario: optionalText,
  fecha_comienzo: optionalDate,
  fecha_alerta: optionalDate,
  tiempo_consumido: optionalInt,
  tiempo_faltante_estimado: optionalInt,
  nivel_entendimiento: optionalNivel,
});

export type TemaFormValues = z.infer<typeof temaFormSchema>;
export type CursoFormValues = z.infer<typeof cursoFormSchema>;
export type ClaseFormValues = z.infer<typeof claseFormSchema>;
export type SeguimientoFormValues = z.infer<typeof seguimientoFormSchema>;

export const conceptoFormSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(2000),
  jerarquia: optionalInt,
});

export type ConceptoFormValues = z.infer<typeof conceptoFormSchema>;
