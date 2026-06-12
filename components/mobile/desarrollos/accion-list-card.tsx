"use client";

import type { Accion } from "@/app/types/desarrollos";
import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";

type AccionListCardProps = {
  accion: Accion;
};

export function AccionListCard({ accion }: AccionListCardProps) {
  const href = `/acciones/${accion.id}`;

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative ml-6 flex overflow-hidden rounded-lg border border-stone-200/80 bg-white/90 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-stone-300 hover:shadow-md active:scale-[0.985] dark:border-stone-700 dark:bg-stone-900/50 dark:hover:border-stone-600"
    >
      <span
        className="w-0.5 shrink-0 self-stretch bg-stone-300 transition-colors duration-200 group-hover:bg-[#EA580C]/60 dark:bg-stone-700"
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 ring-1 ring-stone-200/80 transition-colors duration-200 group-hover:text-[#EA580C] dark:bg-stone-800 dark:text-stone-500 dark:ring-stone-700"
          aria-hidden
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
            Acción
          </span>
          <h2 className="mt-0.5 text-sm font-semibold leading-snug text-stone-800 dark:text-stone-100">
            {accion.nombre}
          </h2>
          {accion.descripcion ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {accion.descripcion}
            </p>
          ) : null}
        </div>

        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-stone-400 transition-colors duration-200 group-hover:text-[#EA580C] dark:text-stone-500"
          aria-hidden
        />
      </div>
    </Link>
  );
}
