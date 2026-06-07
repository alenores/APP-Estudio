import type { MapaNodo } from "@/app/types/mapa";
import type { ObjetivoId } from "@/app/types/objetivo";
import { mapaObjetivoIdFromNodo } from "@/lib/mapa-objetivo";
import { parseObjetivoId } from "@/lib/objetivo-ui";

/** Objetivo visual de un curso vía su nodo padre (`cursos.nodo_id`). */
export function objetivoIdForCurso(
  nodoId: number,
  nodosById: Map<number, MapaNodo>,
): ObjetivoId | null {
  const nodo = nodosById.get(nodoId);
  if (!nodo) return null;
  return mapaObjetivoIdFromNodo(nodo) ?? parseObjetivoId(nodo.objetivo_id);
}
