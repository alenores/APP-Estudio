"use client";

import type { MapaNodo } from "@/app/types/mapa";
import {
  mapaNodoToneClass,
  mapaNodoToneFromCarril,
} from "@/lib/mapa-nodo-ui";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

export type MapaNodoNodeData = {
  nodo: MapaNodo;
  onEdit: (id: number) => void;
  enlacesEntrada?: number;
  enlacesSalida?: number;
};

function EnlaceBadge({ label, count }: { label: string; count: number }) {
  if (count <= 0) return null;
  return (
    <span className="mapa-flow-node-badge" title={`${label}: ${count}`}>
      {label} {count}
    </span>
  );
}

/** Card de nodo en el lienzo (ADR 009). */
export function MapaNodoNode({ data, selected }: NodeProps) {
  const { nodo, onEdit, enlacesEntrada = 0, enlacesSalida = 0 } =
    data as MapaNodoNodeData;
  const tone = mapaNodoToneFromCarril(nodo.carril);
  const toneClass = mapaNodoToneClass(tone);

  return (
    <div
      className={`${toneClass} group max-w-[240px] rounded-xl border bg-white shadow-[0_4px_18px_-6px_rgba(27,34,43,0.18)] transition-[box-shadow,transform] duration-150 ${
        selected ? "mapa-flow-node--selected" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="mapa-flow-handle mapa-flow-handle--target"
        title="Recibe enlaces (entrada)"
      />

      <div className="mapa-flow-node-strip" aria-hidden />

      <div className="px-3 pb-2.5 pt-2">
        <div className="flex items-start justify-between gap-2">
          <div className="mapa-flow-node-meta min-w-0">
            <span className="mapa-flow-node-etapa">Etapa {nodo.etapa}</span>
            <span className="mapa-flow-node-dot" aria-hidden>
              ·
            </span>
            <span className="mapa-flow-node-carril">Carril {nodo.carril}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(nodo.id);
            }}
            className={`mapa-flow-node-edit shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-opacity ${
              selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
            title="Editar nodo"
          >
            Editar
          </button>
        </div>

        <p className="mapa-flow-node-title mt-1.5 text-[15px] font-bold leading-snug">
          {nodo.titulo}
        </p>

        {nodo.descripcion?.trim() ? (
          <p className="mapa-flow-node-desc mt-1 line-clamp-2 text-[11px] leading-snug">
            {nodo.descripcion}
          </p>
        ) : null}

        {enlacesEntrada > 0 || enlacesSalida > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            <EnlaceBadge label="←" count={enlacesEntrada} />
            <EnlaceBadge label="→" count={enlacesSalida} />
          </div>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="mapa-flow-handle mapa-flow-handle--source"
        title="Creá enlaces (salida)"
      />
    </div>
  );
}

export const mapaFlowNodeTypes = {
  mapaNodo: MapaNodoNode,
} as const;
