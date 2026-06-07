/** Posición en grilla / persistida para hijos del lienzo detalle. */

import type { LienzoHijoPosicion, MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";

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

export function buildMapaDetallePosicionesMap(
  posiciones: LienzoHijoPosicion[],
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const p of posiciones) {
    map.set(mapaDetalleFlowNodeId(p.hijo_kind, p.hijo_id), {
      x: p.pos_x,
      y: p.pos_y,
    });
  }
  return map;
}

export function resolveMapaDetallePosition(
  kind: MapaDetalleHijoKind,
  id: number,
  index: number,
  posicionesByNodeId: Map<string, { x: number; y: number }>,
): { x: number; y: number } {
  const saved = posicionesByNodeId.get(mapaDetalleFlowNodeId(kind, id));
  return saved ?? mapaDetalleGridPosition(index);
}
