import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { normalizarEstado } from "@/lib/estado-ui";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { parseObjetivoId } from "@/lib/objetivo-ui";

function seguimientosPorCurso(
  cache: EstudioOfflineCacheData,
  cursoId: number,
) {
  return cache.seguimientos.filter((s) => s.curso_id === cursoId);
}

/** Cursos del objetivo terminados según seguimientos. */
export function cursosStatsPorObjetivo(
  cache: EstudioOfflineCacheData,
  objetivoId: number,
): HijosProgressStats {
  const oid = parseObjetivoId(objetivoId);
  if (oid == null) return { terminadas: 0, total: 0 };

  const cursos = cache.cursos.filter((c) => c.objetivo_id === oid);
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

export function cursosStatsMapPorObjetivos(
  cache: EstudioOfflineCacheData,
  objetivoIds: number[],
): Map<number, HijosProgressStats> {
  const map = new Map<number, HijosProgressStats>();
  for (const id of objetivoIds) {
    map.set(id, cursosStatsPorObjetivo(cache, id));
  }
  return map;
}
