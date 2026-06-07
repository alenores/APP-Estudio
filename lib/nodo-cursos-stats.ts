import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { normalizarEstado } from "@/lib/estado-ui";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";

function seguimientosPorCurso(
  cache: EstudioOfflineCacheData,
  cursoId: number,
) {
  return cache.seguimientos.filter((s) => s.curso_id === cursoId);
}

export function cursosStatsPorNodo(
  cache: EstudioOfflineCacheData,
  nodoId: number,
): HijosProgressStats {
  const cursos = cache.cursos.filter((c) => c.nodo_id === nodoId);
  let terminadas = 0;
  for (const curso of cursos) {
    const d = derivarDesdeSeguimientos(seguimientosPorCurso(cache, curso.id));
    const estado = normalizarEstado(d.etiqueta_estado);
    if (estado === "terminado" || d.porcentaje_avance === 100) {
      terminadas += 1;
    }
  }
  return { terminadas, total: cursos.length };
}

export function cursosStatsMapPorNodos(
  cache: EstudioOfflineCacheData,
  nodoIds: number[],
): Map<number, HijosProgressStats> {
  const map = new Map<number, HijosProgressStats>();
  for (const id of nodoIds) {
    map.set(id, cursosStatsPorNodo(cache, id));
  }
  return map;
}
