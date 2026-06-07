"use client";

import type { EnlaceHijoNodo } from "@/lib/mapa-detalle-types";
import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { mapaDetalleEnlaceCounts } from "@/lib/mapa-detalle-enlace-counts";
import { insertEnlaceHijoNodo, deleteEnlaceHijoNodo } from "@/lib/mapa-detalle-enlace-queries";
import { toMapaDetalleFlowEdges } from "@/lib/mapa-detalle-flow-edges";
import {
  mapaDetalleFlowNodeId,
  mapaDetalleGridPosition,
  parseMapaDetalleFlowNodeId,
} from "@/lib/mapa-detalle-layout";
import { mapaDetalleFlowNodeTypes } from "@/components/desktop/mapa/mapa-hijo-node";
import { getSessionUserId } from "@/lib/mapa-queries";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MapaDetalleCanvasProps = {
  scope: MapaDetalleScope;
  hijos: MapaDetalleHijo[];
  enlaces: EnlaceHijoNodo[];
  onEnlaceCreated?: (enlace: EnlaceHijoNodo) => void;
  onEnlaceRemoved?: (id: number) => void;
};

function MapaDetalleFitView({ count }: { count: number }) {
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
      void fitView({ padding: 0.3, maxZoom: 1, duration: 150 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [count, fitView]);

  return null;
}

function MapaDetalleCanvasInner({
  scope,
  hijos,
  enlaces,
  onEnlaceCreated,
  onEnlaceRemoved,
}: MapaDetalleCanvasProps) {
  const buildNodes = useCallback(
    (): Node[] =>
      hijos.map((h, index) => {
        const { entrada, salida } = mapaDetalleEnlaceCounts(h.kind, h.id, enlaces);
        return {
          id: mapaDetalleFlowNodeId(h.kind, h.id),
          type: "mapaHijo",
          position: mapaDetalleGridPosition(index),
          data: {
            nombre: h.nombre,
            descripcion: h.descripcion,
            kind: h.kind,
            enlacesEntrada: entrada,
            enlacesSalida: salida,
          },
          draggable: false,
          selectable: true,
          connectable: true,
        };
      }),
    [hijos, enlaces],
  );

  const [nodes, setNodes] = useState<Node[]>(() => buildNodes());
  const [edges, setEdges] = useState<Edge[]>(() => toMapaDetalleFlowEdges(enlaces));
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setNodes(buildNodes());
  }, [buildNodes]);

  useEffect(() => {
    setEdges(toMapaDetalleFlowEdges(enlaces));
  }, [enlaces]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const origen = parseMapaDetalleFlowNodeId(connection.source);
      const destino = parseMapaDetalleFlowNodeId(connection.target);
      if (!origen || !destino) return;

      const duplicado = enlaces.some(
        (e) =>
          e.origen_kind === origen.kind &&
          e.origen_id === origen.id &&
          e.destino_kind === destino.kind &&
          e.destino_id === destino.id,
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

      const { data, error } = await insertEnlaceHijoNodo(
        userId,
        scope,
        origen,
        destino,
      );
      setStatus(null);
      if (error || !data) {
        setStatus(
          error?.includes("enlaces_hijos_nodos") ||
            error?.includes("origen_destino")
            ? "Ese enlace ya existe."
            : (error ?? "No se pudo crear el enlace."),
        );
        window.setTimeout(() => setStatus(null), 2500);
        return;
      }
      onEnlaceCreated?.(data);
    },
    [enlaces, scope, onEnlaceCreated],
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      setStatus("Eliminando enlace…");
      for (const edge of deleted) {
        const id = Number(edge.id);
        const { error } = await deleteEnlaceHijoNodo(id);
        if (!error) onEnlaceRemoved?.(id);
      }
      setStatus(null);
    },
    [onEnlaceRemoved],
  );

  const hint = useMemo(
    () =>
      hijos.length > 0
        ? "Arrastrá entre los puntos de las cards para crear enlaces. Delete para borrar."
        : null,
    [hijos.length],
  );

  if (hijos.length === 0) {
    return (
      <div className="mapa-detalle-canvas-empty flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay ítems. Creálos desde el explorador.
      </div>
    );
  }

  return (
    <div className="mapa-detalle-canvas-wrap relative min-h-0 w-full flex-1 overflow-hidden rounded-md bg-[#f8fafc]">
      {status ? (
        <p className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--td-ink-soft)] shadow-sm">
          {status}
        </p>
      ) : null}
      {hint ? (
        <p className="pointer-events-none absolute left-3 top-3 z-10 max-w-[min(420px,70%)] rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-medium text-[var(--td-faint)] shadow-sm">
          {hint}
        </p>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mapaDetalleFlowNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => void onConnect(c)}
        onEdgesDelete={(eds) => void onEdgesDelete(eds)}
        deleteKeyCode={["Backspace", "Delete"]}
        nodesConnectable
        elementsSelectable
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <MapaDetalleFitView count={hijos.length} />
        <Background gap={28} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
        <MiniMap
          className="mapa-minimap"
          nodeColor={(node) =>
            (node.data as { kind?: string })?.kind === "logro"
              ? "var(--estudio-shell-curso)"
              : "var(--estudio-shell-tema)"
          }
          nodeStrokeColor="#264a6e"
          maskColor="rgba(248, 250, 252, 0.85)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export function MapaDetalleCanvas(props: MapaDetalleCanvasProps) {
  return (
    <ReactFlowProvider>
      <MapaDetalleCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
