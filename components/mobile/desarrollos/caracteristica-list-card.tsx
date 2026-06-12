"use client";

import type { Caracteristica, CaracteristicaTipo } from "@/app/types/desarrollos";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import {
  CARACTERISTICA_TIPO_BADGE_CLASS,
  CARACTERISTICA_TIPO_LABELS,
} from "@/lib/caracteristica-tipo";
import { deleteCaracteristica } from "@/lib/desarrollos-queries";
import { Copy, StickyNote, Terminal, Trash2, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type CaracteristicaListCardProps = {
  caracteristica: Caracteristica;
  onDeleted?: () => void;
};

const TIPO_ICON: Record<CaracteristicaTipo, LucideIcon> = {
  nota: StickyNote,
  implicancia_tecnica: Wrench,
  prompt_cursor: Terminal,
};

export function CaracteristicaListCard({
  caracteristica,
  onDeleted,
}: CaracteristicaListCardProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const TipoIcon = TIPO_ICON[caracteristica.tipo];

  async function handleCopy() {
    if (!caracteristica.titulo) return;
    try {
      await navigator.clipboard.writeText(caracteristica.titulo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deleteCaracteristica(caracteristica.id);
    if (!error) {
      await refreshSnapshot();
      onDeleted?.();
    }
    setDeleting(false);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-paper-elevated shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="px-4 py-3.5">
        {/* Cabecera: badge tipo + título (si no es prompt) */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${CARACTERISTICA_TIPO_BADGE_CLASS[caracteristica.tipo]}`}
          >
            <TipoIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
            {CARACTERISTICA_TIPO_LABELS[caracteristica.tipo]}
          </span>

          {caracteristica.titulo && caracteristica.tipo !== "prompt_cursor" ? (
            <span className="min-w-0 flex-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              {caracteristica.titulo}
            </span>
          ) : null}
        </div>

        {/* Bloque código para prompt_cursor */}
        {caracteristica.tipo === "prompt_cursor" && caracteristica.titulo ? (
          <div className="mt-3">
            <pre className="overflow-x-auto rounded-lg bg-stone-900 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-stone-100 dark:bg-stone-950">
              {caracteristica.titulo}
            </pre>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-stone-600 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-100 transition-[colors,transform] hover:border-[#EA580C]/50 hover:text-[#EA580C] active:scale-95"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              {copied ? "¡Copiado!" : "Copiar prompt"}
            </button>
          </div>
        ) : null}

        {/* Descripción */}
        {caracteristica.descripcion ? (
          <p className="mt-2.5 text-sm leading-relaxed text-stone-600 whitespace-pre-wrap dark:text-stone-400">
            {caracteristica.descripcion}
          </p>
        ) : null}

        {!caracteristica.titulo && !caracteristica.descripcion ? (
          <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">Sin contenido.</p>
        ) : null}
      </div>

      {/* Footer con acción de borrar */}
      <div className="flex items-center border-t border-stone-100 bg-stone-50/60 px-4 py-2 dark:border-stone-800 dark:bg-stone-900/50">
        <button
          type="button"
          disabled={deleting}
          onClick={() => void handleDelete()}
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 transition-colors hover:text-red-600 active:scale-95 disabled:opacity-50 dark:text-stone-500 dark:hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {deleting ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </article>
  );
}
