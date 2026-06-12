"use client";

import type {
  DefinicionGeneral,
  EnlaceDefinicionGeneral,
} from "@/app/types/desarrollos";
import { MapaLienzoFitView } from "@/components/desktop/mapa/mapa-lienzo-fit-view";
import { MapaTimelineGuides } from "@/components/desktop/mapa/mapa-timeline-guides";
import { toFlowEdges } from "@/lib/mapa-flow-edges";
import { mapaGrafoEnlaceCounts } from "@/lib/mapa-grafo-enlaces";
import {
  carrilSpanFromIndices,
  MAPA_LIENZO_ORIGIN,
  mapaLienzoFlowHandleConfig,
  posicionEnLienzoDisplay,
  projectDisplayToCanonical,
  type MapaLienzoOrientacion,
} from "@/lib/mapa-lienzo-orientacion";
import { computeMapaGridBounds, computeMapaMacroContentRect } from "@/lib/mapa-grid-bounds";
import {
  deleteEnlaceDefinicionGeneral,
  getSessionUserId,
  insertEnlaceDefinicionGeneral,
  updateDefinicionGeneralPosition,
} from "@/lib/desarrollos-lienzo-queries";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type MapaDesarrolloCanvasProps = {
  generales: DefinicionGeneral[];
  enlaces: EnlaceDefinicionGeneral[];
  onEditItem: (id: number) => void;
  onPositionSaved?: (id: number, pos_x: number, pos_y: number) => void;
  onEnlaceCreated?: (enlace: EnlaceDefinicionGeneral) => void;
  onEnlaceRemoved?: (id: number) => void;
  onOpenDetalle?: (id: number) => void;
  orientacionLienzo?: MapaLienzoOrientacion;
};

function MapaDesarrolloCanvasInner({
  generales,
  enlaces,
  onEditItem,
  onPositionSaved,
  onEnlaceCreated,
  onEnlaceRemoved,
  onOpenDetalle,
  orientacionLienzo = "xy",
}: MapaDesarrolloCanvasProps) {
  const carrilSpan = useMemo(
    () =>
      carrilSpanFromIndices(
        computeMapaGridBounds(generales, orientacionLienzo).carriles,
      ),
    [generales, orientacionLienzo],
  );

  const contentRect = useMemo(
    () => computeMapaMacroContentRect(generales, orientacionLienzo),
    [generales, orientacionLienzo],
  );

  const initialNodes = useMemo((): Node[] => {
    return generales.map((g) => {
      const pos = posicionEnLienzoDisplay(
        g,
        orientacionLienzo,
        MAPA_LIENZO_ORIGIN,
        carrilSpan,
      );
      const handles = mapaLienzoFlowHandleConfig(orientacionLienzo);
      const { entrada, salida } = mapaGrafoEnlaceCounts(g.id, enlaces);
      return {
        id: String(g.id),
        type: "default",
        position: pos,
        targetPosition: handles.targetPosition,
        sourcePosition: handles.sourcePosition,
        data: {
          label: (
            <div className="rounded-lg border-2 border-violet-400 bg-violet-50 px-3 py-2 text-left shadow-sm">
              <p className="text-[10px] font-bold uppercase text-violet-700">General</p>
              <p className="font-semibold text-sm">{g.nombre}</p>
              <p className="text-[10px] text-violet-800/70">
                ↓{entrada} ↑{salida}
              </p>
            </div>
          ),
        },
        draggable: true,
      };
    });
  }, [generales, enlaces, orientacionLienzo, carrilSpan]);

  const initialEdges = useMemo(
    () => toFlowEdges(enlaces.map((e) => ({ ...e, id: e.id }))),
    [enlaces],
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const fitKey = useMemo(
    () => `desarrollo:${generales.length}:${orientacionLienzo}`,
    [generales.length, orientacionLienzo],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      const id = Number.parseInt(node.id, 10);
      const canonical = projectDisplayToCanonical(
        { x: node.position.x, y: node.position.y },
        { orientacion: orientacionLienzo, carrilSpan },
      );
      const { error } = await updateDefinicionGeneralPosition(
        id,
        canonical.x,
        canonical.y,
      );
      if (!error) {
        onPositionSaved?.(id, canonical.x, canonical.y);
      }
    },
    [orientacionLienzo, carrilSpan, onPositionSaved],
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const origen_id = Number.parseInt(connection.source, 10);
      const destino_id = Number.parseInt(connection.target, 10);
      const userId = await getSessionUserId();
      if (!userId) return;
      const { data, error } = await insertEnlaceDefinicionGeneral(
        userId,
        origen_id,
        destino_id,
      );
      if (data && !error) {
        onEnlaceCreated?.(data);
      }
    },
    [onEnlaceCreated],
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      for (const edge of deleted) {
        const id = Number.parseInt(edge.id, 10);
        if (!Number.isFinite(id)) continue;
        const { error } = await deleteEnlaceDefinicionGeneral(id);
        if (!error) onEnlaceRemoved?.(id);
      }
    },
    [onEnlaceRemoved],
  );

  return (
    <div className="mapa-canvas-host relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={(c) => void onConnect(c)}
        onEdgesDelete={(eds) => void onEdgesDelete(eds)}
        onNodeDoubleClick={(_, node) => onOpenDetalle?.(Number.parseInt(node.id, 10))}
        onNodeClick={(_, node) => onEditItem(Number.parseInt(node.id, 10))}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} />
        <Controls />
        <MiniMap />
        <MapaTimelineGuides items={generales} orientacion={orientacionLienzo} />
        <MapaLienzoFitView contentRect={contentRect} fitKey={fitKey} />
      </ReactFlow>
    </div>
  );
}

export function MapaDesarrolloCanvas(props: MapaDesarrolloCanvasProps) {
  return (
    <ReactFlowProvider>
      <MapaDesarrolloCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
