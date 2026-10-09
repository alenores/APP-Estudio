/**
 * Clases que alguna vez pasaron a «en curso» en académico lite (ADR 012 §10).
 *
 * El estado de hoy no importa: si después quedó terminada o pausada, sigue.
 * Cada clase entra una sola vez, por la marca «en curso» más reciente.
 */

import type { Seguimiento } from "@/app/types/estudio";
import { normalizarEstado } from "@/lib/estado-ui";
import type { LiteItem } from "@/lib/academico-lite-read";

/** Cuántas filas muestra el listado corto, arriba de los temas. */
export const LITE_RECIENTES_VISIBLES = 4;

export type LiteClaseComenzada = {
  clase: LiteItem;
  /** `fecha_registro` del seguimiento «en curso» más reciente. */
  fecha: string;
};

function marcaMs(fecha: string): number {
  const t = new Date(fecha).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Orden: de la marca más nueva a la más vieja.
 * Una clase sin fila en el paquete (borrada) no aparece.
 */
export function clasesComenzadas(
  seguimientos: Seguimiento[],
  clases: LiteItem[],
): LiteClaseComenzada[] {
  const clasePorId = new Map(clases.map((clase) => [clase.id, clase]));
  const ultima = new Map<number, { fecha: string; id: number }>();

  for (const seguimiento of seguimientos) {
    if (seguimiento.clase_id == null) continue;
    if (normalizarEstado(seguimiento.etiqueta_estado) !== "en curso") continue;
    if (!seguimiento.fecha_registro) continue;

    const previa = ultima.get(seguimiento.clase_id);
    const nuevaMs = marcaMs(seguimiento.fecha_registro);
    const esMasNueva =
      !previa ||
      nuevaMs > marcaMs(previa.fecha) ||
      (nuevaMs === marcaMs(previa.fecha) && seguimiento.id > previa.id);
    if (esMasNueva) {
      ultima.set(seguimiento.clase_id, {
        fecha: seguimiento.fecha_registro,
        id: seguimiento.id,
      });
    }
  }

  const lista: LiteClaseComenzada[] = [];
  for (const [claseId, marca] of ultima) {
    const clase = clasePorId.get(claseId);
    if (!clase || clase.kind !== "clase") continue;
    lista.push({ clase, fecha: marca.fecha });
  }

  lista.sort(
    (a, b) =>
      marcaMs(b.fecha) - marcaMs(a.fecha) || b.clase.id - a.clase.id,
  );
  return lista;
}
