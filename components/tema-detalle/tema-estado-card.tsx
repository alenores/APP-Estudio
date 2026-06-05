"use client";

import { estadoChipDetalleClass, estadoLabel } from "@/lib/estado-ui";

type TemaEstadoCardProps = {
  estado: string | null;
  delayClass?: string;
  className?: string;
};

/** La card es el estado: color, punto y texto (sin título ni chip anidado). */
export function TemaEstadoCard({
  estado,
  delayClass = "td-d4",
  className = "",
}: TemaEstadoCardProps) {
  const texto = estadoLabel(estado) ?? "Sin estado";

  return (
    <section
      className={`td-card td-rise ${delayClass} ${estadoChipDetalleClass(estado)} !flex w-full shrink-0 items-center justify-center gap-1.5 px-2.5 py-1.5 ${className}`}
    >
      <span className="td-chip-dot h-1.5 w-1.5 shrink-0" aria-hidden />
      <span className="truncate text-[12px] font-bold leading-tight">{texto}</span>
    </section>
  );
}
