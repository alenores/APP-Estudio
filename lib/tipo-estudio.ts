/** Valores de `tipo_estudio` en tablas `cursos` y `clases` (check constraint Supabase). */

export const TIPO_ESTUDIO_VALUES = [
  "cultura_general",
  "pantallazo",
  "herramienta_operativa",
  "dominio_real",
] as const;

export type TipoEstudio = (typeof TIPO_ESTUDIO_VALUES)[number];

export type TipoEstudioOption = {
  value: TipoEstudio | "";
  label: string;
};

export const TIPO_ESTUDIO_OPTIONS: TipoEstudioOption[] = [
  { value: "cultura_general", label: "Cultura general" },
  { value: "pantallazo", label: "Pantallazo" },
  { value: "herramienta_operativa", label: "Herramienta operativa" },
  { value: "dominio_real", label: "Dominio real" },
  { value: "", label: "Sin definir" },
];

const CARD_STRIP: Record<
  TipoEstudio,
  { bg: string; color: string; label: string }
> = {
  cultura_general: { bg: "#b4b2a9", color: "#dbd9d4", label: "Cultura General" },
  pantallazo: { bg: "#7eb8e6", color: "#c5e0f5", label: "Pantallazo" },
  herramienta_operativa: {
    bg: "#5da88f",
    color: "#a8d6c8",
    label: "Herramienta Operativa",
  },
  dominio_real: { bg: "#e24b4a", color: "#f4a8a8", label: "Dominio Real" },
};

const MAPA_STRIP: Record<TipoEstudio, string> = {
  cultura_general: "linear-gradient(90deg,#e2e8f0,#94a3b8)",
  pantallazo: "linear-gradient(90deg,#dceefb,#9ec5ef)",
  herramienta_operativa: "linear-gradient(90deg,#d4f0eb,#9fd9cc)",
  dominio_real: "linear-gradient(90deg,#fecdd3,#fb7185)",
};

export function tipoEstudioCardStrip(tipo: TipoEstudio) {
  return CARD_STRIP[tipo];
}

export function tipoEstudioMapaStripBackground(tipo: TipoEstudio | null): string {
  if (tipo == null) return "#e2e8f0";
  return MAPA_STRIP[tipo];
}

export function tipoEstudioLabel(tipo: TipoEstudio | null | undefined): string {
  if (tipo == null) return "Sin definir";
  return TIPO_ESTUDIO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}

export function parseTipoEstudio(
  value: string | null | undefined,
): TipoEstudio | null {
  if (value == null || value === "") return null;
  return (TIPO_ESTUDIO_VALUES as readonly string[]).includes(value)
    ? (value as TipoEstudio)
    : null;
}
