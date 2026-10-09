/**
 * Clases y cursos que alguna vez pasaron a «en curso» en académico lite (ADR 012 §10).
 *
 * El estado de hoy no importa: si después quedó terminado o pausado, sigue.
 * Cada uno entra una sola vez, por la marca «en curso» más reciente.
 * Los temas no entran.
 */

import type { Seguimiento } from "@/app/types/estudio";
import { normalizarEstado } from "@/lib/estado-ui";
import type { LiteItem } from "@/lib/academico-lite-read";

/** Cuántas filas muestra el listado corto, arriba de los temas. */
export const LITE_RECIENTES_VISIBLES = 4;

export type LiteEmpezado = {
  item: LiteItem;
  /** `fecha_registro` del seguimiento «en curso» más reciente. */
  fecha: string;
};

function marcaMs(fecha: string): number {
  const t = new Date(fecha).getTime();
  return Number.isNaN(t) ? 0 : t;
}

type Marca = { fecha: string; id: number };

function guardarSiEsMasNueva(ultima: Map<string, Marca>, clave: string, seguimiento: Seguimiento): void {
  const previa = ultima.get(clave);
  const nuevaMs = marcaMs(seguimiento.fecha_registro);
  const esMasNueva =
    !previa ||
    nuevaMs > marcaMs(previa.fecha) ||
    (nuevaMs === marcaMs(previa.fecha) && seguimiento.id > previa.id);
  if (esMasNueva) {
    ultima.set(clave, { fecha: seguimiento.fecha_registro, id: seguimiento.id });
  }
}

/**
 * Orden: de la marca más nueva a la más vieja.
 * Una clase o un curso sin fila en el paquete (borrado) no aparece.
 */
export function empezados(
  seguimientos: Seguimiento[],
  cursos: LiteItem[],
  clases: LiteItem[],
): LiteEmpezado[] {
  const cursoPorId = new Map(cursos.map((curso) => [curso.id, curso]));
  const clasePorId = new Map(clases.map((clase) => [clase.id, clase]));
  const ultima = new Map<string, Marca>();

  for (const seguimiento of seguimientos) {
    if (normalizarEstado(seguimiento.etiqueta_estado) !== "en curso") continue;
    if (!seguimiento.fecha_registro) continue;

    if (seguimiento.clase_id != null) {
      guardarSiEsMasNueva(ultima, `clase:${seguimiento.clase_id}`, seguimiento);
    } else if (seguimiento.curso_id != null) {
      guardarSiEsMasNueva(ultima, `curso:${seguimiento.curso_id}`, seguimiento);
    }
  }

  const lista: LiteEmpezado[] = [];
  for (const [clave, marca] of ultima) {
    const [kind, idTexto] = clave.split(":");
    const id = Number(idTexto);
    const item = kind === "clase" ? clasePorId.get(id) : cursoPorId.get(id);
    if (!item || item.kind !== kind) continue;
    lista.push({ item, fecha: marca.fecha });
  }

  lista.sort((a, b) => {
    const porFecha = marcaMs(b.fecha) - marcaMs(a.fecha);
    if (porFecha !== 0) return porFecha;
    const idA = ultima.get(`${a.item.kind}:${a.item.id}`)?.id ?? 0;
    const idB = ultima.get(`${b.item.kind}:${b.item.id}`)?.id ?? 0;
    return idB - idA;
  });
  return lista;
}
