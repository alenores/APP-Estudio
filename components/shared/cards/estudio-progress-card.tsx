"use client";

import type { SeguimientoDerivados } from "@/app/types/estudio";
import { PlatformLinkIcon } from "@/components/ui/platform-link-icon";
import { ExternalLinkPreview } from "@/components/shared/links/external-link-preview";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import {
  estadoFillDetalleClass,
  estadoLabel,
  estadoStripDetalleClass,
} from "@/lib/estado-ui";
import type { CSSProperties, ReactNode } from "react";
import { HighlightMatch } from "@/components/shared/text/highlight-match";

const DONUT_R = 11;
const DONUT_C = 2 * Math.PI * DONUT_R;

export type EstudioProgressCardKind = "tema" | "curso" | "clase";

export type EstudioProgressCardProps = {
  kind: EstudioProgressCardKind;
  nombre: string;
  derivados: SeguimientoDerivados;
  selected?: boolean;
  explorerId?: number;
  onSelect?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  /** Contenido interactivo (Link móvil con gestos). Si no hay, el cuerpo es estático. */
  bodyWrapper?: (content: ReactNode) => ReactNode;
  fechaParen?: string | null;
  /** Progreso de hijos (cursos en tema, clases en curso) desde seguimientos. */
  hijosStats?: HijosProgressStats;
  hijosLabel?: "cursos" | "clases";
  link?: string | null;
  descripcion?: string | null;
  dificultad?: string | null;
  orden?: number;
  /** Panel extra al seleccionar (explorador PC). */
  expandedSlot?: ReactNode;
  /** Resalta coincidencias en nombre (modal buscador PC). */
  highlightQuery?: string;
  /** Línea de contexto bajo el título (ej. tema padre). */
  searchContextLine?: string | null;
  /** Muestra descripción con resaltado bajo el título (buscador). */
  searchShowDescripcion?: boolean;
  /** Solo ícono de link tocable, sin miniatura (buscador PC). */
  linkIconOnly?: boolean;
};

export function EstudioProgressCard({
  kind,
  nombre,
  derivados,
  selected = false,
  explorerId,
  onSelect,
  onDoubleClick,
  className = "",
  bodyWrapper,
  fechaParen,
  hijosStats,
  hijosLabel = "clases",
  link,
  descripcion,
  dificultad,
  orden,
  expandedSlot,
  highlightQuery,
  searchContextLine,
  searchShowDescripcion = false,
  linkIconOnly = false,
}: EstudioProgressCardProps) {
  const pct = derivados.porcentaje_avance ?? 0;
  const estadoTexto = estadoLabel(derivados.etiqueta_estado) ?? "Sin empezar";
  const hasLink = Boolean(link?.trim());
  const interactive = onSelect != null;
  const showLinkPreview = hasLink && expandedSlot != null && !linkIconOnly;
  const showLinkIcon = hasLink && (linkIconOnly || expandedSlot == null);

  const fillStyle: CSSProperties =
    pct > 0 ? { width: `${Math.min(100, pct)}%` } : { display: "none" };

  const donutOffset =
    hijosStats && hijosStats.total > 0
      ? DONUT_C * (1 - hijosStats.terminadas / hijosStats.total)
      : DONUT_C;

  const showDonut =
    (kind === "tema" || kind === "curso") && hijosStats != null;

  const showSearchDescripcion =
    searchShowDescripcion &&
    highlightQuery &&
    Boolean(descripcion?.trim());

  const body = (
    <>
      <div className="text-[15px] font-bold leading-snug text-[var(--td-ink)]">
        {highlightQuery ? (
          <HighlightMatch text={nombre} query={highlightQuery} />
        ) : (
          nombre
        )}
        {(kind === "tema" || kind === "curso") && fechaParen && !expandedSlot ? (
          <span className="ml-1 text-[13px] font-semibold text-[var(--td-fecha-muted)]">
            {fechaParen}
          </span>
        ) : null}
      </div>
      {searchContextLine ? (
        <p className="mt-1 truncate text-[11px] font-normal italic text-[var(--td-fecha-muted)]">
          {searchContextLine}
        </p>
      ) : null}
      {showSearchDescripcion ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-[var(--td-ink-soft)]">
          <HighlightMatch text={descripcion!.trim()} query={highlightQuery!} />
        </p>
      ) : null}
      <div className="mt-2.5 flex items-center gap-3">
        {showDonut ? (
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[var(--td-donut-text)]">
            <svg className="h-6 w-6 shrink-0" viewBox="0 0 28 28" aria-hidden>
              <circle
                className="fill-none stroke-[var(--td-donut-track)]"
                cx="14"
                cy="14"
                r={DONUT_R}
                strokeWidth="4.5"
              />
              <circle
                className="fill-none stroke-[var(--td-donut-val)]"
                cx="14"
                cy="14"
                r={DONUT_R}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={DONUT_C}
                strokeDashoffset={donutOffset}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            <span>
              <b className="font-extrabold text-[var(--td-donut-num)]">
                {hijosStats!.terminadas}
              </b>
              /{hijosStats!.total} {hijosLabel}
            </span>
          </span>
        ) : null}
        {kind === "clase" && !showSearchDescripcion ? (
          dificultad || descripcion ? (
            <span className="truncate text-xs font-semibold text-[var(--td-donut-text)]">
              {dificultad ?? descripcion}
            </span>
          ) : (
            <span className="text-xs font-semibold text-[var(--td-faint)]">
              Clase #{orden ?? "—"}
            </span>
          )
        ) : null}
        <span className="ml-auto flex items-center gap-3">
          <span className="text-base font-extrabold text-[var(--td-ink)]">
            {pct}%
          </span>
          {showLinkIcon ? (
            <PlatformLinkIcon
              link={link!}
              size="sm"
              className="!h-7 !w-7 shrink-0 rounded-[9px]"
            />
          ) : null}
        </span>
      </div>
    </>
  );

  const wrappedBody = bodyWrapper ? bodyWrapper(body) : body;

  return (
    <article
      data-explorer-id={explorerId}
      data-selected={selected ? "true" : undefined}
      data-expanded={expandedSlot ? "true" : undefined}
      className={`td-ccard explorer-progress-card relative flex overflow-hidden rounded-[15px] border border-[var(--td-line)] bg-[var(--td-card)] ${interactive ? "cursor-pointer" : ""} ${
        selected
          ? explorerId != null
            ? "border-[var(--td-navy)] shadow-[0_8px_24px_-10px_rgba(39,72,103,.4)] ring-2 ring-[var(--td-navy)]/30"
            : "z-[1] border-[var(--td-navy)] shadow-[0_8px_24px_-10px_rgba(39,72,103,.4)] ring-2 ring-[var(--td-navy)]/30"
          : ""
      } ${className}`}
      onClick={interactive ? onSelect : undefined}
      onDoubleClick={onDoubleClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div
        className={`${estadoStripDetalleClass(derivados.etiqueta_estado)} self-stretch`}
      >
        <span>{estadoTexto}</span>
      </div>
      <div className="relative min-w-0 flex-1 flex flex-col">
        <div className="relative px-4 py-3.5">
          {pct > 0 ? (
            <div
              className={estadoFillDetalleClass(derivados.etiqueta_estado)}
              style={fillStyle}
              aria-hidden
            />
          ) : null}
          <div className="relative z-[1] min-w-0">{wrappedBody}</div>
        </div>
        {showLinkPreview ? (
          <div className="relative z-[1] px-4 pb-2 pt-2.5">
            <ExternalLinkPreview link={link!} variant="card" />
          </div>
        ) : null}
        {expandedSlot ? (
          <div className="relative z-[1] px-4 pb-3.5 pt-0">{expandedSlot}</div>
        ) : null}
      </div>
    </article>
  );
}
