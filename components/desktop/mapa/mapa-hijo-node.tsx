"use client";

import type { MapaHijoNodeData } from "@/components/desktop/mapa/mapa-hijo-node-types";
import { MapaFlowNodeCardActions } from "@/components/desktop/mapa/mapa-flow-node-card-actions";
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

/** Card de curso o registro logro en lienzo detalle (capa 1). */
export function MapaHijoNode({ data, selected }: NodeProps) {
  const {
    hijoId,
    nombre,
    descripcion,
    kind,
    onAddLinked,
    enlacesEntrada = 0,
    enlacesSalida = 0,
  } = data as MapaHijoNodeData;
  const toneClass =
    kind === "logro" ? "mapa-flow-node--logro" : "mapa-flow-node--tema";

  const addTitle =
    kind === "logro"
      ? "Nuevo logro enlazado desde aquí"
      : "Nuevo curso enlazado desde aquí";

  return (
    <div
      className={`mapa-flow-node mapa-detalle-hijo-node group ${toneClass} max-w-[240px] rounded-xl border bg-white shadow-[0_4px_18px_-6px_rgba(27,34,43,0.18)] ${
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
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <span
            className={`mapa-flow-node-clasificacion-badge inline-block rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
              kind === "logro"
                ? "mapa-flow-node-clasificacion-badge--logro"
                : "mapa-flow-node-tema-badge"
            }`}
          >
            {kind === "logro" ? "Logro" : "Curso"}
          </span>
          <MapaFlowNodeCardActions
            selected={selected}
            onAdd={
              onAddLinked ? () => onAddLinked(kind, hijoId) : undefined
            }
            addTitle={addTitle}
          />
        </div>
        <p className="mapa-flow-node-title text-[15px] font-bold leading-snug">
          {nombre}
        </p>
        {descripcion?.trim() ? (
          <p className="mapa-flow-node-desc mt-1 line-clamp-2 text-[11px] leading-snug">
            {descripcion}
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

export const mapaDetalleFlowNodeTypes = {
  mapaHijo: MapaHijoNode,
} as const;
