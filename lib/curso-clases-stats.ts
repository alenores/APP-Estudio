import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { normalizarEstado } from "@/lib/estado-ui";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";

export type { ClasesCursoStats, HijosProgressStats } from "@/lib/hijos-progress-stats";

function seguimientosPorClase(
  cache: EstudioOfflineCacheData,
  claseId: number,
) {
  return cache.seguimientos.filter((s) => s.clase_id === claseId);
}

/** Clase terminada: estado `terminado` o avance 100% en último seguimiento de la clase. */
export function clasesStatsPorCurso(
  cache: EstudioOfflineCacheData,
  cursoId: number,
): HijosProgressStats {
  const clases = cache.clases.filter((c) => c.curso_id === cursoId);
  let terminadas = 0;
  for (const cl of clases) {
    const d = derivarDesdeSeguimientos(seguimientosPorClase(cache, cl.id));
    const estado = normalizarEstado(d.etiqueta_estado);
    if (estado === "terminado" || d.porcentaje_avance === 100) {
      terminadas += 1;
    }
  }
  return { terminadas, total: clases.length };
}

export function clasesStatsMapPorCursos(
  cache: EstudioOfflineCacheData,
  cursoIds: number[],
): Map<number, HijosProgressStats> {
  const map = new Map<number, HijosProgressStats>();
  for (const id of cursoIds) {
    map.set(id, clasesStatsPorCurso(cache, id));
  }
  return map;
}
