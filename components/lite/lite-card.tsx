"use client";

import { ChevronRight } from "lucide-react";
import { LiteEstadoBadge, LiteTipoBadge } from "@/components/lite/lite-badges";
import { LiteLinkPreview } from "@/components/lite/lite-link-preview";
import { LiteMediaRow } from "@/components/lite/lite-media-icon";
import { liteMedios, type LiteMedia } from "@/lib/academico-lite-media";
import type { LiteItem } from "@/lib/academico-lite-read";

type LiteCardProps = {
  item: LiteItem;
  /** Muestra el nombre del padre arriba del título (listado plano de cursos). */
  mostrarPadre?: boolean;
  onSelect: (item: LiteItem) => void;
};

/**
 * Card del listado. Título a ancho completo; el video (o íconos) va debajo,
 * alineado a la izquierda — cursos y clases (ADR 012).
 */
export function LiteCard({ item, mostrarPadre = false, onSelect }: LiteCardProps) {
  const medios = liteMedios(item);
  const progreso =
    item.hijosTotal > 0
      ? Math.round((item.hijosTerminados / item.hijosTotal) * 100)
      : null;
  const tieneMedia = medios.length > 0;

  return (
    <button type="button" className="lite-card p-4" onClick={() => onSelect(item)}>
      <span className="flex items-start gap-3">
        <span className="min-w-0 flex-1">
          {mostrarPadre && item.parentNombre ? (
            <span className="mb-1 block truncate text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--lt-text-3)]">
              {item.parentNombre}
            </span>
          ) : null}

          <span className="lite-title block text-[17px] leading-snug">
            {item.nombre}
          </span>

          {tieneMedia ? (
            <span className="mt-3 block">
              <LiteCardMedia medios={medios} kind={item.kind} />
            </span>
          ) : null}

          <span className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <LiteEstadoBadge estado={item.estado} />
            <LiteTipoBadge tipo={item.tipoEstudio} />
          </span>

          {progreso !== null ? (
            <span className="mt-3 flex items-center gap-2.5">
              <span className="lite-rail min-w-0 flex-1">
                <span style={{ width: `${progreso}%` }} />
              </span>
              <span className="flex-none text-[11.5px] font-semibold tabular-nums text-[var(--lt-text-3)]">
                {item.hijosTerminados}/{item.hijosTotal}
              </span>
            </span>
          ) : null}
        </span>

        <ChevronRight
          className="mt-0.5 h-[18px] w-[18px] flex-none text-[var(--lt-text-3)]"
          strokeWidth={2}
          aria-hidden
        />
      </span>
    </button>
  );
}

/**
 * Miniatura del video debajo del título; si no hay portada (o si es una clase),
 * se muestra solo la fila de íconos para evitar repetir portadas de cursos.
 */
function LiteCardMedia({ medios, kind }: { medios: LiteMedia[]; kind: LiteItem["kind"] }) {
  const principal = medios.find((m) => m.href);
  
  // En las clases no mostramos miniatura gigante en el listado para igualar 
  // la versión académica y evitar repetir la portada genérica del curso.
  if (!principal || kind === "clase") return <LiteMediaRow medios={medios} />;

  return (
    <LiteLinkPreview
      media={principal}
      variant="thumb"
      fallback={<LiteMediaRow medios={medios} />}
    />
  );
}
