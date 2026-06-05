import type { TemaConDerivados } from "@/app/types/estudio";
import { fechaParentesisEntidad } from "@/lib/entity-card-fecha";

/** Fecha entre paréntesis en card de tema (estado desde seguimientos). */
export function fechaParentesisTema(tema: TemaConDerivados): string | null {
  return fechaParentesisEntidad(tema);
}
