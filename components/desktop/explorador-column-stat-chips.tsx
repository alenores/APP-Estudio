"use client";

import type { ReactNode } from "react";

type ExploradorColumnStatChipProps = {
  label: string;
  count: number;
  title: string;
  onOpen: () => void;
  tone?: "default" | "seguimiento";
};

export function ExploradorColumnStatChip({
  label,
  count,
  title,
  onOpen,
  tone = "default",
}: ExploradorColumnStatChipProps) {
  const accent =
    tone === "seguimiento"
      ? "border-[var(--estudio-tone-seguimiento-line)] bg-[var(--estudio-tone-seguimiento-bg)]/40"
      : "border-[var(--td-line)] bg-white/80";

  return (
    <div
      className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 shadow-sm ${accent}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
          {label}
        </p>
        <p className="text-sm font-extrabold tabular-nums text-[var(--td-ink)]">
          {count}
        </p>
      </div>
      <button
        type="button"
        title={title}
        aria-label={title}
        onClick={onOpen}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--td-line)] bg-white text-[var(--td-navy)] transition-all hover:border-[var(--td-navy)]/40 hover:bg-[var(--td-line-soft)] active:scale-90"
      >
        <IconSearch />
      </button>
    </div>
  );
}

export function ExploradorColumnStatChips({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
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
