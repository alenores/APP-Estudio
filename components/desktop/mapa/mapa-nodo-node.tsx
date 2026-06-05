"use client";

import type { MapaNodo } from "@/app/types/mapa";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

export type MapaNodoNodeData = {
  nodo: MapaNodo;
  onEdit: (id: number) => void;
};

/** Card de nodo en el lienzo (ADR 009 — fase 2). */
export function MapaNodoNode({ data }: NodeProps) {
  const { nodo, onEdit } = data as MapaNodoNodeData;

  return (
    <div className="mapa-flow-node group max-w-[220px] rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 shadow-[var(--td-shadow)]">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-[var(--td-navy)] !bg-white"
      />
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--td-faint)]">
        Etapa {nodo.etapa} · Carril {nodo.carril}
      </p>
      <p className="mt-0.5 text-sm font-bold leading-snug text-[var(--td-ink)]">
        {nodo.titulo}
      </p>
      {nodo.descripcion?.trim() ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--td-ink-soft)]">
          {nodo.descripcion}
        </p>
      ) : null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(nodo.id);
        }}
        className="mt-2 rounded-md border border-[var(--td-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--td-navy)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--td-line-soft)]"
      >
        Editar
      </button>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-[var(--td-navy)] !bg-white"
      />
    </div>
  );
}

export const mapaFlowNodeTypes = {
  mapaNodo: MapaNodoNode,
} as const;
