"use client";

import type { MapaDetalleHijo } from "@/lib/mapa-detalle-types";
import {
  mapaDetalleFlowNodeId,
  mapaDetalleGridPosition,
} from "@/lib/mapa-detalle-layout";
import { mapaDetalleFlowNodeTypes } from "@/components/desktop/mapa/mapa-hijo-node";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import { useEffect, useMemo, useRef } from "react";

type MapaDetalleCanvasProps = {
  hijos: MapaDetalleHijo[];
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

function MapaDetalleCanvasInner({ hijos }: MapaDetalleCanvasProps) {
  const nodes: Node[] = useMemo(
    () =>
      hijos.map((h, index) => ({
        id: mapaDetalleFlowNodeId(h.kind, h.id),
        type: "mapaHijo",
        position: mapaDetalleGridPosition(index),
        data: {
          nombre: h.nombre,
          descripcion: h.descripcion,
          kind: h.kind,
        },
        draggable: false,
        selectable: true,
      })),
    [hijos],
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
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={mapaDetalleFlowNodeTypes}
        nodesConnectable={false}
        elementsSelectable={false}
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
