import type { SeguimientoDerivados } from "@/app/types/estudio";
import { normalizarEstado } from "@/lib/estado-ui";

function formatFechaCorta(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return null;
  }
}

type EntidadConFechasEstimadas = {
  fecha_estimada_inicio: string | null;
  fecha_estimada_fin: string | null;
  derivados: SeguimientoDerivados;
};

/**
 * Fecha entre paréntesis en card según estado derivado de seguimientos
 * (misma lógica para tema y curso).
 */
export function fechaParentesisEntidad(
  entidad: EntidadConFechasEstimadas,
): string | null {
  const estado = normalizarEstado(entidad.derivados.etiqueta_estado);
  if (estado === "terminado") return null;
  if (estado === "en curso") {
    const f = formatFechaCorta(entidad.fecha_estimada_fin);
    return f ? `(fin ${f})` : null;
  }
  if (estado === "pausado" || estado === "sin empezar") {
    const f = formatFechaCorta(entidad.fecha_estimada_inicio);
    return f ? `(inicio ${f})` : null;
  }
  const f = formatFechaCorta(entidad.fecha_estimada_inicio);
  return f ? `(inicio ${f})` : null;
}
