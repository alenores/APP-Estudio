"use client";

import type { NodoObjetivoClasificacion } from "@/lib/mapa-nodo-tipo";
import { nodoClasificacionLabel } from "@/lib/mapa-nodo-tipo";

type MapaNodoTipoPickerProps = {
  onSelect: (tipo: NodoObjetivoClasificacion) => void;
};

/** Paso 1 al crear: elegir nodo o logro. */
export function MapaNodoTipoPicker({ onSelect }: MapaNodoTipoPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--td-ink-soft)]">
        ¿Qué tipo de ítem querés crear?
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            {
              id: "nodo" as const,
              title: "Nodo",
              desc: "Agrupa cursos en el roadmap. Puede tener cursos asociados.",
            },
            {
              id: "logro" as const,
              title: "Logro",
              desc: "Hito del mapa. No admite cursos asociados.",
            },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`mapa-tipo-picker-btn rounded-xl border px-4 py-3 text-left transition-[transform,box-shadow,border-color] duration-150 active:scale-[0.98] ${
              opt.id === "logro"
                ? "mapa-tipo-picker-btn--logro border-[var(--td-line)] bg-white hover:border-amber-400/60 hover:shadow-sm"
                : "mapa-tipo-picker-btn--nodo border-[var(--td-line)] bg-white hover:border-teal-400/60 hover:shadow-sm"
            }`}
          >
            <span className="block text-sm font-bold text-[var(--td-ink)]">
              {nodoClasificacionLabel(opt.id)}
            </span>
            <span className="mt-1 block text-xs leading-snug text-[var(--td-ink-soft)]">
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
