"use client";

import type { MapaTemaNodeData } from "@/components/desktop/mapa/mapa-tema-node-types";
import { MapaFlowNodeCardActions } from "@/components/desktop/mapa/mapa-flow-node-card-actions";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
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

/** Card de tema en el lienzo — misma visual que explorador + meta etapa/carril/enlaces. */
export function MapaTemaNode({ data, selected }: NodeProps) {
  const {
    tema,
    onEdit,
    onAddLinked,
    enlacesEntrada = 0,
    enlacesSalida = 0,
    cardData,
  } = data as MapaTemaNodeData;

  const lienzoMeta = (
    <div className="mapa-flow-tema-lienzo-meta flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-[var(--td-line)]/80 px-3 py-2">
      <div className="mapa-flow-tema-lienzo-pos flex min-w-0 flex-wrap items-center gap-x-1 text-[10px] font-semibold">
        <span>Etapa {tema.etapa}</span>
        <span className="text-[var(--td-faint)]" aria-hidden>
          ·
        </span>
        <span>Carril {tema.carril}</span>
      </div>
      {enlacesEntrada > 0 || enlacesSalida > 0 ? (
        <div className="flex flex-wrap gap-1">
          <EnlaceBadge label="←" count={enlacesEntrada} />
          <EnlaceBadge label="→" count={enlacesSalida} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={`mapa-flow-tema-node group relative w-[min(280px,90vw)] ${
        selected ? "mapa-flow-tema-node--selected" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="mapa-flow-handle mapa-flow-handle--target"
        title="Recibe enlaces (entrada)"
      />

      <div className="relative">
        <EstudioProgressCard
          kind="tema"
          nombre={tema.nombre}
          derivados={cardData.derivados}
          fechaParen={cardData.fechaParen}
          hijosStats={cardData.hijosStats}
          hijosLabel="cursos"
          explorerId={tema.id}
          selected={selected}
          footerSlot={lienzoMeta}
          className="mapa-flow-tema-progress-card shadow-[0_4px_18px_-6px_rgba(27,34,43,0.18)]"
        />
        <div className="pointer-events-none absolute right-2 top-2 z-[2]">
          <div className="pointer-events-auto">
            <MapaFlowNodeCardActions
              selected={selected}
              onEdit={() => onEdit(tema.id)}
              editLabel="Editar"
              onAdd={
                onAddLinked ? () => onAddLinked(tema.id) : undefined
              }
              addTitle="Nuevo tema enlazado desde aquí"
            />
          </div>
        </div>
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
