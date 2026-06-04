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
      className={`td-card td-rise ${delayClass} ${estadoChipDetalleClass(estado)} !flex min-h-0 w-full flex-1 items-center justify-center gap-2 px-2 py-2 ${className}`}
    >
      <span className="td-chip-dot shrink-0" aria-hidden />
      <span className="truncate text-[13px] font-bold">{texto}</span>
    </section>
  );
}
