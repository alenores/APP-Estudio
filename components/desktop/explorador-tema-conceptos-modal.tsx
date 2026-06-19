"use client";

import type { Concepto } from "@/app/types/estudio";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import {
  defaultParentPickerState,
  ExploradorRecordParentPicker,
  parentFromPicker,
  parentPickerValid,
  type RecordParentLevel,
} from "@/components/desktop/explorador-record-parent-picker";
import {
  ExploradorRecordsFiltersBar,
  RecordsSearchField,
  useRecordsFilterOptions,
} from "@/components/desktop/explorador-records-filters-bar";
import { ConceptoForm } from "@/components/shared/forms/concepto-form";
import { HighlightMatch } from "@/components/shared/text/highlight-match";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { rankConceptoRecords } from "@/lib/explorador-records-search";
import {
  filterConceptosInScope,
  mergeInitialRecordsFilters,
  resolveRecordContext,
  type RecordsScopeFilters,
} from "@/lib/explorador-tema-records";
import type { ConceptoParent } from "@/lib/form-parent-types";
import { useMemo, useRef, useEffect, useState } from "react";

type ExploradorTemaConceptosModalProps = {
  cacheData: EstudioOfflineCacheData;
  initialFilters?: Partial<RecordsScopeFilters>;
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
  cacheData,
  initialFilters,
  onClose,
}: ExploradorTemaConceptosModalProps) {
  const { refreshSnapshot } = useEstudioData();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(() =>
    mergeInitialRecordsFilters(initialFilters),
  );
  const [adding, setAdding] = useState(false);
  const defaultParent = defaultParentPickerState(filters);
  const [parentLevel, setParentLevel] = useState<RecordParentLevel>(
    defaultParent.level,
  );
  const [parentTemaId, setParentTemaId] = useState<number | null>(
    defaultParent.temaId,
  );
  const [parentCursoId, setParentCursoId] = useState<number | null>(
    defaultParent.cursoId,
  );
  const [parentClaseId, setParentClaseId] = useState<number | null>(
    defaultParent.claseId,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!adding) inputRef.current?.focus();
  }, [adding]);

  const { temas, cursos, clases } = useRecordsFilterOptions(cacheData, filters);
  const parentOptions = useRecordsFilterOptions(cacheData, {
    ...filters,
    cursoId: null,
    claseId: null,
  });

  const filtered = useMemo(
    () => filterConceptosInScope(cacheData, filters),
    [cacheData, filters],
  );

  const rows = useMemo(() => {
    const ctx = (c: Concepto) => resolveRecordContext(cacheData, c);
    const trimmed = query.trim();
    if (!trimmed) {
      return filtered.map((item) => ({ item, score: 0 }));
    }
    return rankConceptoRecords(filtered, query, ctx);
  }, [filtered, query, cacheData]);

  async function onFormSuccess() {
    await refreshSnapshot();
    setAdding(false);
    const next = defaultParentPickerState(filters);
    setParentLevel(next.level);
    setParentTemaId(next.temaId);
    setParentCursoId(next.cursoId);
    setParentClaseId(next.claseId);
  }

  function startAdding() {
    const next = defaultParentPickerState(filters);
    setParentLevel(next.level);
    setParentTemaId(next.temaId);
    setParentCursoId(next.cursoId);
    setParentClaseId(next.claseId);
    setAdding(true);
  }

  const parent = parentFromPicker(
    parentLevel,
    parentTemaId,
    parentCursoId,
    parentClaseId,
  ) as ConceptoParent | null;

  return (
    <DesktopModal
      open
      onClose={onClose}
      title="Conceptos"
      subtitle="Listado general · filtrá por tema, curso o clase"
      size="xlarge"
      tone="tema"
      footer={
        adding ? null : (
          <button
            type="button"
            onClick={startAdding}
            className="desktop-modal-primary-btn rounded-lg bg-[var(--td-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--td-navy-2)]"
          >
            + Concepto
          </button>
        )
      }
    >
      {adding ? (
        <div className="space-y-4">
          <ExploradorRecordParentPicker
            temas={parentOptions.temas}
            temaId={parentTemaId}
            onTemaIdChange={setParentTemaId}
            cursos={parentOptions.cursos}
            clases={parentOptions.clases}
            level={parentLevel}
            onLevelChange={setParentLevel}
            cursoId={parentCursoId}
            onCursoIdChange={setParentCursoId}
            claseId={parentClaseId}
            onClaseIdChange={setParentClaseId}
          />
          {parent &&
          parentPickerValid(
            parentLevel,
            parentTemaId,
            parentCursoId,
            parentClaseId,
          ) ? (
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
        <div className="flex min-h-[min(74vh,820px)] flex-col gap-3">
          <ExploradorRecordsFiltersBar
            layout="stacked"
            filters={filters}
            onChange={setFilters}
            temas={temas}
            cursos={cursos}
            clases={clases}
            searchSlot={
              <RecordsSearchField
                inputRef={inputRef}
                value={query}
                onChange={setQuery}
                fullWidth
                placeholder="Descripción, título, tema, curso, clase…"
              />
            }
          />

          {query.trim() && rows.length === 0 ? (
            <EmptyState text={`Sin coincidencias para «${query.trim()}».`} />
          ) : rows.length === 0 ? (
            <EmptyState text="No hay conceptos con estos filtros." />
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--td-line)]">
              <table className="desktop-data-table w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-[var(--td-line-soft)]/95 backdrop-blur-sm">
                  <tr className="border-b border-[var(--td-line)] text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                    <th className="px-3 py-2.5">Tema</th>
                    <th className="px-3 py-2.5">Curso</th>
                    <th className="px-3 py-2.5">Clase</th>
                    <th className="px-3 py-2.5">Título</th>
                    <th className="min-w-[18rem] px-3 py-2.5">Descripción</th>
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
                        <td className="min-w-[18rem] max-w-[32rem] whitespace-normal px-3 py-2.5 text-[var(--td-ink-soft)]">
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

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--td-line)] px-4 py-10 text-center text-sm text-[var(--td-faint)]">
      {text}
    </p>
  );
}
