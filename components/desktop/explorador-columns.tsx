"use client";

import { ExploradorCardExpanded } from "@/components/desktop/explorador-card-expanded";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import { explorerColumnHeaderClass } from "@/lib/estudio-shell-tone";
import type { ReactNode, WheelEvent } from "react";

export type ExploradorColumnAction = {
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "create" | "edit" | "search" | "text";
};

type ExploradorColumnCardProps = {
  kind: "tema" | "curso" | "clase";
  explorerId: number;
  nombre: string;
  derivados: SeguimientoDerivados;
  selected: boolean;
  /** Panel expandido (solo la columna con foco activo). */
  expanded?: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  descripcion?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  fechaParen?: string | null;
  hijosStats?: HijosProgressStats;
  hijosLabel?: "cursos" | "clases";
  link?: string | null;
  dificultad?: string | null;
  orden?: number;
  seguimientosCount?: number;
  conceptosCount?: number;
  onOpenSeguimientos?: () => void;
  onOpenConceptos?: () => void;
  highlightQuery?: string;
  searchContextLine?: string | null;
  searchShowDescripcion?: boolean;
};

export function ExploradorColumnCard({
  kind,
  explorerId,
  nombre,
  derivados,
  selected,
  expanded = selected,
  onSelect,
  onDoubleClick,
  descripcion,
  fechaInicio = null,
  fechaFin = null,
  fechaParen,
  hijosStats,
  hijosLabel,
  link,
  dificultad,
  orden,
  seguimientosCount = 0,
  conceptosCount = 0,
  onOpenSeguimientos,
  onOpenConceptos,
  highlightQuery,
  searchContextLine,
  searchShowDescripcion,
}: ExploradorColumnCardProps) {
  const expandedSlot =
    expanded && onOpenSeguimientos && onOpenConceptos ? (
      <ExploradorCardExpanded
        kind={kind}
        descripcion={descripcion ?? null}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        seguimientosCount={seguimientosCount}
        conceptosCount={conceptosCount}
        derivados={derivados}
        onOpenSeguimientos={onOpenSeguimientos}
        onOpenConceptos={onOpenConceptos}
      />
    ) : null;

  return (
    <EstudioProgressCard
      kind={kind}
      nombre={nombre}
      derivados={derivados}
      selected={selected}
      explorerId={explorerId}
      onSelect={onSelect}
      onDoubleClick={onDoubleClick}
      descripcion={descripcion}
      fechaParen={fechaParen}
      hijosStats={hijosStats}
      hijosLabel={hijosLabel}
      link={link}
      dificultad={dificultad}
      orden={orden}
      expandedSlot={expandedSlot}
      highlightQuery={highlightQuery}
      searchContextLine={searchContextLine}
      searchShowDescripcion={searchShowDescripcion}
    />
  );
}

type ExploradorColumnProps = {
  columnKind: "tema" | "curso" | "clase";
  label: string;
  count: number;
  emptyMessage: string;
  actions: ExploradorColumnAction[];
  children: ReactNode;
};

export function ExploradorColumn({
  columnKind,
  label,
  count,
  emptyMessage,
  actions,
  children,
}: ExploradorColumnProps) {
  return (
    <section className="explorer-column-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]">
      <header
        className={`${explorerColumnHeaderClass(columnKind)} shrink-0 border-b border-[var(--td-line)]/80 px-3 py-2.5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-ink-soft)]">
            {label}{" "}
            <span className="font-semibold text-[var(--td-faint)]">{count}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {actions.map((action) => (
              <ColumnHeaderButton key={action.label} {...action} />
            ))}
          </div>
        </div>
      </header>
      <div
        className="explorer-column-body min-h-0 flex-1 overflow-y-auto px-2"
        onWheel={onColumnBodyWheel}
      >
        {count === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--td-line)] px-3 py-8 text-center text-sm text-[var(--td-faint)]">
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-col gap-2">{children}</div>
        )}
      </div>
    </section>
  );
}

/** Evita que la rueda desplace la página mientras la columna aún puede scrollear. */
function onColumnBodyWheel(e: WheelEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  if (el.scrollHeight <= el.clientHeight + 1) return;

  const { scrollTop, clientHeight, scrollHeight } = el;
  const dy = e.deltaY;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

  if ((dy < 0 && !atTop) || (dy > 0 && !atBottom)) {
    e.stopPropagation();
  }
}

function ColumnHeaderButton({
  label,
  title,
  onClick,
  disabled = false,
  variant = "text",
}: ExploradorColumnAction) {
  const aria = title ?? label;

  if (variant === "create" || variant === "edit" || variant === "search") {
    return (
      <button
        type="button"
        title={aria}
        aria-label={aria}
        disabled={disabled}
        onClick={onClick}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          variant === "create"
            ? "bg-[var(--td-navy)] text-white shadow-sm hover:bg-[var(--td-navy-2)] hover:shadow-md"
            : "border border-[var(--td-line)] bg-white text-[var(--td-navy)] shadow-sm hover:border-[var(--td-navy)]/35 hover:bg-[var(--td-line-soft)]"
        }`}
      >
        {variant === "create" ? (
          <IconPlus />
        ) : variant === "edit" ? (
          <IconPencil />
        ) : (
          <IconSearch />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      title={aria}
      aria-label={aria}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-[var(--td-line)] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--td-filter-text-muted)] transition-[transform,background-color,border-color,color] duration-150 hover:border-[var(--td-navy)]/40 hover:text-[var(--td-navy)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.3 2.7a1.1 1.1 0 0 1 1.55 1.55L5.4 11.6 3 12l.4-2.4 7.9-7.9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M13.5 13.5L17.25 17.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
