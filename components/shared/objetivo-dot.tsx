import type { ObjetivoId } from "@/app/types/objetivo";
import {
  objetivoColor,
  objetivoIndicatorTitle,
} from "@/lib/objetivo-ui";

type ObjetivoDotProps = {
  objetivoId: ObjetivoId;
  /** Nombre desde catálogo `objetivos` (tooltip). */
  nombre?: string | null;
  className?: string;
};

/** Círculo de color de objetivo (explorador PC — esquina de card). */
export function ObjetivoDot({
  objetivoId,
  nombre,
  className = "",
}: ObjetivoDotProps) {
  const color = objetivoColor(objetivoId);
  const title = objetivoIndicatorTitle(objetivoId, nombre);

  return (
    <span
      className={`objetivo-dot pointer-events-none absolute z-[3] block h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-[0_1px_3px_rgba(15,23,42,0.22)] ${className}`}
      style={{ backgroundColor: color }}
      title={title}
      aria-hidden
    />
  );
}
