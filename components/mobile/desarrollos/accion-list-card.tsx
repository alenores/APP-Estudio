"use client";

import type { Accion } from "@/app/types/desarrollos";
import { CardChatLinkIcon } from "@/components/shared/links/card-chat-link-icon";
import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";

type AccionListCardProps = {
  accion: Accion;
};

export function AccionListCard({ accion }: AccionListCardProps) {
  const href = `/acciones/${accion.id}`;

  return (
    <div className="flex items-start gap-2 pl-4">
      {/* Conector visual nivel 3 */}
      <div className="flex flex-col items-center pt-3.5" aria-hidden>
        <div className="h-3 w-px bg-stone-200 dark:bg-stone-800" />
        <div className="h-1.5 w-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
      </div>

      <Link
        href={href}
        prefetch={false}
        className="group flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-lg border border-stone-200/80 bg-white/80 px-3 py-2.5 shadow-sm transition-[border-color,box-shadow,background-color] duration-150 hover:border-stone-300 hover:bg-white hover:shadow-md active:scale-[0.985] dark:border-stone-700/60 dark:bg-stone-900/40 dark:hover:border-stone-600 dark:hover:bg-stone-900"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 ring-1 ring-stone-200/80 transition-colors duration-150 group-hover:text-[#EA580C] dark:bg-stone-800 dark:ring-stone-700"
          aria-hidden
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
            Acción
          </p>
          <h2 className="mt-0.5 text-sm font-semibold leading-snug text-stone-800 dark:text-stone-100">
            {accion.nombre}
          </h2>
          {accion.descripcion ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {accion.descripcion}
            </p>
          ) : null}
        </div>

        <CardChatLinkIcon linkChat={accion.link_chat} className="mr-1" />

        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-stone-300 transition-colors duration-150 group-hover:text-[#EA580C] dark:text-stone-600"
          aria-hidden
        />
      </Link>
    </div>
  );
}
