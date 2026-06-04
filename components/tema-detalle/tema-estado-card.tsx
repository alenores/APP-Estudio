"use client";

import { TemaMiniCard } from "@/components/tema-detalle/tema-mini-card";
import {
  estadoChipDetalleClass,
  estadoLabel,
  estadoMiniCardSurfaceClass,
} from "@/lib/estado-ui";

type TemaEstadoCardProps = {
  estado: string | null;
  delayClass?: string;
  className?: string;
};

export function TemaEstadoCard({
  estado,
  delayClass = "td-d4",
  className = "",
}: TemaEstadoCardProps) {
  const texto = estadoLabel(estado) ?? "Sin estado";

  return (
    <TemaMiniCard
      title="Estado"
      delayClass={delayClass}
      surfaceClass={estadoMiniCardSurfaceClass(estado)}
      className={className}
    >
      <div className="flex items-center justify-center py-0.5">
        <span className={estadoChipDetalleClass(estado)}>
          <span className="td-chip-dot" aria-hidden />
          {texto}
        </span>
      </div>
    </TemaMiniCard>
  );
}
