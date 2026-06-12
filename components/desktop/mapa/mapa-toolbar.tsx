"use client";

import type { MapaObjetivo } from "@/app/types/mapa";
import { MapaObjetivoFiltroBar } from "@/components/desktop/mapa/mapa-objetivo-ui";
import type { MapaGrafoModo } from "@/lib/mapa-lienzo-types";
import type { MapaLienzoOrientacion } from "@/lib/mapa-lienzo-orientacion";
import type { MapaObjetivoFiltro } from "@/lib/mapa-objetivo";

export type MapaVista = "lienzo" | "lista";

type MapaToolbarProps = {
  grafoModo: MapaGrafoModo;
  objetivos: MapaObjetivo[];
  vista: MapaVista;
  filtroObjetivo: MapaObjetivoFiltro;
  onGrafoModoChange: (modo: MapaGrafoModo) => void;
  onVistaChange: (vista: MapaVista) => void;
  onFiltroChange: (filtro: MapaObjetivoFiltro) => void;
  onNuevo: () => void;
  /** Ocultar + macro cuando hay overlay detalle abierto */
  nuevoDisabled?: boolean;
  orientacionLienzo?: MapaLienzoOrientacion;
  onOrientacionLienzoChange?: (orientacion: MapaLienzoOrientacion) => void;
};

/** Controles compactos del mapa (header compartido PC). */
export function MapaToolbar({
  grafoModo,
  objetivos,
  vista,
  filtroObjetivo,
  onGrafoModoChange,
  onVistaChange,
  onFiltroChange,
  onNuevo,
  nuevoDisabled = false,
  orientacionLienzo = "xy",
  onOrientacionLienzoChange,
}: MapaToolbarProps) {
  return (
    <div className="mapa-shell-toolbar flex shrink-0 items-center gap-1.5">
      <div
        className="flex rounded-md border border-white/10 bg-white/5 p-0.5"
        role="tablist"
        aria-label="Grafo del mapa"
      >
        {(
          [
            { id: "nodos" as const, label: "Nodos objetivo" },
            { id: "temas" as const, label: "Temas" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={grafoModo === id}
            onClick={() => onGrafoModoChange(id)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
              grafoModo === id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vista === "lienzo" && grafoModo === "nodos" ? (
        <MapaObjetivoFiltroBar
          objetivos={objetivos}
          value={filtroObjetivo}
          onChange={onFiltroChange}
          compact
        />
      ) : null}

      {vista === "lienzo" && onOrientacionLienzoChange ? (
        <div
          className="flex rounded-md border border-white/10 bg-white/5 p-0.5"
          role="tablist"
          aria-label="Orientación del lienzo"
        >
          {(
            [
              {
                id: "xy" as const,
                label: "Etapa → X",
                title: "Timeline horizontal (etapa en X, carril en Y)",
              },
              {
                id: "yx" as const,
                label: "Etapa → Y",
                title: "Timeline vertical (etapa en Y, carril en X)",
              },
            ] as const
          ).map(({ id, label, title }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={orientacionLienzo === id}
              title={title}
              onClick={() => onOrientacionLienzoChange(id)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                orientacionLienzo === id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="flex rounded-md border border-white/10 bg-white/5 p-0.5"
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
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
              vista === id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNuevo}
        disabled={nuevoDisabled}
        title={
          nuevoDisabled
            ? "Usá el botón + del panel de detalle para agregar cursos o logros"
            : undefined
        }
        className="flex items-center gap-1 shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 hover:shadow-[0_4px_14px_-2px_rgba(37,99,235,0.45)] transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-[14px] leading-none" aria-hidden>+</span>
        <span>{grafoModo === "nodos" ? "Nodo" : "Tema"}</span>
      </button>
    </div>
  );
}
