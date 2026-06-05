"use client";

import { EstudioProgressCard } from "@/components/shared/cards/estudio-progress-card";
import type { SeguimientoDerivados } from "@/app/types/estudio";
import type { ClasesCursoStats } from "@/lib/curso-clases-stats";
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
  fechaParen?: string | null;
  clasesStats?: ClasesCursoStats;
  link?: string | null;
  dificultad?: string | null;
  orden?: number;
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
  fechaParen,
  clasesStats,
  link,
  dificultad,
  orden,
}: ExploradorColumnCardProps) {
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
      clasesStats={clasesStats}
      link={link}
      dificultad={dificultad}
      orden={orden}
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
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--td-line)] last:border-r-0">
      <header className="shrink-0 border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/50 px-3 py-2">
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
          <div className="flex flex-col gap-2">{children}</div>
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
      className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? "bg-[var(--td-navy)] text-white hover:bg-[var(--td-navy-2)]"
          : "border border-[var(--td-line)] bg-white text-[var(--td-filter-text-muted)] hover:border-[var(--td-navy)]/40 hover:text-[var(--td-navy)]"
      }`}
    >
      {label}
    </button>
  );
}
