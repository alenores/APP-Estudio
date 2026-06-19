"use client";

import type { Concepto } from "@/app/types/estudio";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import {
  ExploradorRecordParentPicker,
  parentFromPicker,
  parentPickerValid,
  type RecordParentLevel,
} from "@/components/desktop/explorador-record-parent-picker";
import { ConceptoForm } from "@/components/shared/forms/concepto-form";
import { HighlightMatch } from "@/components/shared/text/highlight-match";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { rankConceptoRecords } from "@/lib/explorador-records-search";
import {
  EMPTY_TEMA_RECORDS_FILTERS,
  filterConceptosInTemaScope,
  resolveRecordContext,
  type TemaRecordsFilters,
} from "@/lib/explorador-tema-records";
import type { ConceptoParent } from "@/lib/form-parent-types";
import { useMemo, useRef, useEffect, useState } from "react";

type ExploradorTemaConceptosModalProps = {
  temaId: number;
  temaNombre: string;
  cacheData: EstudioOfflineCacheData;
  onClose: () => void;
};

function formatFecha(value: string | null): string {
  if (!value?.trim()) return "—";
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function ExploradorTemaConceptosModal({
  temaId,
  temaNombre,
  cacheData,
  onClose,
}: ExploradorTemaConceptosModalProps) {
  const { refreshSnapshot } = useEstudioData();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<TemaRecordsFilters>(
    EMPTY_TEMA_RECORDS_FILTERS,
  );
  const [adding, setAdding] = useState(false);
  const [parentLevel, setParentLevel] = useState<RecordParentLevel>("tema");
  const [parentCursoId, setParentCursoId] = useState<number | null>(null);
  const [parentClaseId, setParentClaseId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!adding) inputRef.current?.focus();
  }, [adding]);

  const tema = cacheData.temas.find((t) => t.id === temaId)!;
  const cursos = useMemo(
    () => cacheData.cursos.filter((c) => c.tema_id === temaId),
    [cacheData.cursos, temaId],
  );
  const clases = useMemo(() => {
    const cursoIds = new Set(cursos.map((c) => c.id));
    return cacheData.clases.filter((cl) => cursoIds.has(cl.curso_id));
  }, [cacheData.clases, cursos]);

  const filtered = useMemo(
    () => filterConceptosInTemaScope(cacheData, temaId, filters),
    [cacheData, temaId, filters],
  );

  const rows = useMemo(() => {
    const ctx = (c: Concepto) => resolveRecordContext(cacheData, c);
    const trimmed = query.trim();
    if (!trimmed) {
      return filtered.map((item) => ({ item, score: 0 }));
    }
    return rankConceptoRecords(filtered, query, ctx);
  }, [filtered, query, cacheData]);

  const clasesFilterOptions = useMemo(() => {
    if (filters.cursoId != null) {
      return clases.filter((cl) => cl.curso_id === filters.cursoId);
    }
    return clases;
  }, [clases, filters.cursoId]);

  async function onFormSuccess() {
    await refreshSnapshot();
    setAdding(false);
    setParentLevel("tema");
    setParentCursoId(null);
    setParentClaseId(null);
  }

  const parent = parentFromPicker(
    parentLevel,
    temaId,
    parentCursoId,
    parentClaseId,
  ) as ConceptoParent | null;

  return (
    <DesktopModal
      open
      onClose={onClose}
      title="Conceptos del tema"
      subtitle={`Tema · ${temaNombre}`}
      wide
      footer={
        adding ? null : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg bg-[var(--td-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--td-navy-2)]"
          >
            + Concepto
          </button>
        )
      }
    >
      {adding ? (
        <div className="space-y-4">
          <ExploradorRecordParentPicker
            tema={tema}
            cursos={cursos}
            clases={clases}
            level={parentLevel}
            onLevelChange={setParentLevel}
            cursoId={parentCursoId}
            onCursoIdChange={setParentCursoId}
            claseId={parentClaseId}
            onClaseIdChange={setParentClaseId}
          />
          {parent && parentPickerValid(parentLevel, parentCursoId, parentClaseId) ? (
            <ConceptoForm parent={parent} onSuccess={() => void onFormSuccess()} />
          ) : (
            <p className="text-sm text-[var(--td-faint)]">
              Completá el destino antes de cargar el concepto.
            </p>
          )}
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-sm text-[var(--td-ink-soft)] hover:text-[var(--td-ink)]"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[12rem] flex-1">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
                Buscar
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--td-line)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--td-navy)]/40">
                <IconSearch />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Descripción, título, tema, curso, clase…"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--td-faint)]"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </label>
            <FilterSelect
              label="Nivel"
              value={filters.nivel}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  nivel: v as TemaRecordsFilters["nivel"],
                }))
              }
              options={[
                { value: "todos", label: "Todos" },
                { value: "tema", label: "Tema" },
                { value: "curso", label: "Curso" },
                { value: "clase", label: "Clase" },
              ]}
            />
            <FilterSelect
              label="Curso"
              value={filters.cursoId != null ? String(filters.cursoId) : ""}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  cursoId: v === "" ? null : Number(v),
                  claseId: null,
                }))
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
                setFilters((f) => ({
                  ...f,
                  claseId: v === "" ? null : Number(v),
                }))
              }
              options={[
                { value: "", label: "Todas" },
                ...clasesFilterOptions.map((cl) => ({
                  value: String(cl.id),
                  label: cl.nombre,
                })),
              ]}
            />
          </div>

          {query.trim() && rows.length === 0 ? (
            <EmptyState text={`Sin coincidencias para «${query.trim()}».`} />
          ) : rows.length === 0 ? (
            <EmptyState text="No hay conceptos en este tema." />
          ) : (
            <div className="max-h-[min(58vh,560px)] overflow-auto rounded-xl border border-[var(--td-line)]">
              <table className="desktop-data-table w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-[var(--td-line-soft)]/95 backdrop-blur-sm">
                  <tr className="border-b border-[var(--td-line)] text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                    <th className="px-3 py-2.5">Tema</th>
                    <th className="px-3 py-2.5">Curso</th>
                    <th className="px-3 py-2.5">Clase</th>
                    <th className="px-3 py-2.5">Título</th>
                    <th className="min-w-[16rem] px-3 py-2.5">Descripción</th>
                    <th className="px-3 py-2.5">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ item: c }) => {
                    const ctx = resolveRecordContext(cacheData, c);
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
                      >
                        <td className="max-w-[9rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.temaNombre ?? "—"} query={query} />
                        </td>
                        <td className="max-w-[9rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.cursoNombre ?? "—"} query={query} />
                        </td>
                        <td className="max-w-[9rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.claseNombre ?? "—"} query={query} />
                        </td>
                        <td className="max-w-[10rem] truncate px-3 py-2.5 font-medium text-[var(--td-ink)]">
                          <HighlightMatch text={c.titulo} query={query} />
                        </td>
                        <td className="min-w-[16rem] max-w-[28rem] whitespace-normal px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={c.descripcion} query={query} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          {formatFecha(c.fecha_registro)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DesktopModal>
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

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--td-line)] px-4 py-10 text-center text-sm text-[var(--td-faint)]">
      {text}
    </p>
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
