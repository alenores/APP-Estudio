"use client";

import type { Pendiente } from "@/app/types/desarrollos";
import { TextLink } from "@/components/ui";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { PendienteForm } from "@/components/shared/forms/pendiente-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import {
  DesarrollosEmptyState,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { patchPendienteEstado, type PendienteParent } from "@/lib/desarrollos-queries";
import {
  PENDIENTE_ESTADO_BADGE_CLASS,
  PENDIENTE_ESTADO_LABELS,
  PENDIENTE_ESTADOS,
  PENDIENTE_PRIORIDAD_BADGE_CLASS,
  PENDIENTE_PRIORIDAD_LABELS,
} from "@/lib/pendiente-ui";
import { ClipboardList } from "lucide-react";
import { useState, type ReactNode } from "react";

type PendientesSectionProps = {
  title?: string;
  pendientes: Pendiente[];
  parent: PendienteParent;
  onChanged: () => void;
};

function PendienteCard({
  pendiente,
  updating,
  onEdit,
  onEstadoChange,
  nodeLine,
}: {
  pendiente: Pendiente;
  updating: boolean;
  onEdit: () => void;
  onEstadoChange: (estado: Pendiente["estado"]) => void;
  nodeLine?: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-paper-elevated shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600">
      <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="text-left text-sm font-semibold leading-snug text-stone-900 transition-colors hover:text-[#EA580C] dark:text-stone-100"
          >
            {pendiente.titulo}
          </button>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PENDIENTE_ESTADO_BADGE_CLASS[pendiente.estado]}`}
            >
              {PENDIENTE_ESTADO_LABELS[pendiente.estado]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PENDIENTE_PRIORIDAD_BADGE_CLASS[pendiente.prioridad]}`}
            >
              {PENDIENTE_PRIORIDAD_LABELS[pendiente.prioridad]}
            </span>
          </div>
        </div>
        {nodeLine}
        {pendiente.descripcion ? (
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            {pendiente.descripcion}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 bg-stone-50/80 px-4 py-2.5 dark:bg-stone-900/60">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
          Estado
        </span>
        <select
          value={pendiente.estado}
          disabled={updating}
          onChange={(e) => onEstadoChange(e.target.value as Pendiente["estado"])}
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-700 transition-colors focus:border-[#EA580C]/50 focus:outline-none disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
        >
          {PENDIENTE_ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {PENDIENTE_ESTADO_LABELS[estado]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

export function PendientesSection({
  title = "Pendientes",
  pendientes,
  parent,
  onChanged,
}: PendientesSectionProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPendiente, setEditPendiente] = useState<Pendiente | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleEstadoChange(pendiente: Pendiente, estado: Pendiente["estado"]) {
    setUpdatingId(pendiente.id);
    const { error } = await patchPendienteEstado(pendiente.id, estado);
    if (!error) {
      await refreshSnapshot();
      onChanged();
    }
    setUpdatingId(null);
  }

  return (
    <>
      <DesarrollosSectionHeader
        title={title}
        actionLabel="+ Nuevo"
        onAction={() => setCreateOpen(true)}
      />

      {pendientes.length === 0 ? (
        <DesarrollosEmptyState
          icon={ClipboardList}
          title="Sin pendientes"
          hint="Registrá tareas abiertas para este nodo con el botón + Nuevo."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {pendientes.map((p) => (
            <li key={p.id}>
              <PendienteCard
                pendiente={p}
                updating={updatingId === p.id}
                onEdit={() => setEditPendiente(p)}
                onEstadoChange={(estado) => void handleEstadoChange(p, estado)}
              />
            </li>
          ))}
        </ul>
      )}

      <StudySheet open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo pendiente">
        <PendienteForm
          parent={parent}
          onSuccess={() => {
            setCreateOpen(false);
            onChanged();
          }}
        />
      </StudySheet>

      <StudySheet
        open={editPendiente != null}
        onClose={() => setEditPendiente(null)}
        title="Editar pendiente"
      >
        {editPendiente ? (
          <PendienteForm
            parent={parent}
            pendiente={editPendiente}
            onSuccess={() => {
              setEditPendiente(null);
              onChanged();
            }}
            onDelete={() => {
              setEditPendiente(null);
              onChanged();
            }}
          />
        ) : null}
      </StudySheet>
    </>
  );
}

type PendienteGlobalRowProps = {
  pendiente: Pendiente;
  nodeLabel: string;
  nodeHref: string;
  onChanged: () => void;
};

export function PendienteGlobalRow({
  pendiente,
  nodeLabel,
  nodeHref,
  onChanged,
}: PendienteGlobalRowProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleEstadoChange(estado: Pendiente["estado"]) {
    setUpdating(true);
    const { error } = await patchPendienteEstado(pendiente.id, estado);
    if (!error) {
      await refreshSnapshot();
      onChanged();
    }
    setUpdating(false);
  }

  return (
    <>
      <PendienteCard
        pendiente={pendiente}
        updating={updating}
        onEdit={() => setEditOpen(true)}
        onEstadoChange={(estado) => void handleEstadoChange(estado)}
        nodeLine={
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Nodo:{" "}
            <TextLink href={nodeHref}>{nodeLabel}</TextLink>
          </p>
        }
      />

      <StudySheet open={editOpen} onClose={() => setEditOpen(false)} title="Editar pendiente">
        <PendienteForm
          parent={
            pendiente.accion_id != null
              ? { accion_id: pendiente.accion_id }
              : pendiente.definicion_especifica_id != null
                ? { definicion_especifica_id: pendiente.definicion_especifica_id }
                : { definicion_general_id: pendiente.definicion_general_id! }
          }
          pendiente={pendiente}
          onSuccess={() => {
            setEditOpen(false);
            onChanged();
          }}
          onDelete={() => {
            setEditOpen(false);
            onChanged();
          }}
        />
      </StudySheet>
    </>
  );
}
