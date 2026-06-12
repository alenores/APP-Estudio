"use client";

import type { DefinicionGeneral } from "@/app/types/desarrollos";
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
      className="block rounded-2xl border-2 border-violet-300/80 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
        Definición general
      </p>
      <h2 className="mt-1 text-base font-semibold text-ink">{general.nombre}</h2>
      {general.descripcion ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{general.descripcion}</p>
      ) : null}
      <p className="mt-3 text-xs text-violet-800/80">
        {especificasCount} específicas · {accionesCount} acciones
      </p>
    </Link>
  );
}
