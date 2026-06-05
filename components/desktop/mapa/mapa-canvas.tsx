"use client";

import type { MapaEnlace, MapaNodo } from "@/app/types/mapa";
import { mapaFlowNodeTypes } from "@/components/desktop/mapa/mapa-nodo-node";
import { MapaTimelineGuides } from "@/components/desktop/mapa/mapa-timeline-guides";
import { toFlowEdges } from "@/lib/mapa-flow-edges";
import { posicionNodoEnLienzo } from "@/lib/mapa-layout";
import {
  deleteMapaEnlace,
  getSessionUserId,
  insertMapaEnlace,
  updateMapaNodoPosition,
} from "@/lib/mapa-queries";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";

type MapaCanvasProps = {
  nodos: MapaNodo[];
  enlaces: MapaEnlace[];
  onEditNodo: (id: number) => void;
  onPositionSaved?: (id: number, pos_x: number, pos_y: number) => void;
  onEnlaceCreated?: (enlace: MapaEnlace) => void;
  onEnlaceRemoved?: (id: number) => void;
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

function MapaFitView({ count }: { count: number }) {
  const { fitView } = useReactFlow();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (count === 0) {
      didFitRef.current = false;
      return;
    }
    if (didFitRef.current) return;
    didFitRef.current = true;
    const t = window.setTimeout(() => {
      void fitView({ padding: 0.25, maxZoom: 1, duration: 150 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [count, fitView]);

  return null;
}

function MapaCanvasInner({
  nodos,
  enlaces,
  onEditNodo,
  onPositionSaved,
  onEnlaceCreated,
  onEnlaceRemoved,
}: MapaCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(() =>
    toFlowNodes(nodos, onEditNodo),
  );
  const [edges, setEdges] = useState<Edge[]>(() => toFlowEdges(enlaces));
  const [status, setStatus] = useState<string | null>(null);

  const onEditStable = useCallback(
    (id: number) => onEditNodo(id),
    [onEditNodo],
  );

  useEffect(() => {
    setNodes(toFlowNodes(nodos, onEditStable));
  }, [nodos, onEditStable]);

  useEffect(() => {
    setEdges(toFlowEdges(enlaces));
  }, [enlaces]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      setStatus("Guardando posición…");
      const { error } = await updateMapaNodoPosition(
        Number(node.id),
        node.position.x,
        node.position.y,
      );
      setStatus(null);
      if (error) {
        setNodes(toFlowNodes(nodos, onEditStable));
        return;
      }
      onPositionSaved?.(Number(node.id), node.position.x, node.position.y);
    },
    [nodos, onEditStable, onPositionSaved],
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const origen_id = Number(connection.source);
      const destino_id = Number(connection.target);
      if (origen_id === destino_id) return;

      const duplicado = enlaces.some(
        (e) => e.origen_id === origen_id && e.destino_id === destino_id,
      );
      if (duplicado) {
        setStatus("Ese enlace ya existe.");
        window.setTimeout(() => setStatus(null), 2200);
        return;
      }

      setStatus("Creando enlace…");
      const userId = await getSessionUserId();
      if (!userId) {
        setStatus(null);
        return;
      }

      const { data, error } = await insertMapaEnlace(
        userId,
        origen_id,
        destino_id,
      );
      setStatus(null);

      if (error || !data) {
        setStatus(
          error?.includes("mapa_enlaces_origen_destino_uniq")
            ? "Ese enlace ya existe."
            : (error ?? "No se pudo crear el enlace."),
        );
        window.setTimeout(() => setStatus(null), 2500);
        return;
      }
      onEnlaceCreated?.(data);
    },
    [enlaces, onEnlaceCreated],
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      setStatus("Eliminando enlace…");
      for (const edge of deleted) {
        const { error } = await deleteMapaEnlace(Number(edge.id));
        if (!error) onEnlaceRemoved?.(Number(edge.id));
      }
      setStatus(null);
    },
    [onEnlaceRemoved],
  );

  if (nodos.length === 0) {
    return (
      <div className="mapa-canvas-empty flex h-[min(calc(100vh-14rem),720px)] items-center justify-center rounded-xl border border-dashed border-[var(--td-line)] bg-[var(--td-line-soft)]/25 px-6 py-16 text-center text-sm text-[var(--td-faint)]">
        Creá un nodo para verlo en el lienzo. Arrastrá para ubicarlo en la línea
        de tiempo.
      </div>
    );
  }

  return (
    <div className="mapa-canvas-wrap relative h-[min(calc(100vh-14rem),720px)] w-full overflow-hidden rounded-xl border border-[var(--td-line)] bg-[#f1f5f9]">
      {status ? (
        <p className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--td-ink-soft)] shadow-sm">
          {status}
        </p>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mapaFlowNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => void onConnect(c)}
        onEdgesDelete={(eds) => void onEdgesDelete(eds)}
        onNodeDragStop={(e, node) => void onNodeDragStop(e, node)}
        deleteKeyCode={["Backspace", "Delete"]}
        minZoom={0.2}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
      >
        <MapaTimelineGuides nodos={nodos} />
        <MapaFitView count={nodos.length} />
        <Background gap={28} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
        <MiniMap
          className="mapa-minimap"
          nodeColor="#94a3b8"
          nodeStrokeColor="#264a6e"
          maskColor="rgba(241, 245, 249, 0.82)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

/** Lienzo React Flow — solo shell escritorio (ADR 009). */
export function MapaCanvas(props: MapaCanvasProps) {
  return (
    <ReactFlowProvider>
      <MapaCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
