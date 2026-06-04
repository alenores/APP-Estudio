import type { Seguimiento, SeguimientoDerivados } from "@/app/types/estudio";

const VACIO: SeguimientoDerivados = {
  etiqueta_estado: null,
  porcentaje_avance: null,
  tiempo_consumido: null,
  tiempo_faltante_estimado: null,
  nivel_entendimiento: null,
  fecha_comienzo: null,
};

function porFechaRegistroDesc(a: Seguimiento, b: Seguimiento) {
  return (
    new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
  );
}

function porFechaRegistroAsc(a: Seguimiento, b: Seguimiento) {
  return (
    new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime()
  );
}

/** Seguimiento más reciente (por `fecha_registro`) que cumple el predicado. */
function ultimoSeguimientoConCampo(
  seguimientos: Seguimiento[],
  pred: (s: Seguimiento) => boolean,
): Seguimiento | null {
  return [...seguimientos].sort(porFechaRegistroDesc).find(pred) ?? null;
}

function tieneEtiquetaEstado(s: Seguimiento): boolean {
  return s.etiqueta_estado != null && s.etiqueta_estado.trim() !== "";
}

function tienePorcentajeAvance(s: Seguimiento): boolean {
  return s.porcentaje_avance != null;
}

function tieneTiempoConsumido(s: Seguimiento): boolean {
  return s.tiempo_consumido != null;
}

function tieneTiempoFaltante(s: Seguimiento): boolean {
  return s.tiempo_faltante_estimado != null;
}

function tieneNivelEntendimiento(s: Seguimiento): boolean {
  return s.nivel_entendimiento != null && s.nivel_entendimiento.trim() !== "";
}

/**
 * Agrega campos de UI desde `seguimientos` (ADR 002). No modifica tablas padre.
 * Cada campo escalar sale del seguimiento más reciente que **tenga valor** en ese
 * campo (no necesariamente el último registro insertado).
 */
export function derivarDesdeSeguimientos(
  seguimientos: Seguimiento[],
): SeguimientoDerivados {
  if (seguimientos.length === 0) return { ...VACIO };

  const primerComienzo = [...seguimientos]
    .filter((s) => s.fecha_comienzo != null && s.fecha_comienzo !== "")
    .sort(porFechaRegistroAsc)[0];

  return {
    etiqueta_estado:
      ultimoSeguimientoConCampo(seguimientos, tieneEtiquetaEstado)
        ?.etiqueta_estado ?? null,
    porcentaje_avance:
      ultimoSeguimientoConCampo(seguimientos, tienePorcentajeAvance)
        ?.porcentaje_avance ?? null,
    tiempo_consumido:
      ultimoSeguimientoConCampo(seguimientos, tieneTiempoConsumido)
        ?.tiempo_consumido ?? null,
    tiempo_faltante_estimado:
      ultimoSeguimientoConCampo(seguimientos, tieneTiempoFaltante)
        ?.tiempo_faltante_estimado ?? null,
    nivel_entendimiento:
      ultimoSeguimientoConCampo(seguimientos, tieneNivelEntendimiento)
        ?.nivel_entendimiento ?? null,
    fecha_comienzo: primerComienzo?.fecha_comienzo ?? null,
  };
}
