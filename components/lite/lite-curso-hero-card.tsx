"use client";

import { liteEstadoClass, liteEstadoLabel } from "@/components/lite/lite-badges";
import { LiteLinkPreview } from "@/components/lite/lite-link-preview";
import { LiteMediaRow } from "@/components/lite/lite-media-icon";
import { liteMedios } from "@/lib/academico-lite-media";
import type { LiteItem } from "@/lib/academico-lite-read";

export function LiteCursoHeroCard({
  item,
  onSelect,
}: {
  item: LiteItem;
  onSelect: (item: LiteItem) => void;
}) {
  const medios = liteMedios(item);
  const principal = medios.find((m) => m.href);

  return (
    <div className="relative w-full overflow-hidden rounded-[18px] bg-[#1a1a1a] shadow-lg mb-4 lite-card">
      {/* Video / Miniatura */}
      <div className="relative aspect-video w-full" onClick={() => onSelect(item)}>
        {principal ? (
          <LiteLinkPreview media={principal} variant="hero" fallback={<div className="flex h-full items-center justify-center"><LiteMediaRow medios={medios} /></div>} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4">
            <LiteMediaRow medios={medios} />
          </div>
        )}
      </div>

      {/* Gradiente superior oscuro para que el titulo contraste bien */}
      <div 
        className="pointer-events-none absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-black/80 to-transparent" 
        onClick={() => onSelect(item)}
      />

      {/* Titulo superpuesto */}
      <button 
        type="button" 
        className="absolute left-0 top-0 w-full p-4 text-left pointer-events-auto"
        onClick={() => onSelect(item)}
      >
        <h3 className="line-clamp-2 text-[18px] font-bold leading-tight text-white shadow-black drop-shadow-md">
          {item.nombre}
        </h3>
      </button>

      {/* Etiquetas superpuestas (estado) */}
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${liteEstadoClass(item.estado)}`}>
          {liteEstadoLabel(item.estado)}
        </span>
      </div>
    </div>
  );
}
