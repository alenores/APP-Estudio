"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const DS_ACCENT = "#EA580C";

type DesarrollosDetailHeroProps = {
  levelLabel: string;
  title: string;
  description?: string | null;
  icon: LucideIcon;
  /** general | especifica | accion — controla énfasis visual del nivel */
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
  const accentBar =
    level === "general"
      ? "bg-[#EA580C]"
      : level === "especifica"
        ? "bg-stone-500 dark:bg-stone-600"
        : "bg-stone-400 dark:bg-stone-600";

  const iconWrap =
    level === "general"
      ? "bg-[#EA580C]/10 text-[#EA580C] ring-[#EA580C]/20"
      : level === "especifica"
        ? "bg-stone-100 text-stone-600 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
        : "bg-stone-100 text-stone-500 ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700";

  const levelBadge =
    level === "general"
      ? "bg-[#EA580C]/10 text-[#EA580C]"
      : "border border-stone-300/80 bg-stone-100 text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-stone-200 bg-paper-elevated shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} aria-hidden />
      <div className="flex gap-3 px-4 py-4 pl-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${levelBadge}`}
          >
            {levelLabel}
          </span>
          <h1 className="mt-1.5 text-lg font-bold leading-snug text-stone-900 dark:text-stone-100">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-2 space-y-1">{meta}</div> : null}
          <button
            type="button"
            onClick={onEdit}
            className="mt-3 text-xs font-semibold text-[#EA580C] transition-colors hover:text-[#c2410c] active:scale-95 dark:text-orange-400"
          >
            {editLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

type DesarrollosSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function DesarrollosSectionHeader({
  title,
  actionLabel,
  onAction,
}: DesarrollosSectionHeaderProps) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between gap-2">
      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
        {title}
      </h2>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-semibold text-[#EA580C] transition-colors hover:text-[#c2410c] active:scale-95"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

type DesarrollosEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  hint?: string;
};

export function DesarrollosEmptyState({ icon: Icon, title, hint }: DesarrollosEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-900/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200/70 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>
      <p className="mt-3 text-sm font-medium text-stone-700 dark:text-stone-300">{title}</p>
      {hint ? (
        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type DesarrollosFabProps = {
  label: string;
  onClick: () => void;
};

export function DesarrollosFab({ label, onClick }: DesarrollosFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-[#EA580C] px-5 text-sm font-semibold text-white shadow-lg shadow-[#EA580C]/25 transition-[transform,background-color] duration-150 hover:bg-[#c2410c] active:scale-95"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </button>
  );
}

export function DesarrollosMetaLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-stone-500 dark:text-stone-400">{children}</p>
  );
}
