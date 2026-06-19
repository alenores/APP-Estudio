"use client";

import type { Clase, Curso, Tema } from "@/app/types/estudio";
import type { ConceptoParent, SeguimientoParent } from "@/lib/form-parent-types";

export type RecordParentLevel = "tema" | "curso" | "clase";

type ExploradorRecordParentPickerProps = {
  tema: Tema;
  cursos: Curso[];
  clases: Clase[];
  level: RecordParentLevel;
  onLevelChange: (level: RecordParentLevel) => void;
  cursoId: number | null;
  onCursoIdChange: (id: number | null) => void;
  claseId: number | null;
  onClaseIdChange: (id: number | null) => void;
};

export function ExploradorRecordParentPicker({
  tema,
  cursos,
  clases,
  level,
  onLevelChange,
  cursoId,
  onCursoIdChange,
  claseId,
  onClaseIdChange,
}: ExploradorRecordParentPickerProps) {
  const clasesFiltradas =
    cursoId != null ? clases.filter((cl) => cl.curso_id === cursoId) : clases;

  return (
    <div className="space-y-3 rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)]/30 p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]">
        Adjuntar a
      </p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "tema" as const, label: "Tema" },
            { id: "curso" as const, label: "Curso" },
            { id: "clase" as const, label: "Clase" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={level === opt.id}
            onClick={() => {
              onLevelChange(opt.id);
              if (opt.id === "tema") {
                onCursoIdChange(null);
                onClaseIdChange(null);
              } else if (opt.id === "curso") {
                onClaseIdChange(null);
              }
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${
              level === opt.id
                ? "border-[var(--td-navy)] bg-[var(--td-navy)] text-white"
                : "border-[var(--td-line)] bg-white text-[var(--td-filter-text-muted)] hover:border-[var(--td-navy)]/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {level === "tema" ? (
        <p className="text-sm font-semibold text-[var(--td-ink)]">
          Tema · {tema.nombre}
        </p>
      ) : null}

      {level === "curso" ? (
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-[var(--td-ink-soft)]">
            Curso
          </span>
          <select
            value={cursoId ?? ""}
            onChange={(e) =>
              onCursoIdChange(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-lg border border-[var(--td-line)] bg-white px-3 py-2 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/40"
          >
            <option value="">Elegí un curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {level === "clase" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[var(--td-ink-soft)]">
              Curso
            </span>
            <select
              value={cursoId ?? ""}
              onChange={(e) => {
                const next = e.target.value ? Number(e.target.value) : null;
                onCursoIdChange(next);
                onClaseIdChange(null);
              }}
              className="w-full rounded-lg border border-[var(--td-line)] bg-white px-3 py-2 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/40"
            >
              <option value="">Elegí un curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[var(--td-ink-soft)]">
              Clase
            </span>
            <select
              value={claseId ?? ""}
              onChange={(e) =>
                onClaseIdChange(e.target.value ? Number(e.target.value) : null)
              }
              disabled={cursoId == null}
              className="w-full rounded-lg border border-[var(--td-line)] bg-white px-3 py-2 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/40 disabled:opacity-50"
            >
              <option value="">Elegí una clase</option>
              {clasesFiltradas.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function parentFromPicker(
  level: RecordParentLevel,
  temaId: number,
  cursoId: number | null,
  claseId: number | null,
): ConceptoParent | SeguimientoParent | null {
  if (level === "tema") return { temaId };
  if (level === "curso" && cursoId != null) return { cursoId };
  if (level === "clase" && claseId != null) return { claseId };
  return null;
}

export function parentPickerValid(
  level: RecordParentLevel,
  cursoId: number | null,
  claseId: number | null,
): boolean {
  if (level === "tema") return true;
  if (level === "curso") return cursoId != null;
  if (level === "clase") return cursoId != null && claseId != null;
  return false;
}
