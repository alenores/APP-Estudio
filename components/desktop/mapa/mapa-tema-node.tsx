"use client";

import type { MapaTemaNodeData } from "@/components/desktop/mapa/mapa-tema-node-types";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

function EnlaceBadge({ label, count }: { label: string; count: number }) {
  if (count <= 0) return null;
  return (
    <span className="mapa-flow-node-badge" title={`${label}: ${count}`}>
      {label} {count}
    </span>
  );
}

/** Card de tema en el lienzo (ADR 009 fase 9b). Tono shell tema. */
export function MapaTemaNode({ data, selected }: NodeProps) {
  const {
    tema,
    onEdit,
    enlacesEntrada = 0,
    enlacesSalida = 0,
  } = data as MapaTemaNodeData;

  return (
    <div
      className={`mapa-flow-node mapa-flow-node--tema group max-w-[240px] rounded-xl border bg-white shadow-[0_4px_18px_-6px_rgba(27,34,43,0.18)] transition-[box-shadow,transform] duration-150 ${
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

      <div className="px-3 pb-2.5 pt-2">
        <span className="mapa-flow-node-tema-badge mb-1.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
          Tema
        </span>

        <div className="flex items-start justify-between gap-2">
          <div className="mapa-flow-node-meta min-w-0">
            <span className="mapa-flow-node-etapa">Etapa {tema.etapa}</span>
            <span className="mapa-flow-node-dot" aria-hidden>
              ·
            </span>
            <span className="mapa-flow-node-carril">Carril {tema.carril}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tema.id);
            }}
            className={`mapa-flow-node-edit shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-opacity ${
              selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
            title="Editar tema"
          >
            Editar
          </button>
        </div>

        <p className="mapa-flow-node-title mt-1.5 text-[15px] font-bold leading-snug">
          {tema.nombre}
        </p>

        {tema.descripcion?.trim() ? (
          <p className="mapa-flow-node-desc mt-1 line-clamp-2 text-[11px] leading-snug">
            {tema.descripcion}
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
