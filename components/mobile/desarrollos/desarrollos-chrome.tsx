"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export const DS_ACCENT = "#EA580C";

/** Clases compartidas explorador desktop (3 columnas jerárquicas). */
export const dsExplorerColumn = {
  general: {
    section:
      "border-stone-300/80 bg-stone-100/50 dark:border-stone-700 dark:bg-stone-900/40",
    itemSelected:
      "border-[#EA580C] bg-white shadow-sm ring-1 ring-[#EA580C]/20 dark:bg-stone-900 dark:border-[#EA580C]/70",
    itemIdle:
      "border-stone-200 bg-white/90 hover:bg-white dark:border-stone-700 dark:bg-stone-900/60 dark:hover:bg-stone-900",
  },
  especifica: {
    section:
      "border-stone-300/60 bg-stone-50/60 dark:border-stone-700 dark:bg-stone-900/30",
    itemSelected:
      "border-[#EA580C] bg-white shadow-sm ring-1 ring-[#EA580C]/20 dark:bg-stone-900 dark:border-[#EA580C]/70",
    itemIdle:
      "border-stone-200 bg-white/90 hover:bg-white dark:border-stone-700 dark:bg-stone-900/60 dark:hover:bg-stone-900",
  },
  accion: {
    section:
      "border-stone-200/80 bg-stone-50/40 dark:border-stone-800 dark:bg-stone-950/30",
    itemSelected:
      "border-[#EA580C] bg-white shadow-sm ring-1 ring-[#EA580C]/20 dark:bg-stone-900 dark:border-[#EA580C]/70",
    itemIdle:
      "border-stone-200 bg-white/90 hover:bg-white dark:border-stone-800 dark:bg-stone-900/50 dark:hover:bg-stone-900",
  },
} as const;

export function dsExplorerItemClass(
  level: keyof typeof dsExplorerColumn,
  selected: boolean,
): string {
  const col = dsExplorerColumn[level];
  return `relative w-full rounded-lg border px-3 py-2 text-left text-sm transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out hover:z-[1] hover:scale-[1.02] hover:border-[#EA580C] hover:ring-2 hover:ring-[#EA580C]/45 hover:shadow-md hover:shadow-[#EA580C]/15 ${
    selected ? col.itemSelected : col.itemIdle
  }`;
}

/* ─── Detail Hero ─────────────────────────────────────────── */

type DesarrollosDetailHeroProps = {
  levelLabel: string;
  title: string;
  description?: string | null;
  icon: LucideIcon;
  level: "general" | "especifica" | "accion";
  meta?: ReactNode;
  editLabel: string;
  onEdit: () => void;
};

export function DesarrollosDetailHero({
  levelLabel,
  title,
  description,
  icon: Icon,
  level,
  meta,
  editLabel,
  onEdit,
}: DesarrollosDetailHeroProps) {
  const topStrip =
    level === "general"
      ? "bg-[#EA580C]"
      : level === "especifica"
        ? "bg-stone-400 dark:bg-stone-600"
        : "bg-stone-300 dark:bg-stone-700";

  const levelBadge =
    level === "general"
      ? "bg-[#EA580C]/10 text-[#EA580C] dark:bg-[#EA580C]/15"
      : "border border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400";

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-paper-elevated shadow-sm dark:border-stone-700 dark:bg-stone-900">
      {/* Franja superior de nivel */}
      <div className={`h-1 w-full ${topStrip}`} aria-hidden />

      <div className="px-5 py-4">
        {/* Fila: badge de nivel + botón editar */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${levelBadge}`}
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
            {levelLabel}
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-[11px] font-semibold text-[#EA580C] transition-colors hover:text-[#c2410c] active:scale-95 dark:text-orange-400"
          >
            {editLabel}
          </button>
        </div>

        {/* Título */}
        <h1 className="mt-3 text-xl font-bold leading-tight tracking-tight text-stone-900 dark:text-stone-100">
          {title}
        </h1>

        {/* Descripción */}
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {description}
          </p>
        ) : null}

        {/* Meta: breadcrumbs de padres */}
        {meta ? (
          <div className="mt-3 space-y-1.5 border-t border-stone-100 pt-3 dark:border-stone-800">
            {meta}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ─── Section Header ──────────────────────────────────────── */

type DesarrollosSectionHeaderProps = {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export function DesarrollosSectionHeader({
  title,
  count,
  actionLabel,
  onAction,
}: DesarrollosSectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
        {title}
        {count != null ? (
          <span className="ml-1.5 font-bold tabular-nums text-stone-500 dark:text-stone-400">
            ({count})
          </span>
        ) : null}
      </span>
      <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" aria-hidden />
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#EA580C]/30 bg-[#EA580C]/8 px-2.5 py-1 text-[11px] font-semibold text-[#EA580C] transition-colors hover:bg-[#EA580C]/15 active:scale-95 dark:border-[#EA580C]/25 dark:bg-[#EA580C]/10"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          {actionLabel.replace("+ ", "")}
        </button>
      ) : null}
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */

type DesarrollosEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
};

export function DesarrollosEmptyState({ icon: Icon, title, hint }: DesarrollosEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-200 bg-stone-50/40 px-4 py-10 text-center dark:border-stone-800 dark:bg-stone-900/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-3 text-sm font-semibold text-stone-600 dark:text-stone-300">{title}</p>
      {hint ? (
        <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-stone-400 dark:text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ─── FAB ─────────────────────────────────────────────────── */

type DesarrollosFabProps = {
  label: string;
  onClick: () => void;
};

export function DesarrollosFab({ label, onClick }: DesarrollosFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-[#EA580C] px-5 text-sm font-bold text-white shadow-xl shadow-[#EA580C]/30 transition-[transform,background-color] duration-150 hover:bg-[#c2410c] active:scale-95"
    >
      <Plus className="h-4.5 w-4.5" strokeWidth={2.5} aria-hidden />
      {label}
    </button>
  );
}

/* ─── Meta line ───────────────────────────────────────────── */

export function DesarrollosMetaLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{children}</p>
  );
}
