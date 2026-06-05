"use client";

import { estadoChipDetalleClass, estadoLabel } from "@/lib/estado-ui";
import type { ReactNode } from "react";

type ExploradorColumnCardProps = {
  title: string;
  subtitle?: string | null;
  estado: string | null;
  selected: boolean;
  onClick: () => void;
  footer?: ReactNode;
};

export function ExploradorColumnCard({
  title,
  subtitle,
  estado,
  selected,
  onClick,
  footer,
}: ExploradorColumnCardProps) {
  const estadoTexto = estadoLabel(estado);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-3 py-3 text-left transition-[border-color,box-shadow,background] duration-150 ${
        selected
          ? "border-[var(--td-navy)] bg-white shadow-[0_4px_16px_-6px_rgba(39,72,103,.28)] ring-1 ring-[var(--td-navy)]/25"
          : "border-[var(--td-line)] bg-[var(--td-card)] hover:border-[var(--td-navy)]/35 hover:shadow-sm"
      }`}
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
      {footer ? <div className="mt-2 text-[11px] text-[var(--td-faint)]">{footer}</div> : null}
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
