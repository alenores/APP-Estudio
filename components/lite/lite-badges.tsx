/**
 * Insignias de la card lite (ADR 012): estado de seguimiento y tipo de estudio.
 * Son los dos únicos datos de gestión que la pantalla muestra.
 */

import { tipoEstudioLabel, type TipoEstudio } from "@/lib/tipo-estudio";
import type { EstadoSeguimiento } from "@/lib/estado-ui";

const ESTADO_CLASS: Record<EstadoSeguimiento, string> = {
  "sin empezar": "lite-estado--sin-empezar",
  "en curso": "lite-estado--en-curso",
  pausado: "lite-estado--pausado",
  terminado: "lite-estado--terminado",
};

const ESTADO_LABEL: Record<EstadoSeguimiento, string> = {
  "sin empezar": "Sin empezar",
  "en curso": "En curso",
  pausado: "Pausado",
  terminado: "Terminado",
};

export function liteEstadoClass(estado: EstadoSeguimiento | null): string {
  return estado ? ESTADO_CLASS[estado] : "lite-estado--sin-registro";
}

export function liteEstadoLabel(estado: EstadoSeguimiento | null): string {
  return estado ? ESTADO_LABEL[estado] : "Sin registro";
}

export function LiteEstadoBadge({
  estado,
  className = "",
}: {
  estado: EstadoSeguimiento | null;
  className?: string;
}) {
  return (
    <span className={`lite-estado ${liteEstadoClass(estado)} ${className}`}>
      <span className="lite-estado-dot" aria-hidden />
      {liteEstadoLabel(estado)}
    </span>
  );
}

export function liteEstadoSolidColors(estado: EstadoSeguimiento | null) {
  if (estado === "en curso") return "bg-[var(--lt-accent)] text-white";
  if (estado === "terminado") return "bg-[#00C853] text-white";
  if (estado === "pausado") return "bg-[#FF9800] text-white";
  return "bg-[#2A2A2A] text-white/50"; // sin empezar o nulo
}

export function LiteTipoBadge({ tipo }: { tipo: TipoEstudio | null }) {
  if (!tipo) return null;
  return <span className="lite-tipo">{tipoEstudioLabel(tipo)}</span>;
}
