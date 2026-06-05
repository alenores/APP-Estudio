"use client";

import type { MapaNodo } from "@/app/types/mapa";
import { mapaFlowNodeTypes } from "@/components/desktop/mapa/mapa-nodo-node";
import { posicionNodoEnLienzo } from "@/lib/mapa-layout";
import { updateMapaNodoPosition } from "@/lib/mapa-queries";
import {
  Background,
  Controls,
  ReactFlow,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type MapaCanvasProps = {
  nodos: MapaNodo[];
  onEditNodo: (id: number) => void;
};

function toFlowNodes(
  nodos: MapaNodo[],
  onEditNodo: (id: number) => void,
): Node[] {
  return nodos.map((nodo) => {
    const pos = posicionNodoEnLienzo(nodo);
    return {
      id: String(nodo.id),
      type: "mapaNodo",
      position: pos,
      data: { nodo, onEdit: onEditNodo },
      draggable: true,
    };
  });
}

/** Lienzo React Flow — solo shell escritorio (ADR 009). */
export function MapaCanvas({ nodos, onEditNodo }: MapaCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(() =>
    toFlowNodes(nodos, onEditNodo),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const onEditStable = useCallback(
    (id: number) => onEditNodo(id),
    [onEditNodo],
  );

  useEffect(() => {
    setNodes(toFlowNodes(nodos, onEditStable));
  }, [nodos, onEditStable]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      setSavingId(node.id);
      const { error } = await updateMapaNodoPosition(
        Number(node.id),
        node.position.x,
        node.position.y,
      );
      setSavingId(null);
      if (error) {
        setNodes(toFlowNodes(nodos, onEditStable));
      }
    },
    [nodos, onEditStable],
  );

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.85 }), []);

  if (nodos.length === 0) {
    return (
      <div className="mapa-canvas-empty flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--td-line)] bg-[var(--td-line-soft)]/25 px-6 py-16 text-center text-sm text-[var(--td-faint)]">
        Creá un nodo para verlo en el lienzo. Arrastrá para ubicarlo en la línea
        de tiempo.
      </div>
    );
  }

  return (
    <div className="mapa-canvas-wrap relative min-h-[min(68vh,720px)] flex-1 overflow-hidden rounded-xl border border-[var(--td-line)] bg-[#f1f5f9]">
      {savingId ? (
        <p className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--td-ink-soft)] shadow-sm">
          Guardando posición…
        </p>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={mapaFlowNodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={(e, node) => void onNodeDragStop(e, node)}
        defaultViewport={defaultViewport}
        minZoom={0.25}
        maxZoom={1.75}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
