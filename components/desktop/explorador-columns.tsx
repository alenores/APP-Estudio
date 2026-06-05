"use client";

import { ExploradorCardExpanded } from "@/components/desktop/explorador-card-expanded";
import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import type { HijosProgressStats } from "@/lib/hijos-progress-stats";
import type { ReactNode } from "react";

export type ExploradorColumnAction = {
  label: string;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
};

type ExploradorColumnCardProps = {
  kind: "tema" | "curso" | "clase";
  explorerId: number;
  nombre: string;
  derivados: SeguimientoDerivados;
  selected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
  descripcion?: string | null;
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
};

export function ExploradorColumnCard({
  kind,
  explorerId,
  nombre,
  derivados,
  selected,
  onSelect,
  onDoubleClick,
  descripcion,
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
}: ExploradorColumnCardProps) {
  const expandedSlot =
    selected && onOpenSeguimientos && onOpenConceptos ? (
      <ExploradorCardExpanded
        descripcion={descripcion ?? null}
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
    />
  );
}

type ExploradorColumnProps = {
  label: string;
  count: number;
  emptyMessage: string;
  actions: ExploradorColumnAction[];
  children: ReactNode;
};

export function ExploradorColumn({
  label,
  count,
  emptyMessage,
  actions,
  children,
}: ExploradorColumnProps) {
  return (
    <section className="explorer-column-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]">
      <header className="shrink-0 border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/50 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-ink-soft)]">
            {label}{" "}
            <span className="font-semibold text-[var(--td-faint)]">{count}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-1">
            {actions.map((action) => (
              <ColumnHeaderButton key={action.label} {...action} />
            ))}
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {count === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--td-line)] px-3 py-8 text-center text-sm text-[var(--td-faint)]">
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">{children}</div>
        )}
      </div>
    </section>
  );
}

function ColumnHeaderButton({
  label,
  title,
  onClick,
  disabled = false,
  primary = false,
}: ExploradorColumnAction) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={title ?? label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? "bg-[var(--td-navy)] text-white hover:bg-[var(--td-navy-2)]"
          : "border border-[var(--td-line)] bg-white text-[var(--td-filter-text-muted)] hover:border-[var(--td-navy)]/40 hover:text-[var(--td-navy)]"
      }`}
    >
      {label}
    </button>
  );
}
