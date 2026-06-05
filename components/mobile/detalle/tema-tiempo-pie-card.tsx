"use client";

import { EstudioDedicacionWidget } from "@/components/shared/widgets/estudio-dedicacion-widget";

type TemaTiempoPieCardProps = {
  invertidoMin: number;
  restanteMin: number | null;
  delayClass?: string;
  className?: string;
};

export function TemaTiempoPieCard({
  invertidoMin,
  restanteMin,
  delayClass = "td-d4",
  className = "",
}: TemaTiempoPieCardProps) {
  return (
    <EstudioDedicacionWidget
      invertidoMin={invertidoMin}
      restanteMin={restanteMin}
      size="full"
      delayClass={delayClass}
      className={className}
    />
  );
}
