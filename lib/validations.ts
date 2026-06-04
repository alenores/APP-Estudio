import { z } from "zod";
import { ESTADOS_SEGUIMIENTO } from "@/lib/estado-ui";
import {
  seguimientoMuestraAvanceCurso,
  type SeguimientoFormScope,
} from "@/lib/seguimiento-form-scope";

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
  link: optionalText,
});

const optionalNivelEntendimiento = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : Number(v)))
  .refine(
    (v) =>
      v === undefined ||
      (Number.isInteger(v) && v >= 1 && v <= 10),
    "Entre 1 y 10",
  )
  .transform((v) => (v === undefined ? undefined : String(v)));

const seguimientoEtiquetaEstado = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => !v || (ESTADOS_SEGUIMIENTO as readonly string[]).includes(v),
    "Estado inválido",
  )
  .transform((v) => (v === "" ? undefined : v));

const seguimientoCamposBase = {
  etiqueta_estado: seguimientoEtiquetaEstado,
  fecha_comienzo: optionalDate,
  fecha_alerta: optionalDate,
  tiempo_consumido: optionalInt,
  nivel_entendimiento: optionalNivelEntendimiento,
};

const seguimientoCamposAvanceCurso = {
  porcentaje_avance: optionalPercent,
  tiempo_faltante_estimado: optionalInt,
};

const CAMPOS_SEGUIMIENTO_TEMA = [
  "etiqueta_estado",
  "fecha_comienzo",
  "fecha_alerta",
  "tiempo_consumido",
  "nivel_entendimiento",
] as const;

const CAMPOS_SEGUIMIENTO_CURSO = [
  ...CAMPOS_SEGUIMIENTO_TEMA,
  "porcentaje_avance",
  "tiempo_faltante_estimado",
] as const;

function seguimientoCampoTieneValor(
  data: Record<string, unknown>,
  key: string,
): boolean {
  const v = data[key];
  return v !== undefined && v !== null && v !== "";
}

/** Schema según dimensión: tema sin % ni tiempo faltante; curso/clase con avance. */
export function seguimientoFormSchemaForScope(scope: SeguimientoFormScope) {
  const campos = seguimientoMuestraAvanceCurso(scope)
    ? CAMPOS_SEGUIMIENTO_CURSO
    : CAMPOS_SEGUIMIENTO_TEMA;
  const shape = seguimientoMuestraAvanceCurso(scope)
    ? { ...seguimientoCamposBase, ...seguimientoCamposAvanceCurso }
    : seguimientoCamposBase;

  return z.object(shape).superRefine((data, ctx) => {
    const tieneAlguno = campos.some((k) =>
      seguimientoCampoTieneValor(data, k),
    );
    if (!tieneAlguno) {
      ctx.addIssue({
        code: "custom",
        message: "Completá al menos un campo antes de guardar.",
        path: [],
      });
    }
  });
}

/** @deprecated Usar seguimientoFormSchemaForScope */
export const seguimientoFormSchema = z.object({
  ...seguimientoCamposBase,
  ...seguimientoCamposAvanceCurso,
  comentario: optionalText,
});

export type TemaFormValues = z.infer<typeof temaFormSchema>;
export type CursoFormValues = z.infer<typeof cursoFormSchema>;
export type ClaseFormValues = z.infer<typeof claseFormSchema>;
export type SeguimientoFormValues = z.infer<
  ReturnType<typeof seguimientoFormSchemaForScope>
>;

/** Payload completo hacia Supabase (campos no usados en UI van undefined → null). */
export type SeguimientoInsertValues = {
  etiqueta_estado?: string;
  fecha_comienzo?: string;
  fecha_alerta?: string;
  tiempo_consumido?: number;
  nivel_entendimiento?: string;
  porcentaje_avance?: number;
  tiempo_faltante_estimado?: number;
  comentario?: string;
};

export const conceptoFormSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio").max(200),
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(2000),
  jerarquia: optionalInt,
});

export type ConceptoFormValues = z.infer<typeof conceptoFormSchema>;
