"use client";

import type { DefinicionEspecifica } from "@/app/types/desarrollos";
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
      className="block rounded-2xl border-2 border-indigo-300/70 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
        Definición específica
      </p>
      <h2 className="mt-1 text-base font-semibold text-ink">{especifica.nombre}</h2>
      {especifica.descripcion ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{especifica.descripcion}</p>
      ) : null}
      <p className="mt-3 text-xs text-indigo-800/80">{accionesCount} acciones</p>
    </Link>
  );
}
