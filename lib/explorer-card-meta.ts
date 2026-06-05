import type { SeguimientoDerivados } from "@/app/types/estudio";
import type { ClasesCursoStats } from "@/lib/curso-clases-stats";
import { formatDuracionMinutos } from "@/lib/format-duracion";

/** Líneas compactas para cards del explorador PC (shared derivados). */
export function explorerCardMetaLines(input: {
  derivados: SeguimientoDerivados;
  clasesStats?: ClasesCursoStats;
  avanceClasePct?: number | null;
}): string[] {
  const lines: string[] = [];
  const { derivados, clasesStats } = input;

  if (derivados.porcentaje_avance != null) {
    lines.push(`Avance ${derivados.porcentaje_avance}%`);
  }

  if (derivados.tiempo_consumido != null && derivados.tiempo_consumido > 0) {
    lines.push(`Tiempo ${formatDuracionMinutos(derivados.tiempo_consumido)}`);
  }

  if (clasesStats && clasesStats.total > 0) {
    lines.push(`Clases ${clasesStats.terminadas}/${clasesStats.total}`);
  }

  return lines;
}
