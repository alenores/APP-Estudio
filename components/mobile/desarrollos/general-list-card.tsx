"use client";

import type { DefinicionGeneral } from "@/app/types/desarrollos";
import { ChevronRight, GitBranch, Zap } from "lucide-react";
import Link from "next/link";

type GeneralListCardProps = {
  general: DefinicionGeneral;
  especificasCount: number;
  accionesCount: number;
};

export function GeneralListCard({
  general,
  especificasCount,
  accionesCount,
}: GeneralListCardProps) {
  const href = `/definicion-general/${general.id}`;

  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex overflow-hidden rounded-2xl border border-stone-200 bg-paper-elevated shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-[#EA580C]/40 hover:shadow-md active:scale-[0.985] dark:border-stone-700 dark:bg-stone-900 dark:hover:border-[#EA580C]/40"
      style={{ boxShadow: "0 1px 3px rgba(28,25,23,0.06), 0 4px 14px -6px rgba(28,25,23,0.09)" }}
    >
      {/* Franja naranja nivel 1 */}
      <span className="w-1 shrink-0 self-stretch bg-[#EA580C]" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4">
        {/* Título */}
        <h2 className="text-[17px] font-bold leading-tight tracking-tight text-stone-900 dark:text-stone-100">
          {general.nombre}
        </h2>

        {/* Descripción */}
        {general.descripcion ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {general.descripcion}
          </p>
        ) : null}

        {/* Contadores */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <GitBranch className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden />
            <span className="tabular-nums font-bold text-stone-800 dark:text-stone-100">
              {especificasCount}
            </span>{" "}
            específicas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <Zap className="h-3.5 w-3.5 text-[#EA580C]" aria-hidden />
            <span className="tabular-nums font-bold text-stone-800 dark:text-stone-100">
              {accionesCount}
            </span>{" "}
            acciones
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center pr-4">
        <ChevronRight
          className="h-5 w-5 text-stone-300 transition-colors duration-200 group-hover:text-[#EA580C] dark:text-stone-600"
          aria-hidden
        />
      </div>
    </Link>
  );
}
