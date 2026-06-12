"use client";

import { usePendientesGlobales } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { PendienteGlobalRow } from "@/components/mobile/desarrollos/pendientes-section";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { AlertText, EmptyState, FormSelect, LoadingText } from "@/components/ui";
import type { PendienteEstado, PendientePrioridad } from "@/app/types/desarrollos";
import {
  PENDIENTE_ESTADO_LABELS,
  PENDIENTE_ESTADOS,
  PENDIENTE_PRIORIDAD_LABELS,
  PENDIENTE_PRIORIDADES,
} from "@/lib/pendiente-ui";
import { useMemo, useState } from "react";

export default function PendientesPage() {
  const { rows, loading, error, reload } = usePendientesGlobales();
  const [estadoFilter, setEstadoFilter] = useState<PendienteEstado | "">("");
  const [prioridadFilter, setPrioridadFilter] = useState<PendientePrioridad | "">("");

  const filtered = useMemo(() => {
    return rows.filter(({ pendiente }) => {
      if (estadoFilter && pendiente.estado !== estadoFilter) return false;
      if (prioridadFilter && pendiente.prioridad !== prioridadFilter) return false;
      return true;
    });
  }, [rows, estadoFilter, prioridadFilter]);

  return (
    <AppShell title="Pendientes" backHref="/desarrollos" shellTone="tema">
      <DesarrollosSyncBanner />
      {loading ? <LoadingText>Cargando pendientes…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs text-ink-muted">
          Estado
          <FormSelect
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as PendienteEstado | "")}
          >
            <option value="">Todos</option>
            {PENDIENTE_ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {PENDIENTE_ESTADO_LABELS[estado]}
              </option>
            ))}
          </FormSelect>
        </label>
        <label className="space-y-1 text-xs text-ink-muted">
          Prioridad
          <FormSelect
            value={prioridadFilter}
            onChange={(e) => setPrioridadFilter(e.target.value as PendientePrioridad | "")}
          >
            <option value="">Todas</option>
            {PENDIENTE_PRIORIDADES.map((prioridad) => (
              <option key={prioridad} value={prioridad}>
                {PENDIENTE_PRIORIDAD_LABELS[prioridad]}
              </option>
            ))}
          </FormSelect>
        </label>
      </div>

      {!loading && !error && filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState>No hay pendientes con esos filtros.</EmptyState>
        </div>
      ) : null}

      <ul className="mt-4 flex flex-col gap-3 pb-8">
        {filtered.map(({ pendiente, node }) => (
          <li key={pendiente.id}>
            <PendienteGlobalRow
              pendiente={pendiente}
              nodeLabel={node.label}
              nodeHref={node.href}
              onChanged={() => void reload()}
            />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
