"use client";

import type { MapaNodoNodeData } from "@/components/desktop/mapa/mapa-nodo-node-types";
import { MapaFlowNodeCardActions } from "@/components/desktop/mapa/mapa-flow-node-card-actions";
import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";
import {
  MapaFlowEnlaceHandleSource,
  MapaFlowEnlaceHandleTarget,
} from "@/components/desktop/mapa/mapa-flow-enlace-handles";
import { MapaTemaNode } from "@/components/desktop/mapa/mapa-tema-node";
import { mapaLienzoFlowHandleConfig } from "@/lib/mapa-lienzo-orientacion";
import {
  mapaObjetivoColor,
  mapaObjetivoToneClass,
} from "@/lib/mapa-objetivo";
import {
  mapaNodoClasificacionClass,
  nodoClasificacionLabel,
} from "@/lib/mapa-nodo-tipo";
import type { NodeProps } from "@xyflow/react";

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
    onAddLinked,
    enlacesEntrada = 0,
    enlacesSalida = 0,
    objetivoId,
    objetivoNombre,
    orientacionLienzo = "xy",
  } = data as MapaNodoNodeData;

  const { badgeEntrada, badgeSalida } =
    mapaLienzoFlowHandleConfig(orientacionLienzo);

  const esProduccion = nodo.tipo === "produccion";
  const clasificacionClass = mapaNodoClasificacionClass(nodo.tipo);
  const toneClass = esProduccion
    ? clasificacionClass
    : objetivoId != null
      ? mapaObjetivoToneClass(objetivoId)
      : "mapa-flow-node--neutral";
  const accent =
    objetivoId != null ? mapaObjetivoColor(objetivoId) : "#94a3b8";

  return (
    <div
      className={`${toneClass} mapa-flow-node group max-w-[268px] rounded-xl border bg-white transition-[box-shadow,transform] duration-200 ${
        selected
          ? "mapa-flow-node--selected scale-[1.02]"
          : "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-6px_rgba(26,35,50,0.22)]"
      }`}
      style={
        !esProduccion && objetivoId != null
          ? { borderLeftWidth: 4, borderLeftColor: accent,
              boxShadow: selected
                ? `0 0 0 2px #264a6e, 0 12px 36px -8px rgba(37,99,235,0.28)`
                : "0 4px 18px -6px rgba(26,35,50,0.18)"
            }
          : { boxShadow: selected
              ? "0 0 0 2px #264a6e, 0 12px 36px -8px rgba(26,35,50,0.28)"
              : "0 4px 18px -6px rgba(26,35,50,0.18)"
            }
      }
    >
      <MapaFlowEnlaceHandleTarget orientacionLienzo={orientacionLienzo} />

      <div className="px-3 pb-2.5 pt-2">
        <span
          className={`mapa-flow-node-clasificacion-badge mb-1.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
            esProduccion
              ? "mapa-flow-node-clasificacion-badge--produccion"
              : "mapa-flow-node-clasificacion-badge--formacion"
          }`}
        >
          {nodoClasificacionLabel(nodo.tipo)}
        </span>

        {!esProduccion && objetivoId != null && objetivoNombre ? (
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
          <MapaFlowNodeCardActions
            selected={selected}
            onEdit={() => onEdit(nodo.id)}
            onAdd={
              onAddLinked ? () => onAddLinked(nodo.id) : undefined
            }
            addTitle="Nuevo nodo enlazado desde aquí"
          />
        </div>

        <p className="mapa-flow-node-title mt-1.5 text-[15px] font-bold leading-snug">
          {nodo.titulo}
        </p>

        {nodo.descripcion?.trim() ? (
          <p className="mapa-flow-node-desc mt-1 line-clamp-2 text-[11px] leading-snug">
            {nodo.descripcion}
          </p>
        ) : null}

        {nodo.link_chat?.trim() ? (
          <div className="mt-2 flex justify-end">
            <PlatformLinkIcon
              link={nodo.link_chat}
              purpose="chat"
              size="sm"
              className="!h-7 !w-7 rounded-[9px]"
            />
          </div>
        ) : null}

        {enlacesEntrada > 0 || enlacesSalida > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            <EnlaceBadge label={badgeEntrada} count={enlacesEntrada} />
            <EnlaceBadge label={badgeSalida} count={enlacesSalida} />
          </div>
        ) : null}
      </div>

      <MapaFlowEnlaceHandleSource orientacionLienzo={orientacionLienzo} />
    </div>
  );
}

export const mapaFlowNodeTypes = {
  mapaNodo: MapaNodoNode,
  mapaTema: MapaTemaNode,
} as const;
