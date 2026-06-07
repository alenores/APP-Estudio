/** Posición en grilla para hijos del lienzo detalle (sin persistencia en v1). */

const COL_WIDTH = 268;
const ROW_HEIGHT = 108;
const COLS = 3;

export function mapaDetalleGridPosition(index: number): { x: number; y: number } {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return { x: col * COL_WIDTH, y: row * ROW_HEIGHT };
}

export function mapaDetalleFlowNodeId(
  kind: "curso" | "logro",
  id: number,
): string {
  return `${kind}:${id}`;
}

export function parseMapaDetalleFlowNodeId(nodeId: string): {
  kind: "curso" | "logro";
  id: number;
} | null {
  const m = /^(curso|logro):(\d+)$/.exec(nodeId);
  if (!m) return null;
  return { kind: m[1] as "curso" | "logro", id: Number(m[2]) };
}
