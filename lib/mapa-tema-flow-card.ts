import type { SeguimientoDerivados } from "@/app/types/estudio";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { listTemasConDerivadosFromCache } from "@/lib/estudio-offline-read";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { cursosStatsMapPorTemas } from "@/lib/tema-cursos-stats";
import { fechaParentesisTema } from "@/lib/tema-card-fecha";

export type MapaTemaFlowCardData = {
  derivados: SeguimientoDerivados;
  fechaParen: string | null;
  hijosStats: HijosProgressStats;
};

const EMPTY_STATS: HijosProgressStats = { terminadas: 0, total: 0 };

/** Datos de card explorador para nodos tema en el lienzo (desde cache estudio). */
export function buildMapaTemaFlowCardDataMap(
  cache: EstudioOfflineCacheData | null | undefined,
  temaIds: number[],
): Map<number, MapaTemaFlowCardData> {
  const map = new Map<number, MapaTemaFlowCardData>();
  if (!cache || temaIds.length === 0) return map;

  const conDerivados = listTemasConDerivadosFromCache(cache);
  const statsMap = cursosStatsMapPorTemas(cache, temaIds);

  for (const id of temaIds) {
    const tema = conDerivados.find((t) => t.id === id);
    map.set(id, {
      derivados: tema?.derivados ?? derivarDesdeSeguimientos([]),
      fechaParen: tema ? fechaParentesisTema(tema) : null,
      hijosStats: statsMap.get(id) ?? EMPTY_STATS,
    });
  }

  return map;
}
