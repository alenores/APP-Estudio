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

const PRIORITY_BAR: Record<Pendiente["prioridad"], string> = {
  alta: "bg-red-500",
  media: "bg-amber-500",
  baja: "bg-emerald-500",
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
    <article className="flex overflow-hidden rounded-xl border border-stone-200 bg-paper-elevated shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-stone-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600">
      {/* Franja de prioridad */}
      <span
        className={`w-1 shrink-0 self-stretch rounded-l-xl ${PRIORITY_BAR[pendiente.prioridad]}`}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        {/* Cuerpo principal */}
        <div className="px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
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

        {/* Footer: selector de estado */}
        <div className="flex items-center gap-2.5 border-t border-stone-100 bg-stone-50/70 px-4 py-2.5 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
            Estado
          </span>
          <select
            value={pendiente.estado}
            disabled={updating}
            onChange={(e) => onEstadoChange(e.target.value as Pendiente["estado"])}
            className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-700 transition-colors focus:border-[#EA580C]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            {PENDIENTE_ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {PENDIENTE_ESTADO_LABELS[estado]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </article>
  );
}

type PendienteFormOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

function DefaultPendienteFormOverlay({
  open,
  onClose,
  title,
  children,
}: PendienteFormOverlayProps) {
  return (
    <StudySheet open={open} onClose={onClose} title={title}>
      {children}
    </StudySheet>
  );
}

export function PendientesSection({
  title = "Pendientes",
  pendientes,
  parent,
  onChanged,
  renderFormOverlay = DefaultPendienteFormOverlay,
}: {
  title?: string;
  pendientes: Pendiente[];
  parent: PendienteParent;
  onChanged: () => void;
  /** Escritorio: pasar wrapper con DesktopModal (ADR 008). */
  renderFormOverlay?: (props: PendienteFormOverlayProps) => ReactNode;
}) {
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
        count={pendientes.length > 0 ? pendientes.length : undefined}
        actionLabel="+ Nuevo"
        onAction={() => setCreateOpen(true)}
      />

      {pendientes.length === 0 ? (
        <DesarrollosEmptyState
          icon={ClipboardList}
          title="Sin pendientes"
          hint="Registrá tareas abiertas con + Nuevo."
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
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

      {renderFormOverlay({
        open: createOpen,
        onClose: () => setCreateOpen(false),
        title: "Nuevo pendiente",
        children: (
          <PendienteForm
            parent={parent}
            onSuccess={() => {
              setCreateOpen(false);
              onChanged();
            }}
          />
        ),
      })}

      {renderFormOverlay({
        open: editPendiente != null,
        onClose: () => setEditPendiente(null),
        title: "Editar pendiente",
        children: editPendiente ? (
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
        ) : null,
      })}
    </>
  );
}

export function PendienteGlobalRow({
  pendiente,
  nodeLabel,
  nodeHref,
  onChanged,
}: {
  pendiente: Pendiente;
  nodeLabel: string;
  nodeHref: string;
  onChanged: () => void;
}) {
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
            En:{" "}
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
