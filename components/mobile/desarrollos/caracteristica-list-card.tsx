"use client";

import type { Caracteristica } from "@/app/types/desarrollos";
import { SurfaceCard } from "@/components/ui";
import {
  CARACTERISTICA_TIPO_BADGE_CLASS,
  CARACTERISTICA_TIPO_LABELS,
} from "@/lib/caracteristica-tipo";
import { deleteCaracteristica } from "@/lib/desarrollos-queries";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { useState } from "react";

type CaracteristicaListCardProps = {
  caracteristica: Caracteristica;
  onDeleted?: () => void;
};

export function CaracteristicaListCard({
  caracteristica,
  onDeleted,
}: CaracteristicaListCardProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    <SurfaceCard className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CARACTERISTICA_TIPO_BADGE_CLASS[caracteristica.tipo]}`}
        >
          {CARACTERISTICA_TIPO_LABELS[caracteristica.tipo]}
        </span>
        {caracteristica.titulo && caracteristica.tipo !== "prompt_cursor" ? (
          <span className="text-sm font-semibold text-ink">{caracteristica.titulo}</span>
        ) : null}
      </div>

      {caracteristica.tipo === "prompt_cursor" && caracteristica.titulo ? (
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 whitespace-pre-wrap">
            {caracteristica.titulo}
          </pre>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="mt-2 rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-800 active:scale-95"
          >
            {copied ? "Copiado" : "Copiar prompt"}
          </button>
        </div>
      ) : null}

      {caracteristica.descripcion ? (
        <p className="whitespace-pre-wrap text-sm text-ink-muted">{caracteristica.descripcion}</p>
      ) : null}

      {!caracteristica.titulo && !caracteristica.descripcion ? (
        <p className="text-xs text-ink-muted">Sin título.</p>
      ) : null}

      <button
        type="button"
        disabled={deleting}
        onClick={() => void handleDelete()}
        className="text-xs font-semibold text-red-700"
      >
        Eliminar
      </button>
    </SurfaceCard>
  );
}
