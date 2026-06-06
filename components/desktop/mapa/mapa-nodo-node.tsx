"use client";

import type { MapaObjetivoId } from "@/app/types/mapa";
import {
  mapaObjetivoColor,
  mapaObjetivoToneClass,
} from "@/lib/mapa-objetivo";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { MapaNodoNodeData } from "@/components/desktop/mapa/mapa-nodo-node-types";

function EnlaceBadge({ label, count }: { label: string; count: number }) {
  if (count <= 0) return null;
  return (
    <span className="mapa-flow-node-badge" title={`${label}: ${count}`}>
      {label} {count}
    </span>
  );
}

/** Card de nodo en el lienzo (ADR 009). Color por objetivo (etapa). */
export function MapaNodoNode({ data, selected }: NodeProps) {
  const {
    nodo,
    onEdit,
    enlacesEntrada = 0,
    enlacesSalida = 0,
    objetivoId,
    objetivoNombre,
  } = data as MapaNodoNodeData;

  const toneClass =
    objetivoId != null
      ? mapaObjetivoToneClass(objetivoId)
      : "mapa-flow-node--neutral";
  const accent =
    objetivoId != null ? mapaObjetivoColor(objetivoId) : "#94a3b8";

  return (
    <div
      className={`${toneClass} mapa-flow-node group max-w-[240px] rounded-xl border bg-white shadow-[0_4px_18px_-6px_rgba(27,34,43,0.18)] transition-[box-shadow,transform] duration-150 ${
        selected ? "mapa-flow-node--selected" : ""
      }`}
      style={
        objetivoId != null
          ? { borderLeftWidth: 4, borderLeftColor: accent }
          : undefined
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="mapa-flow-handle mapa-flow-handle--target"
        title="Recibe enlaces (entrada)"
      />

      <div className="px-3 pb-2.5 pt-2">
        {objetivoId != null && objetivoNombre ? (
          <span
            className="mapa-flow-node-objetivo-badge mb-1.5 inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide"
            style={{
              color: accent,
              backgroundColor: `${accent}18`,
              border: `1px solid ${accent}40`,
            }}
            title={objetivoNombre}
          >
            {objetivoNombre}
          </span>
        ) : null}

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
