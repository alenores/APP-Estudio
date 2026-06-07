"use client";

import type { EnlaceTema, Tema } from "@/app/types/estudio";
import type { MapaEnlace, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import { mapaFlowNodeTypes } from "@/components/desktop/mapa/mapa-nodo-node";
import { MapaObjetivoLeyenda } from "@/components/desktop/mapa/mapa-objetivo-ui";
import { MapaTimelineGuides } from "@/components/desktop/mapa/mapa-timeline-guides";
import type { MapaGrafoModo } from "@/lib/mapa-lienzo-types";
import {
  carrilSpanFromIndices,
  projectDisplayToCanonical,
  type MapaLienzoOrientacion,
} from "@/lib/mapa-lienzo-orientacion";
import { computeMapaGridBounds } from "@/lib/mapa-grid-bounds";
import { toFlowEdges } from "@/lib/mapa-flow-edges";
import { buildMapaFlowNodesForGrafo } from "@/lib/mapa-flow-nodes";
import { buildMapaTemaFlowCardDataMap } from "@/lib/mapa-tema-flow-card";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import {
  mapaObjetivoColor,
  mapaObjetivoIdFromNodo,
  type MapaObjetivoFiltro,
} from "@/lib/mapa-objetivo";
import {
  deleteMapaEnlace,
  getSessionUserId,
  insertMapaEnlace,
  updateMapaNodoPosition,
} from "@/lib/mapa-queries";
import {
  deleteEnlaceTema,
  insertEnlaceTema,
  updateTemaPosition,
} from "@/lib/temas-lienzo-queries";
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

type MapaCanvasProps = {
  grafoModo: MapaGrafoModo;
  nodos: MapaNodo[];
  temas: Tema[];
  enlaces: MapaEnlace[] | EnlaceTema[];
  objetivos: MapaObjetivo[];
  filtroObjetivo: MapaObjetivoFiltro;
  onEditItem: (id: number) => void;
  onPositionSaved?: (id: number, pos_x: number, pos_y: number) => void;
  onEnlaceCreated?: (enlace: MapaEnlace | EnlaceTema) => void;
  onEnlaceRemoved?: (id: number) => void;
  /** Click en card (no en Editar) — abre lienzo detalle capa 1 (ADR 010). */
  onOpenDetalle?: (id: number) => void;
  /** Botón + en card — alta con enlace desde ese ítem. */
  onAddLinkedItem?: (id: number) => void;
  orientacionLienzo?: MapaLienzoOrientacion;
};

function MapaFitView({
  count,
  orientacionLienzo,
}: {
  count: number;
  orientacionLienzo: MapaLienzoOrientacion;
}) {
  const { fitView } = useReactFlow();
  const didFitRef = useRef(false);
  const orientacionRef = useRef(orientacionLienzo);

  useEffect(() => {
    if (orientacionRef.current !== orientacionLienzo) {
      orientacionRef.current = orientacionLienzo;
      didFitRef.current = false;
    }
  }, [orientacionLienzo]);

  useEffect(() => {
    if (count === 0) {
      didFitRef.current = false;
      return;
    }
    const runFit = () => {
      void fitView({ padding: 0.25, maxZoom: 1, duration: 150 });
    };
    if (didFitRef.current) return;
    didFitRef.current = true;
    const t = window.setTimeout(runFit, 50);
    const t2 = window.setTimeout(runFit, 280);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [count, fitView]);

  return null;
}

function MapaCanvasInner({
  grafoModo,
  nodos,
  temas,
  enlaces,
  objetivos,
  filtroObjetivo,
  onEditItem,
  onPositionSaved,
  onEnlaceCreated,
  onEnlaceRemoved,
  onOpenDetalle,
  onAddLinkedItem,
  orientacionLienzo = "xy",
}: MapaCanvasProps) {
  const onEditStable = useCallback(
    (id: number) => onEditItem(id),
    [onEditItem],
  );
  const onAddLinkedStable = useCallback(
    (id: number) => onAddLinkedItem?.(id),
    [onAddLinkedItem],
  );

  const { cacheData } = useEstudioData();

  const temaCardDataMap = useMemo(() => {
    if (grafoModo !== "temas") return undefined;
    return buildMapaTemaFlowCardDataMap(
      cacheData,
      temas.map((t) => t.id),
    );
  }, [grafoModo, cacheData, temas]);

  const lienzoItems = grafoModo === "nodos" ? nodos : temas;
  const itemCount = lienzoItems.length;

  const carrilSpan = useMemo(
    () =>
      carrilSpanFromIndices(
        computeMapaGridBounds(lienzoItems, orientacionLienzo).carriles,
      ),
    [lienzoItems, orientacionLienzo],
  );

  const nodosById = useMemo(
    () => new Map(nodos.map((n) => [n.id, n])),
    [nodos],
  );

  const flowEdgeOptions = useMemo(
    () =>
      grafoModo === "nodos"
        ? { nodosById, filtroObjetivo }
        : undefined,
    [grafoModo, nodosById, filtroObjetivo],
  );

  const buildNodes = useCallback(
    () =>
      buildMapaFlowNodesForGrafo({
        modo: grafoModo,
        nodos,
        temas,
        enlaces,
        objetivos,
        filtroObjetivo,
        onEditItem: onEditStable,
        onAddLinkedItem: onAddLinkedItem ? onAddLinkedStable : undefined,
        temaCardDataMap,
        orientacionLienzo,
        carrilSpan,
      }),
    [
      grafoModo,
      nodos,
      temas,
      enlaces,
      objetivos,
      filtroObjetivo,
      onEditStable,
      onAddLinkedStable,
      onAddLinkedItem,
      temaCardDataMap,
      orientacionLienzo,
      carrilSpan,
    ],
  );

  const [nodes, setNodes] = useState<Node[]>(() => buildNodes());
  const [edges, setEdges] = useState<Edge[]>(() =>
    toFlowEdges(enlaces, flowEdgeOptions),
  );
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setNodes(buildNodes());
  }, [buildNodes]);

  useEffect(() => {
    setEdges(toFlowEdges(enlaces, flowEdgeOptions));
  }, [enlaces, flowEdgeOptions]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onNodeDragStop = useCallback(
    async (_event: unknown, node: Node) => {
      setStatus("Guardando posición…");
      const id = Number(node.id);
      const canonical = projectDisplayToCanonical(
        { x: node.position.x, y: node.position.y },
        { orientacion: orientacionLienzo, carrilSpan },
      );
      const { error } =
        grafoModo === "nodos"
          ? await updateMapaNodoPosition(id, canonical.x, canonical.y)
          : await updateTemaPosition(id, canonical.x, canonical.y);
      setStatus(null);
      if (error) {
        setNodes(buildNodes());
        return;
      }
      onPositionSaved?.(id, canonical.x, canonical.y);
    },
    [grafoModo, buildNodes, onPositionSaved, orientacionLienzo, carrilSpan],
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

      if (grafoModo === "nodos") {
        const { data, error } = await insertMapaEnlace(
          userId,
          origen_id,
          destino_id,
        );
        setStatus(null);
        if (error || !data) {
          setStatus(
            error?.includes("enlaces_nodos") ||
              error?.includes("origen_destino")
              ? "Ese enlace ya existe."
              : (error ?? "No se pudo crear el enlace."),
          );
          window.setTimeout(() => setStatus(null), 2500);
          return;
        }
        onEnlaceCreated?.(data);
        return;
      }

      const { data, error } = await insertEnlaceTema(
        userId,
        origen_id,
        destino_id,
      );
      setStatus(null);
      if (error || !data) {
        setStatus(
          error?.includes("enlaces_temas") || error?.includes("origen_destino")
            ? "Ese enlace ya existe."
            : (error ?? "No se pudo crear el enlace."),
        );
        window.setTimeout(() => setStatus(null), 2500);
        return;
      }
      onEnlaceCreated?.(data);
    },
    [enlaces, grafoModo, onEnlaceCreated],
  );

  const onEdgesDelete = useCallback(
    async (deleted: Edge[]) => {
      setStatus("Eliminando enlace…");
      for (const edge of deleted) {
        const id = Number(edge.id);
        const { error } =
          grafoModo === "nodos"
            ? await deleteMapaEnlace(id)
            : await deleteEnlaceTema(id);
        if (!error) onEnlaceRemoved?.(id);
      }
      setStatus(null);
    },
    [grafoModo, onEnlaceRemoved],
  );

  if (itemCount === 0) {
    return (
      <div className="mapa-canvas-empty flex min-h-0 flex-1 items-center justify-center bg-[#f1f5f9] px-6 py-16 text-center text-sm text-[var(--td-faint)]">
        {grafoModo === "nodos"
          ? "Creá un nodo para verlo en el lienzo. Arrastrá para ubicarlo en la línea de tiempo."
          : "Creá un tema para verlo en el lienzo. Arrastrá para ubicarlo en la línea de tiempo."}
      </div>
    );
  }

  return (
    <div className="mapa-canvas-wrap relative min-h-0 w-full flex-1 overflow-hidden rounded-md bg-[#f1f5f9]">
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
        onNodeClick={(_e, node) => onOpenDetalle?.(Number(node.id))}
        deleteKeyCode={["Backspace", "Delete"]}
        minZoom={0.2}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
      >
        <MapaTimelineGuides items={lienzoItems} orientacion={orientacionLienzo} />
        {grafoModo === "nodos" ? (
          <MapaObjetivoLeyenda objetivos={objetivos} />
        ) : null}
        <MapaFitView count={itemCount} orientacionLienzo={orientacionLienzo} />
        <Background gap={28} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} />
        <MiniMap
          className="mapa-minimap"
          nodeColor={(node) => {
            if (grafoModo === "temas") return "var(--estudio-shell-tema)";
            const nodo = (node.data as { nodo?: MapaNodo })?.nodo;
            const objId = mapaObjetivoIdFromNodo(nodo);
            return objId != null ? mapaObjetivoColor(objId) : "#94a3b8";
          }}
          nodeStrokeColor="#264a6e"
          maskColor="rgba(241, 245, 249, 0.82)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

/** Lienzo React Flow dual (nodos | temas) — solo shell escritorio (ADR 009). */
export function MapaCanvas(props: MapaCanvasProps) {
  return (
    <div className="mapa-canvas-host flex min-h-0 flex-1 flex-col">
      <ReactFlowProvider>
        <MapaCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
