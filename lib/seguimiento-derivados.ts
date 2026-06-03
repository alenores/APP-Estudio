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

/**
 * Agrega campos de UI desde `seguimientos` (ADR 002). No modifica tablas padre.
 */
export function derivarDesdeSeguimientos(
  seguimientos: Seguimiento[],
): SeguimientoDerivados {
  if (seguimientos.length === 0) return { ...VACIO };

  const ultimo = [...seguimientos].sort(porFechaRegistroDesc)[0];
  const primerComienzo = [...seguimientos]
    .filter((s) => s.fecha_comienzo != null && s.fecha_comienzo !== "")
    .sort(porFechaRegistroAsc)[0];

  return {
    etiqueta_estado: ultimo.etiqueta_estado,
    porcentaje_avance: ultimo.porcentaje_avance,
    tiempo_consumido: ultimo.tiempo_consumido,
    tiempo_faltante_estimado: ultimo.tiempo_faltante_estimado,
    nivel_entendimiento: ultimo.nivel_entendimiento,
    fecha_comienzo: primerComienzo?.fecha_comienzo ?? null,
  };
}
