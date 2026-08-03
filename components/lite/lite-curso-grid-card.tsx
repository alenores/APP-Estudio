"use client";

import { ChevronRight } from "lucide-react";
import { liteEstadoSolidColors } from "@/components/lite/lite-badges";
import { LiteLinkPreview } from "@/components/lite/lite-link-preview";
import { LiteMediaRow } from "@/components/lite/lite-media-icon";
import { liteMedios } from "@/lib/academico-lite-media";
import type { LiteItem } from "@/lib/academico-lite-read";

export function LiteCursoGridCard({
  item,
  onSelect,
}: {
  item: LiteItem;
  onSelect: (item: LiteItem) => void;
}) {
  const medios = liteMedios(item);
  const principal = medios.find((m) => m.href);

  let labelStrip = "SIN EMPEZAR";
  if (item.estado === "en curso") labelStrip = "EN CURSO";
  if (item.estado === "terminado") labelStrip = "TERMINADO";
  if (item.estado === "pausado") labelStrip = "PAUSADO";

  return (
    <button
      type="button"
      className="lite-card flex h-full w-full flex-col overflow-hidden text-left"
      onClick={() => onSelect(item)}
    >
      <div className="relative aspect-video w-full bg-[var(--lt-line)]">
        {principal ? (
          <LiteLinkPreview media={principal} variant="hero" fallback={<div className="flex h-full items-center justify-center"><LiteMediaRow medios={medios} /></div>} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 bg-[#1a1a1a]">
            <LiteMediaRow medios={medios} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <span className="lite-title line-clamp-2 text-[13px] leading-tight text-white/90">
          {item.nombre}
        </span>
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${liteEstadoSolidColors(item.estado)}`}>
            {labelStrip}
          </span>
        </div>
      </div>
    </button>
  );
}
