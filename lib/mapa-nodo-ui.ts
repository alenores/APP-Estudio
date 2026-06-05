/** Paleta visual de nodos del mapa (por carril paralelo). ADR 009 fase 5. */

export type MapaNodoTone = "mint" | "sky" | "peach" | "gold";

const TONES_BY_CARRIL: MapaNodoTone[] = ["mint", "sky", "peach", "gold"];

export function mapaNodoToneFromCarril(carril: number): MapaNodoTone {
  const n = Math.abs(Math.trunc(carril));
  return TONES_BY_CARRIL[n % TONES_BY_CARRIL.length] ?? "mint";
}

export function mapaNodoToneClass(tone: MapaNodoTone): string {
  return `mapa-flow-node mapa-flow-node--${tone}`;
}

/** Resumen compacto de enlaces para la card. */
export function mapaNodoEnlaceCounts(
  nodoId: number,
  enlaces: { origen_id: number; destino_id: number }[],
): { entrada: number; salida: number } {
  let entrada = 0;
  let salida = 0;
  for (const e of enlaces) {
    if (e.destino_id === nodoId) entrada += 1;
    if (e.origen_id === nodoId) salida += 1;
  }
  return { entrada, salida };
}
