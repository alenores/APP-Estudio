"use client";

import { estadoChipDetalleClass, estadoLabel } from "@/lib/estado-ui";
import type { ReactNode } from "react";

type ExploradorColumnCardProps = {
  title: string;
  subtitle?: string | null;
  estado: string | null;
  selected: boolean;
  onSelect: () => void;
  onOpenSeguimientos: () => void;
  onOpenConceptos: () => void;
  footer?: ReactNode;
};

export function ExploradorColumnCard({
  title,
  subtitle,
  estado,
  selected,
  onSelect,
  onOpenSeguimientos,
  onOpenConceptos,
  footer,
}: ExploradorColumnCardProps) {
  const estadoTexto = estadoLabel(estado);

  return (
    <article
      className={`rounded-xl border transition-[border-color,box-shadow,background] duration-150 ${
        selected
          ? "border-[var(--td-navy)] bg-white shadow-[0_4px_16px_-6px_rgba(39,72,103,.28)] ring-1 ring-[var(--td-navy)]/25"
          : "border-[var(--td-line)] bg-[var(--td-card)] hover:border-[var(--td-navy)]/35 hover:shadow-sm"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onDoubleClick={onOpenSeguimientos}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="cursor-pointer px-3 pb-2 pt-3 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-sm font-bold leading-snug text-[var(--td-ink)]">
            {title}
          </span>
          {estadoTexto ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${estadoChipDetalleClass(estado)}`}
            >
              {estadoTexto}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--td-ink-soft)]">
            {subtitle}
          </p>
        ) : null}
        {footer ? (
          <div className="mt-2 text-[11px] text-[var(--td-faint)]">{footer}</div>
        ) : null}
      </div>
      <div className="flex gap-1 border-t border-[var(--td-line)]/80 px-2 py-1.5">
        <ExploradorCardAction
          label="Seguimiento"
          shortLabel="Seg."
          onClick={onOpenSeguimientos}
        />
        <ExploradorCardAction
          label="Conceptos"
          shortLabel="Conc."
          onClick={onOpenConceptos}
        />
      </div>
    </article>
  );
}

function ExploradorCardAction({
  label,
  shortLabel,
  onClick,
}: {
  label: string;
  shortLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--td-filter-text-muted)] transition-colors hover:bg-[var(--td-line-soft)] hover:text-[var(--td-navy)]"
    >
      {shortLabel}
    </button>
  );
}

type ExploradorColumnProps = {
  label: string;
  count: number;
  emptyMessage: string;
  children: ReactNode;
};

export function ExploradorColumn({
  label,
  count,
  emptyMessage,
  children,
}: ExploradorColumnProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-[var(--td-line)] last:border-r-0">
      <header className="shrink-0 border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/50 px-4 py-2.5">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--td-ink-soft)]">
          {label}{" "}
          <span className="font-semibold text-[var(--td-faint)]">{count}</span>
        </h2>
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
