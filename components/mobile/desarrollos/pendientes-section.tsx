"use client";

import type { Pendiente } from "@/app/types/desarrollos";
import { SurfaceCard, TextLink } from "@/components/ui";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { PendienteForm } from "@/components/shared/forms/pendiente-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { patchPendienteEstado, type PendienteParent } from "@/lib/desarrollos-queries";
import {
  PENDIENTE_ESTADO_BADGE_CLASS,
  PENDIENTE_ESTADO_LABELS,
  PENDIENTE_ESTADOS,
  PENDIENTE_PRIORIDAD_BADGE_CLASS,
  PENDIENTE_PRIORIDAD_LABELS,
} from "@/lib/pendiente-ui";
import { useState } from "react";

type PendientesSectionProps = {
  title?: string;
  pendientes: Pendiente[];
  parent: PendienteParent;
  onChanged: () => void;
};

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
      <div className="mb-3 mt-6 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="text-xs font-semibold text-indigo-800"
        >
          + Nuevo
        </button>
      </div>

      {pendientes.length === 0 ? (
        <p className="text-sm text-ink-muted">Sin pendientes.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pendientes.map((p) => (
            <li key={p.id}>
              <SurfaceCard className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPendiente(p)}
                    className="text-left text-sm font-semibold text-ink"
                  >
                    {p.titulo}
                  </button>
                  <div className="flex flex-wrap gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PENDIENTE_ESTADO_BADGE_CLASS[p.estado]}`}
                    >
                      {PENDIENTE_ESTADO_LABELS[p.estado]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PENDIENTE_PRIORIDAD_BADGE_CLASS[p.prioridad]}`}
                    >
                      {PENDIENTE_PRIORIDAD_LABELS[p.prioridad]}
                    </span>
                  </div>
                </div>
                {p.descripcion ? (
                  <p className="text-xs text-ink-muted">{p.descripcion}</p>
                ) : null}
                <label className="flex items-center gap-2 text-xs text-ink-muted">
                  <span>Estado</span>
                  <select
                    value={p.estado}
                    disabled={updatingId === p.id}
                    onChange={(e) =>
                      void handleEstadoChange(p, e.target.value as Pendiente["estado"])
                    }
                    className="rounded-lg border border-border bg-paper-elevated px-2 py-1 text-xs"
                  >
                    {PENDIENTE_ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {PENDIENTE_ESTADO_LABELS[estado]}
                      </option>
                    ))}
                  </select>
                </label>
              </SurfaceCard>
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
      <SurfaceCard className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="text-left text-sm font-semibold text-ink"
          >
            {pendiente.titulo}
          </button>
          <div className="flex flex-wrap gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PENDIENTE_ESTADO_BADGE_CLASS[pendiente.estado]}`}
            >
              {PENDIENTE_ESTADO_LABELS[pendiente.estado]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PENDIENTE_PRIORIDAD_BADGE_CLASS[pendiente.prioridad]}`}
            >
              {PENDIENTE_PRIORIDAD_LABELS[pendiente.prioridad]}
            </span>
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          Nodo: <TextLink href={nodeHref}>{nodeLabel}</TextLink>
        </p>
        {pendiente.descripcion ? (
          <p className="text-xs text-ink-muted">{pendiente.descripcion}</p>
        ) : null}
        <select
          value={pendiente.estado}
          disabled={updating}
          onChange={(e) => void handleEstadoChange(e.target.value as Pendiente["estado"])}
          className="rounded-lg border border-border bg-paper-elevated px-2 py-1 text-xs"
        >
          {PENDIENTE_ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {PENDIENTE_ESTADO_LABELS[estado]}
            </option>
          ))}
        </select>
      </SurfaceCard>

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
