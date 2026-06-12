"use client";

import type { Accion } from "@/app/types/desarrollos";
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
      className="block rounded-2xl border-2 border-fuchsia-300/70 bg-gradient-to-br from-fuchsia-50 to-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">
        Acción
      </p>
      <h2 className="mt-1 text-base font-semibold text-ink">{accion.nombre}</h2>
      {accion.descripcion ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{accion.descripcion}</p>
      ) : null}
    </Link>
  );
}
