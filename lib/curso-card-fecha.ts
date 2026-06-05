import type { CursoConDerivados } from "@/app/types/estudio";
import { fechaParentesisEntidad } from "@/lib/entity-card-fecha";

/** Fecha entre paréntesis en card de curso (estado desde seguimientos). */
export function fechaParentesisCurso(curso: CursoConDerivados): string | null {
  return fechaParentesisEntidad(curso);
}
