"use client";

import type { MapaObjetivo } from "@/app/types/mapa";
import {
  mapaObjetivoColor,
  mapaObjetivoIdsDisponibles,
  mapaObjetivoNombre,
  MAPA_OBJETIVO_SHORT,
  type MapaObjetivoFiltro,
} from "@/lib/mapa-objetivo";
import { Panel } from "@xyflow/react";

type MapaObjetivoLeyendaProps = {
  objetivos: MapaObjetivo[];
};

/** Leyenda fija en el lienzo (coordenadas del flow, no del viewport). */
export function MapaObjetivoLeyenda({ objetivos }: MapaObjetivoLeyendaProps) {
  const ids = mapaObjetivoIdsDisponibles(objetivos);

  return (
    <Panel
      position="top-right"
      className="mapa-objetivo-leyenda !m-3 max-w-[220px] rounded-xl border border-[var(--td-line)] bg-white/95 px-3 py-2.5 shadow-md backdrop-blur-sm"
    >
      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        Objetivos
      </p>
      <ul className="space-y-1.5">
        {ids.map((id) => {
          const color = mapaObjetivoColor(id);
          const nombre = mapaObjetivoNombre(objetivos, id);
          return (
            <li key={id} className="flex items-start gap-2">
              <span
                className="mt-0.5 h-3 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="min-w-0 text-[11px] leading-snug text-[var(--td-ink-soft)]">
                <span className="font-bold" style={{ color }}>
                  {MAPA_OBJETIVO_SHORT[id]}
                </span>
                <span className="text-[var(--td-faint)]"> — </span>
                {nombre}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

type MapaObjetivoFiltroProps = {
  objetivos: MapaObjetivo[];
  value: MapaObjetivoFiltro;
  onChange: (value: MapaObjetivoFiltro) => void;
};

/** Botones de filtro por objetivo (barra superior del mapa). */
export function MapaObjetivoFiltroBar({
  objetivos,
  value,
  onChange,
}: MapaObjetivoFiltroProps) {
  const ids = mapaObjetivoIdsDisponibles(objetivos);

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--td-line)] bg-white p-0.5"
      role="group"
      aria-label="Filtrar por objetivo"
    >
      <FiltroBtn
        active={value === "todos"}
        onClick={() => onChange("todos")}
        label="Todos"
      />
      {ids.map((id) => (
        <FiltroBtn
          key={id}
          active={value === id}
          onClick={() => onChange(id)}
          label={`Obj. ${id}`}
          title={mapaObjetivoNombre(objetivos, id)}
          accent={mapaObjetivoColor(id)}
        />
      ))}
    </div>
  );
}

function FiltroBtn({
  active,
  onClick,
  label,
  title,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
        active
          ? "text-white shadow-sm"
          : "text-[var(--td-ink-soft)] hover:bg-[var(--td-line-soft)]"
      }`}
      style={
        active
          ? {
              backgroundColor: accent ?? "var(--td-navy)",
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}
