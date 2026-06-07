import type {
  EnlaceHijoNodo,
  MapaDetalleHijoKind,
} from "@/lib/mapa-detalle-types";

/** Conteo ←/→ para cards curso/logro en lienzo detalle. */
export function mapaDetalleEnlaceCounts(
  kind: MapaDetalleHijoKind,
  id: number,
  enlaces: EnlaceHijoNodo[],
): { entrada: number; salida: number } {
  let entrada = 0;
  let salida = 0;
  for (const e of enlaces) {
    if (e.destino_kind === kind && e.destino_id === id) entrada += 1;
    if (e.origen_kind === kind && e.origen_id === id) salida += 1;
  }
  return { entrada, salida };
}
