"use client";

import { EstudioNivelGauge } from "@/components/shared/widgets/estudio-nivel-gauge";

export { agujaRotacionGrados } from "@/components/shared/widgets/estudio-nivel-gauge";

type TemaNivelGaugeProps = {
  nivel: number | null;
  delayClass?: string;
  className?: string;
};

/** Semicírculo con banda en 5 tramos de color + aguja (detalle móvil). */
export function TemaNivelGauge({
  nivel,
  delayClass = "td-d3",
  className = "",
}: TemaNivelGaugeProps) {
  return (
    <EstudioNivelGauge
      nivel={nivel}
      size="full"
      delayClass={delayClass}
      className={className}
    />
  );
}
