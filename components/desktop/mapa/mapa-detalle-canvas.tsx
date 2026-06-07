"use client";

import type {
  EnlaceHijoNodo,
  LienzoHijoPosicion,
} from "@/lib/mapa-detalle-types";
import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";
import { mapaDetalleEnlaceCounts } from "@/lib/mapa-detalle-enlace-counts";
import { insertEnlaceHijoNodo, deleteEnlaceHijoNodo } from "@/lib/mapa-detalle-enlace-queries";
import { upsertLienzoHijoPosicion } from "@/lib/mapa-detalle-posicion-queries";
import { toMapaDetalleFlowEdges } from "@/lib/mapa-detalle-flow-edges";
import { MapaDetalleTimelineGuides } from "@/components/desktop/mapa/mapa-detalle-timeline-guides";
import { MapaLienzoFitView } from "@/components/desktop/mapa/mapa-lienzo-fit-view";
import {
  buildMapaDetallePosicionesMap,
  computeMapaDetalleGridBounds,
  computeMapaDetalleLienzoContentRect,
  mapaDetalleDisplayToCanonical,
  mapaDetalleFlowNodeId,
  mapaDetallePositionDisplay,
  parseMapaDetalleFlowNodeId,
  resolveMapaDetallePosition,
} from "@/lib/mapa-detalle-layout";
import {
  carrilSpanFromIndices,
  mapaLienzoFlowHandleConfig,
  type MapaLienzoOrientacion,
} from "@/lib/mapa-lienzo-orientacion";
import { mapaDetalleFlowNodeTypes } from "@/components/desktop/mapa/mapa-hijo-node";
import { getSessionUserId } from "@/lib/mapa-queries";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type MapaDetalleCanvasProps = {
  scope: MapaDetalleScope;
  hijos: MapaDetalleHijo[];
  enlaces: EnlaceHijoNodo[];
  posiciones: LienzoHijoPosicion[];
  onEnlaceCreated?: (enlace: EnlaceHijoNodo) => void;
  onEnlaceRemoved?: (id: number) => void;
  onPositionSaved?: (
    kind: "curso" | "logro",
    id: number,
    pos_x: number,
    pos_y: number,
  ) => void;
  /** Botón + en card hijo — alta con enlace desde ese ítem. */
  onAddFromHijo?: (
    kind: MapaDetalleHijoKind,
    id: number,
    label: string,
  ) => void;
  orientacionLienzo?: MapaLienzoOrientacion;
};

function MapaDetalleCanvasInner({
  scope,
  hijos,
  enlaces,
  posiciones,
  onEnlaceCreated,
  onEnlaceRemoved,
  onPositionSaved,
  onAddFromHijo,
  orientacionLienzo = "xy",
}: MapaDetalleCanvasProps) {
  const posicionesMap = useMemo(
    () => buildMapaDetallePosicionesMap(posiciones),
    [posiciones],
  );

  const carrilSpan = useMemo(
    () =>
      carrilSpanFromIndices(
        computeMapaDetalleGridBounds(
          posiciones,
          hijos.length,
          orientacionLienzo,
        ).carriles,
      ),
    [posiciones, hijos.length, orientacionLienzo],
  );

  const contentRect = useMemo(
    () =>
      computeMapaDetalleLienzoContentRect(
        posiciones,
        hijos.length,
        orientacionLienzo,
      ),
    [posiciones, hijos.length, orientacionLienzo],
  );

  const fitKey = useMemo(() => {
    const bounds = computeMapaDetalleGridBounds(
      posiciones,
      hijos.length,
      orientacionLienzo,
    );
    return `${hijos.length}:${orientacionLienzo}:${bounds.etapas.join(",")}:${bounds.carriles.join(",")}`;
  }, [hijos.length, posiciones, orientacionLienzo]);

  const onAddLinkedStable = useCallback(
    (kind: MapaDetalleHijoKind, id: number) => {
      const hijo = hijos.find((h) => h.kind === kind && h.id === id);
      onAddFromHijo?.(kind, id, hijo?.nombre ?? `#${id}`);
    },
    [hijos, onAddFromHijo],
  );

  const buildNodes = useCallback(
    (): Node[] =>
      hijos.map((h, index) => {
        const { entrada, salida } = mapaDetalleEnlaceCounts(h.kind, h.id, enlaces);
        const canonical = resolveMapaDetallePosition(
          h.kind,
          h.id,
          index,
          posicionesMap,
        );
        const handles = mapaLienzoFlowHandleConfig(orientacionLienzo);
        return {
          id: mapaDetalleFlowNodeId(h.kind, h.id),
          type: "mapaHijo",
          position: mapaDetallePositionDisplay(
            canonical,
            orientacionLienzo,
            carrilSpan,
          ),
          targetPosition: handles.targetPosition,
          sourcePosition: handles.sourcePosition,
          data: {
            hijoId: h.id,
            nombre: h.nombre,
            descripcion: h.descripcion,
            kind: h.kind,
            onAddLinked: onAddFromHijo ? onAddLinkedStable : undefined,
            enlacesEntrada: entrada,
            enlacesSalida: salida,
            orientacionLienzo,
          },
          draggable: true,
          selectable: true,
          connectable: true,
        };
      }),
    [hijos, enlaces, posicionesMap, onAddFromHijo, onAddLinkedStable, orientacionLienzo, carrilSpan],
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

  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      const parsed = parseMapaDetalleFlowNodeId(node.id);
      if (!parsed) return;

      setStatus("Guardando posición…");
      const userId = await getSessionUserId();
      if (!userId) {
        setStatus(null);
        return;
      }

      const canonical = mapaDetalleDisplayToCanonical(
        { x: node.position.x, y: node.position.y },
        orientacionLienzo,
        carrilSpan,
      );

      const { error } = await upsertLienzoHijoPosicion(
        userId,
        scope,
        parsed,
        canonical.x,
        canonical.y,
      );
      setStatus(null);
      if (error) {
        setNodes(buildNodes());
        setStatus(error);
        window.setTimeout(() => setStatus(null), 2500);
        return;
      }
      onPositionSaved?.(
        parsed.kind,
        parsed.id,
        canonical.x,
        canonical.y,
      );
    },
    [scope, buildNodes, onPositionSaved, orientacionLienzo, carrilSpan],
  );

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

  if (hijos.length === 0) {
    return (
      <div className="mapa-detalle-canvas-empty flex min-h-0 flex-1 items-center justify-center rounded-xl border border-[var(--td-line)] bg-[#f8fafc] px-6 py-16 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay ítems. Usá el botón al pie del detalle o el + en cada card.
      </div>
    );
  }

  return (
    <div className="mapa-detalle-canvas-wrap relative min-h-0 w-full flex-1 overflow-hidden rounded-xl border border-[var(--td-line)] bg-[#f8fafc]">
      {status ? (
        <p className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--td-ink-soft)] shadow-sm">
          {status}
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
        onNodeDragStop={(e, node) => void onNodeDragStop(e, node)}
        deleteKeyCode={["Backspace", "Delete"]}
        nodesConnectable
        elementsSelectable
        minZoom={0.25}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <MapaDetalleTimelineGuides
          posiciones={posiciones}
          itemCount={hijos.length}
          orientacion={orientacionLienzo}
        />
        <MapaLienzoFitView contentRect={contentRect} fitKey={fitKey} />
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
