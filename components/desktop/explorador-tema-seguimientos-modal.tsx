"use client";

import type { Seguimiento } from "@/app/types/estudio";
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
import { SeguimientoForm } from "@/components/shared/forms/seguimiento-form";
import { HighlightMatch } from "@/components/shared/text/highlight-match";
import {
  estadoLabel,
  nivelEntendimientoLabel,
} from "@/lib/estado-ui";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import { rankSeguimientoRecords } from "@/lib/explorador-records-search";
import {
  filterSeguimientosInScope,
  mergeInitialRecordsFilters,
  resolveRecordContext,
  type RecordsScopeFilters,
} from "@/lib/explorador-tema-records";
import type { SeguimientoParent } from "@/lib/form-parent-types";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import { useMemo, useRef, useEffect, useState } from "react";

type ExploradorTemaSeguimientosModalProps = {
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

export function ExploradorTemaSeguimientosModal({
  cacheData,
  initialFilters,
  onClose,
}: ExploradorTemaSeguimientosModalProps) {
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
    () => filterSeguimientosInScope(cacheData, filters),
    [cacheData, filters],
  );

  const rows = useMemo(() => {
    const ctx = (s: Seguimiento) => resolveRecordContext(cacheData, s);
    const trimmed = query.trim();
    if (!trimmed) {
      return filtered.map((item) => ({ item, score: 0 }));
    }
    return rankSeguimientoRecords(filtered, query, ctx);
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
  ) as SeguimientoParent | null;

  return (
    <DesktopModal
      open
      onClose={onClose}
      title="Seguimientos"
      subtitle="Listado general · filtrá por tema, curso o clase"
      size="xlarge"
      tone="seguimiento"
      footer={
        adding ? null : (
          <button
            type="button"
            onClick={startAdding}
            className="desktop-modal-primary-btn rounded-lg bg-[var(--estudio-tone-seguimiento-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a7209]"
          >
            + Seguimiento
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
            <div className={estudioFormWellClass("seguimiento")}>
              <SeguimientoForm
                parent={parent}
                onSuccess={() => void onFormSuccess()}
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--td-faint)]">
              Completá el destino antes de cargar el seguimiento.
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
                placeholder="Comentario, estado, tema, curso, clase…"
              />
            }
          />

          {query.trim() && rows.length === 0 ? (
            <EmptyState text={`Sin coincidencias para «${query.trim()}».`} />
          ) : rows.length === 0 ? (
            <EmptyState text="No hay seguimientos con estos filtros." />
          ) : (
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--td-line)]">
              <table className="desktop-data-table seguimientos-table w-full min-w-[820px] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-[var(--td-line-soft)]/95 backdrop-blur-sm">
                  <tr className="border-b border-[var(--td-line)] text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                    <th className="px-3 py-2.5">Tema</th>
                    <th className="px-3 py-2.5">Curso</th>
                    <th className="px-3 py-2.5">Clase</th>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Estado</th>
                    <th className="px-3 py-2.5">Avance</th>
                    <th className="px-3 py-2.5">Tiempo</th>
                    <th className="px-3 py-2.5">Entend.</th>
                    <th className="min-w-[16rem] px-3 py-2.5">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ item: s }) => {
                    const ctx = resolveRecordContext(cacheData, s);
                    return (
                      <tr
                        key={s.id}
                        className="seguimientos-table-row border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
                      >
                        <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.temaNombre ?? "—"} query={query} />
                        </td>
                        <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.cursoNombre ?? "—"} query={query} />
                        </td>
                        <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={ctx.claseNombre ?? "—"} query={query} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          {formatFecha(s.fecha_registro)}
                        </td>
                        <td className="px-3 py-2.5">
                          <HighlightMatch
                            text={estadoLabel(s.etiqueta_estado) ?? "—"}
                            query={query}
                          />
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">
                          {s.porcentaje_avance != null ? `${s.porcentaje_avance}%` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          {formatDuracionMinutos(s.tiempo_consumido)}
                        </td>
                        <td className="px-3 py-2.5">
                          {nivelEntendimientoLabel(s.nivel_entendimiento) ?? "—"}
                        </td>
                        <td className="min-w-[16rem] max-w-[28rem] whitespace-normal px-3 py-2.5 text-[var(--td-ink-soft)]">
                          <HighlightMatch text={s.comentario?.trim() || "—"} query={query} />
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
