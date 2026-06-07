import type {
  MapaGrafoEnlace,
  MapaGrafoEnlaceEndpoints,
} from "@/lib/mapa-lienzo-types";

/** Resumen compacto de enlaces para cards del lienzo (nodos o temas). */
export function mapaGrafoEnlaceCounts(
  itemId: number,
  enlaces: MapaGrafoEnlaceEndpoints[],
): { entrada: number; salida: number } {
  let entrada = 0;
  let salida = 0;
  for (const e of enlaces) {
    if (e.destino_id === itemId) entrada += 1;
    if (e.origen_id === itemId) salida += 1;
  }
  return { entrada, salida };
}
