"use client";

import type { ReactNode } from "react";
import type { Clase, Curso, Tema } from "@/app/types/estudio";
import type { RecordsScopeFilters } from "@/lib/explorador-tema-records";

type ExploradorRecordsFiltersBarProps = {
  filters: RecordsScopeFilters;
  onChange: (next: RecordsScopeFilters) => void;
  temas: Tema[];
  cursos: Curso[];
  clases: Clase[];
  searchSlot: ReactNode;
  /** Conceptos: filtros arriba, buscador en segunda línea. */
  layout?: "inline" | "stacked";
};

export function ExploradorRecordsFiltersBar({
  filters,
  onChange,
  temas,
  cursos,
  clases,
  searchSlot,
  layout = "inline",
}: ExploradorRecordsFiltersBarProps) {
  function patch(partial: Partial<RecordsScopeFilters>) {
    onChange({ ...filters, ...partial });
  }

  const filterFields = (
    <>
      <FilterSelect
        label="Nivel"
        value={filters.nivel}
        onChange={(v) =>
          patch({ nivel: v as RecordsScopeFilters["nivel"] })
        }
        options={[
          { value: "todos", label: "Todos" },
          { value: "tema", label: "Tema" },
          { value: "curso", label: "Curso" },
          { value: "clase", label: "Clase" },
        ]}
      />
      <FilterSelect
        label="Tema"
        value={filters.temaId != null ? String(filters.temaId) : ""}
        onChange={(v) =>
          patch({
            temaId: v === "" ? null : Number(v),
            cursoId: null,
            claseId: null,
          })
        }
        options={[
          { value: "", label: "Todos" },
          ...temas.map((t) => ({ value: String(t.id), label: t.nombre })),
        ]}
      />
      <FilterSelect
        label="Curso"
        value={filters.cursoId != null ? String(filters.cursoId) : ""}
        onChange={(v) =>
          patch({
            cursoId: v === "" ? null : Number(v),
            claseId: null,
          })
        }
        options={[
          { value: "", label: "Todos" },
          ...cursos.map((c) => ({ value: String(c.id), label: c.nombre })),
        ]}
      />
      <FilterSelect
        label="Clase"
        value={filters.claseId != null ? String(filters.claseId) : ""}
        onChange={(v) =>
          patch({
            claseId: v === "" ? null : Number(v),
          })
        }
        options={[
          { value: "", label: "Todas" },
          ...clases.map((cl) => ({ value: String(cl.id), label: cl.nombre })),
        ]}
      />
    </>
  );

  if (layout === "stacked") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-end gap-2">{filterFields}</div>
        <div className="w-full">{searchSlot}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      {searchSlot}
      {filterFields}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="min-w-[7.5rem]">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--td-line)] bg-white px-2.5 py-2 text-xs font-semibold text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/40"
      >
        {options.map((o) => (
          <option key={o.value || "__all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RecordsSearchField({
  value,
  onChange,
  placeholder,
  inputRef,
  fullWidth = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  fullWidth?: boolean;
}) {
  return (
    <label className={fullWidth ? "block w-full" : "min-w-[12rem] flex-1"}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
        Buscar
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--td-line)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--td-navy)]/40">
        <IconSearch />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--td-faint)]"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0 text-[var(--td-faint)]">
      <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M13.5 13.5L17.25 17.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function useRecordsFilterOptions(
  cacheData: {
    temas: Tema[];
    cursos: Curso[];
    clases: Clase[];
  },
  filters: RecordsScopeFilters,
) {
  const temas = [...cacheData.temas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es"),
  );

  const cursos = cacheData.cursos
    .filter((c) => filters.temaId == null || c.tema_id === filters.temaId)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const cursoIds = new Set(cursos.map((c) => c.id));
  const clases = cacheData.clases
    .filter((cl) => {
      if (filters.cursoId != null) return cl.curso_id === filters.cursoId;
      return cursoIds.has(cl.curso_id);
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { temas, cursos, clases };
}
