"use client";

import type { DefinicionEspecifica } from "@/app/types/desarrollos";
import { ChevronRight, CornerDownRight, Zap } from "lucide-react";
import Link from "next/link";

type EspecificaListCardProps = {
  especifica: DefinicionEspecifica;
  accionesCount: number;
};

export function EspecificaListCard({
  especifica,
  accionesCount,
}: EspecificaListCardProps) {
  const href = `/definicion-especifica/${especifica.id}`;

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative ml-3 flex overflow-hidden rounded-xl border border-stone-200/90 bg-stone-50/80 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-stone-300 hover:bg-paper-elevated hover:shadow-md active:scale-[0.985] dark:border-stone-700 dark:bg-stone-900/60 dark:hover:border-stone-600 dark:hover:bg-stone-900"
      style={{
        boxShadow: "0 1px 2px rgba(28,25,23,0.05), 0 2px 8px -4px rgba(28,25,23,0.08)",
      }}
    >
      <span
        className="w-0.5 shrink-0 self-stretch bg-stone-400 transition-colors duration-200 group-hover:bg-[#EA580C]/70 dark:bg-stone-600"
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3.5 py-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-200/70 text-stone-600 ring-1 ring-stone-300/50 transition-colors duration-200 group-hover:bg-stone-100 group-hover:text-[#EA580C] dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700 dark:group-hover:text-[#EA580C]"
          aria-hidden
        >
          <CornerDownRight className="h-4 w-4" strokeWidth={2.25} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border border-stone-300/80 bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
              Específica
            </span>
          </div>

          <h2 className="mt-1 text-base font-semibold leading-snug text-stone-800 dark:text-stone-100">
            {especifica.nombre}
          </h2>

          {especifica.descripcion ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {especifica.descripcion}
            </p>
          ) : null}

          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300">
              <Zap className="h-3 w-3 shrink-0 text-[#EA580C]" aria-hidden />
              <span className="tabular-nums font-semibold text-stone-800 dark:text-stone-100">
                {accionesCount}
              </span>
              <span className="text-stone-500 dark:text-stone-400">acciones</span>
            </span>
          </div>
        </div>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-stone-400 transition-colors duration-200 group-hover:text-[#EA580C] dark:text-stone-500"
          aria-hidden
        />
      </div>
    </Link>
  );
}
