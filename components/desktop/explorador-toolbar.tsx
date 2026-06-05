"use client";

import type { ExploradorCreateKind } from "@/components/desktop/explorador-create-modal";

type ExploradorToolbarProps = {
  temaId: number | null;
  cursoId: number | null;
  onCreate: (kind: ExploradorCreateKind) => void;
};

export function ExploradorToolbar({
  temaId,
  cursoId,
  onCreate,
}: ExploradorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarButton label="+ Tema" onClick={() => onCreate("tema")} primary />
      <ToolbarButton
        label="+ Curso"
        onClick={() => onCreate("curso")}
        disabled={temaId == null}
        title={
          temaId == null ? "Elegí un tema para crear un curso" : undefined
        }
      />
      <ToolbarButton
        label="+ Clase"
        onClick={() => onCreate("clase")}
        disabled={cursoId == null}
        title={
          cursoId == null ? "Elegí un curso para crear una clase" : undefined
        }
      />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled = false,
  primary = false,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? "bg-[var(--td-navy)] text-white hover:bg-[var(--td-navy-2)]"
          : "border border-[var(--td-line)] bg-white text-[var(--td-ink-soft)] hover:border-[var(--td-navy)]/40 hover:text-[var(--td-navy)]"
      }`}
    >
      {label}
    </button>
  );
}
