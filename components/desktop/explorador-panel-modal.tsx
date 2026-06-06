"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ConceptoForm } from "@/components/shared/forms/concepto-form";
import { FormParentBanner } from "@/components/shared/forms/form-parent-banner";
import { SeguimientoForm } from "@/components/shared/forms/seguimiento-form";
import { formatFormParentSubtitle } from "@/lib/form-parent-context";
import { formatDuracionMinutos } from "@/lib/format-duracion";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import {
  conceptoParentFromEntity,
  explorerEntityLabel,
  getExplorerEntityRecords,
  seguimientoParentFromEntity,
  type ExplorerEntityRef,
  type ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import {
  estadoLabel,
  nivelEntendimientoLabel,
} from "@/lib/estado-ui";
import { useMemo, useState } from "react";

type ExploradorPanelModalProps = {
  entity: ExplorerEntityRef;
  panel: ExplorerPanelKind;
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

export function ExploradorPanelModal({
  entity,
  panel,
  onClose,
}: ExploradorPanelModalProps) {
  const { cacheData, refreshSnapshot } = useEstudioData();
  const [adding, setAdding] = useState(false);

  const records = useMemo(() => {
    if (!cacheData) return { seguimientos: [], conceptos: [] };
    return getExplorerEntityRecords(cacheData, entity);
  }, [cacheData, entity]);

  async function onFormSuccess() {
    await refreshSnapshot();
    setAdding(false);
  }

  const title =
    panel === "seguimientos" ? "Seguimientos" : "Conceptos";
  const parentSubtitle = formatFormParentSubtitle(entity.kind, entity.nombre);
  const subtitle = adding
    ? parentSubtitle
    : `${explorerEntityLabel(entity.kind)} · ${entity.nombre}`;
  const modalTone = panel === "seguimientos" ? "seguimiento" : undefined;

  return (
    <DesktopModal
      open
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      wide
      tone={modalTone}
      footer={
        adding ? null : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              panel === "seguimientos"
                ? "desktop-modal-primary-btn bg-[var(--estudio-tone-seguimiento-accent)] hover:bg-[#9a7209]"
                : "bg-[var(--td-navy)] hover:bg-[var(--td-navy-2)]"
            }`}
          >
            {panel === "seguimientos" ? "+ Seguimiento" : "+ Concepto"}
          </button>
        )
      }
    >
      {adding ? (
        <div
          className={
            panel === "seguimientos"
              ? estudioFormWellClass("seguimiento")
              : "rounded-xl border border-[var(--td-line)] bg-[var(--td-line-soft)]/30 p-4"
          }
        >
          <FormParentBanner
            parentKind={entity.kind}
            parentName={entity.nombre}
            className="mb-4"
          />
          {panel === "seguimientos" ? (
            <SeguimientoForm
              parent={seguimientoParentFromEntity(entity)}
              onSuccess={() => void onFormSuccess()}
            />
          ) : (
            <ConceptoForm
              parent={conceptoParentFromEntity(entity)}
              onSuccess={() => void onFormSuccess()}
            />
          )}
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="mt-3 text-sm text-[var(--td-ink-soft)] hover:text-[var(--td-ink)]"
          >
            Cancelar
          </button>
        </div>
      ) : panel === "seguimientos" ? (
        <SeguimientosTable items={records.seguimientos} />
      ) : (
        <ConceptosTable items={records.conceptos} />
      )}
    </DesktopModal>
  );
}

function SeguimientosTable({
  items,
}: {
  items: ReturnType<typeof getExplorerEntityRecords>["seguimientos"];
}) {
  if (items.length === 0) {
    return (
      <p className="seguimientos-empty-state rounded-lg border border-dashed px-4 py-10 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay seguimientos.
      </p>
    );
  }

  return (
    <div className="seguimientos-table overflow-x-auto rounded-xl border border-[var(--td-line)]">
      <table className="desktop-data-table w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="seguimientos-table-head border-b border-[var(--td-line)] text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
            <th className="px-3 py-2.5">Fecha</th>
            <th className="px-3 py-2.5">Estado</th>
            <th className="px-3 py-2.5">Avance</th>
            <th className="px-3 py-2.5">Tiempo</th>
            <th className="px-3 py-2.5">Nivel</th>
            <th className="px-3 py-2.5">Comentario</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr
              key={s.id}
              className="seguimientos-table-row border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
            >
              <td className="whitespace-nowrap px-3 py-2.5 text-[var(--td-ink)]">
                {formatFecha(s.fecha_registro)}
              </td>
              <td className="px-3 py-2.5 text-[var(--td-ink-soft)]">
                {estadoLabel(s.etiqueta_estado) ?? "—"}
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
              <td className="max-w-[14rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                {s.comentario?.trim() || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConceptosTable({
  items,
}: {
  items: ReturnType<typeof getExplorerEntityRecords>["conceptos"];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--td-line)] px-4 py-10 text-center text-sm text-[var(--td-faint)]">
        Todavía no hay conceptos.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
      <table className="desktop-data-table w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/60 text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
            <th className="px-3 py-2.5">Título</th>
            <th className="px-3 py-2.5">Jerarquía</th>
            <th className="px-3 py-2.5">Fecha</th>
            <th className="px-3 py-2.5">Descripción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr
              key={c.id}
              className="border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
            >
              <td className="px-3 py-2.5 font-medium text-[var(--td-ink)]">
                {c.titulo}
              </td>
              <td className="px-3 py-2.5 tabular-nums">{c.jerarquia}</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                {formatFecha(c.fecha_registro)}
              </td>
              <td className="max-w-[20rem] truncate px-3 py-2.5 text-[var(--td-ink-soft)]">
                {c.descripcion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
