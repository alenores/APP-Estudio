import type { CursoConDerivados } from "@/app/types/estudio";
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

/** Fecha entre paréntesis en card de curso según estado (mockup detalle tema). */
export function fechaParentesisCurso(curso: CursoConDerivados): string | null {
  const estado = normalizarEstado(curso.derivados.etiqueta_estado);
  if (estado === "terminado") return null;
  if (estado === "en curso") {
    const f = formatFechaCorta(curso.fecha_estimada_fin);
    return f ? `(fin ${f})` : null;
  }
  if (estado === "pausado" || estado === "sin empezar") {
    const f = formatFechaCorta(curso.fecha_estimada_inicio);
    return f ? `(inicio ${f})` : null;
  }
  const f = formatFechaCorta(curso.fecha_estimada_inicio);
  return f ? `(inicio ${f})` : null;
}
