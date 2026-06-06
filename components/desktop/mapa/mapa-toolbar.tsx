"use client";

import type { MapaObjetivo } from "@/app/types/mapa";
import { MapaObjetivoFiltroBar } from "@/components/desktop/mapa/mapa-objetivo-ui";
import type { MapaObjetivoFiltro } from "@/lib/mapa-objetivo";

export type MapaVista = "lienzo" | "lista";

type MapaToolbarProps = {
  objetivos: MapaObjetivo[];
  vista: MapaVista;
  filtroObjetivo: MapaObjetivoFiltro;
  onVistaChange: (vista: MapaVista) => void;
  onFiltroChange: (filtro: MapaObjetivoFiltro) => void;
  onNuevoNodo: () => void;
};

/** Controles compactos del mapa (header compartido PC). */
export function MapaToolbar({
  objetivos,
  vista,
  filtroObjetivo,
  onVistaChange,
  onFiltroChange,
  onNuevoNodo,
}: MapaToolbarProps) {
  return (
    <div className="mapa-shell-toolbar flex flex-wrap items-center justify-end gap-1.5">
      {vista === "lienzo" ? (
        <MapaObjetivoFiltroBar
          objetivos={objetivos}
          value={filtroObjetivo}
          onChange={onFiltroChange}
          compact
        />
      ) : null}
      <div
        className="flex rounded-md border border-[var(--td-line)] bg-[var(--td-line-soft)]/50 p-0.5"
        role="tablist"
        aria-label="Vista del mapa"
      >
        {(
          [
            { id: "lienzo" as const, label: "Lienzo" },
            { id: "lista" as const, label: "Lista" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={vista === id}
            onClick={() => onVistaChange(id)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
              vista === id
                ? "bg-[var(--td-navy)] text-white shadow-sm"
                : "text-[var(--td-ink-soft)] hover:bg-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNuevoNodo}
        className="shrink-0 rounded-md bg-[var(--td-navy)] px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[var(--td-navy-2)]"
      >
        + Nodo
      </button>
    </div>
  );
}
