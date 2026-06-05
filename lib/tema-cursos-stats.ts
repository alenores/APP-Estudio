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

/** Curso terminado: estado `terminado` o avance 100% según seguimientos del curso. */
export function cursosStatsPorTema(
  cache: EstudioOfflineCacheData,
  temaId: number,
): HijosProgressStats {
  const cursos = cache.cursos.filter((c) => c.tema_id === temaId);
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

export function cursosStatsMapPorTemas(
  cache: EstudioOfflineCacheData,
  temaIds: number[],
): Map<number, HijosProgressStats> {
  const map = new Map<number, HijosProgressStats>();
  for (const id of temaIds) {
    map.set(id, cursosStatsPorTema(cache, id));
  }
  return map;
}
