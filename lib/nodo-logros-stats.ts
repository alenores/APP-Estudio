import type { Logro } from "@/app/types/estudio";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";

export function logrosStatsPorNodo(
  logros: Logro[],
  nodoId: number,
): HijosProgressStats {
  const total = logros.filter((l) => l.nodo_id === nodoId).length;
  return { terminadas: total, total };
}

export function logrosStatsMapPorNodos(
  logros: Logro[],
  nodoIds: number[],
): Map<number, HijosProgressStats> {
  const map = new Map<number, HijosProgressStats>();
  for (const id of nodoIds) {
    map.set(id, logrosStatsPorNodo(logros, id));
  }
  return map;
}
