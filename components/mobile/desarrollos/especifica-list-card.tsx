"use client";

import type { DefinicionEspecifica } from "@/app/types/desarrollos";
import { ChevronRight, Zap } from "lucide-react";
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
    <div className="flex items-start gap-2">
      {/* Conector árbol visual */}
      <div className="flex flex-col items-center pt-4" aria-hidden>
        <div className="h-3 w-px bg-stone-300 dark:bg-stone-700" />
        <div className="h-2 w-2 rounded-full border-2 border-stone-400 bg-paper-elevated dark:border-stone-600" />
      </div>

      <Link
        href={href}
        prefetch={false}
        className="group flex min-w-0 flex-1 overflow-hidden rounded-xl border border-stone-200/90 bg-stone-50/70 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200 hover:border-stone-300 hover:bg-paper-elevated hover:shadow-md active:scale-[0.985] dark:border-stone-700 dark:bg-stone-900/50 dark:hover:border-stone-600 dark:hover:bg-stone-900"
        style={{ boxShadow: "0 1px 2px rgba(28,25,23,0.05), 0 2px 8px -4px rgba(28,25,23,0.07)" }}
      >
        <span
          className="w-0.5 shrink-0 self-stretch bg-stone-300 transition-colors duration-200 group-hover:bg-[#EA580C]/60 dark:bg-stone-700"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-col px-3.5 py-3">
          <h2 className="text-sm font-semibold leading-snug text-stone-800 dark:text-stone-100">
            {especifica.nombre}
          </h2>

          {especifica.descripcion ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {especifica.descripcion}
            </p>
          ) : null}

          <div className="mt-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-300">
              <Zap className="h-3 w-3 shrink-0 text-[#EA580C]" aria-hidden />
              <span className="tabular-nums font-bold text-stone-800 dark:text-stone-100">
                {accionesCount}
              </span>{" "}
              acciones
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center pr-3">
          <ChevronRight
            className="h-4 w-4 text-stone-300 transition-colors duration-200 group-hover:text-[#EA580C] dark:text-stone-600"
            aria-hidden
          />
        </div>
      </Link>
    </div>
  );
}
