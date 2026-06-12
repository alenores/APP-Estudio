"use client";

import type { DefinicionGeneral } from "@/app/types/desarrollos";
import { ChevronRight, GitBranch, Layers, Zap } from "lucide-react";
import Link from "next/link";

type GeneralListCardProps = {
  general: DefinicionGeneral;
  especificasCount: number;
  accionesCount: number;
};

function CountBadge({
  icon: Icon,
  count,
  label,
}: {
  icon: typeof Layers;
  count: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
      <Icon className="h-3 w-3 shrink-0 text-[#EA580C]" aria-hidden />
      <span className="tabular-nums font-semibold text-stone-800 dark:text-stone-100">{count}</span>
      <span className="text-stone-500 dark:text-stone-400">{label}</span>
    </span>
  );
}

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
      className="group relative flex overflow-hidden rounded-2xl border border-stone-200 bg-paper-elevated shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-[#EA580C]/35 hover:shadow-md active:scale-[0.985] dark:border-stone-700 dark:bg-stone-900 dark:hover:border-[#EA580C]/50"
      style={{
        boxShadow:
          "0 1px 3px rgba(28,25,23,0.06), 0 4px 14px -6px rgba(28,25,23,0.10)",
      }}
    >
      <span
        className="w-1 shrink-0 self-stretch bg-[#EA580C]"
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-[#EA580C] ring-1 ring-stone-200/80 transition-colors duration-200 group-hover:bg-[#EA580C]/10 group-hover:ring-[#EA580C]/25 dark:bg-stone-800 dark:ring-stone-700"
          aria-hidden
        >
          <Layers className="h-5 w-5" strokeWidth={2.25} />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-full bg-[#EA580C]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#EA580C] dark:bg-[#EA580C]/15">
            Definición general
          </span>

          <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-stone-900 dark:text-stone-100">
            {general.nombre}
          </h2>

          {general.descripcion ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {general.descripcion}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <CountBadge icon={GitBranch} count={especificasCount} label="específicas" />
            <CountBadge icon={Zap} count={accionesCount} label="acciones" />
          </div>
        </div>

        <ChevronRight
          className="h-5 w-5 shrink-0 text-stone-400 transition-colors duration-200 group-hover:text-[#EA580C] dark:text-stone-500"
          aria-hidden
        />
      </div>
    </Link>
  );
}
