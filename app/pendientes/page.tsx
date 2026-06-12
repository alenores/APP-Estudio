"use client";

import { usePendientesGlobales } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import {
  DesarrollosEmptyState,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { PendienteGlobalRow } from "@/components/mobile/desarrollos/pendientes-section";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { AlertText, FormSelect, LoadingText } from "@/components/ui";
import {
  PENDIENTE_ESTADO_BADGE_CLASS,
  PENDIENTE_ESTADO_LABELS,
  PENDIENTE_ESTADOS,
  PENDIENTE_PRIORIDAD_LABELS,
  PENDIENTE_PRIORIDADES,
} from "@/lib/pendiente-ui";
import type { PendienteEstado, PendientePrioridad } from "@/app/types/desarrollos";
import { ClipboardList } from "lucide-react";
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

  /** Chips de resumen: conteo por estado en el total (sin filtrar) */
  const statsByEstado = useMemo(() => {
    const counts: Partial<Record<PendienteEstado, number>> = {};
    for (const { pendiente } of rows) {
      counts[pendiente.estado] = (counts[pendiente.estado] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  return (
    <AppShell title="Pendientes" backHref="/desarrollos" shellTone="tema">
      <DesarrollosSyncBanner />

      {loading ? <LoadingText>Cargando pendientes…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}

      {/* Chips resumen por estado */}
      {!loading && rows.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {PENDIENTE_ESTADOS.map((estado) => {
            const n = statsByEstado[estado] ?? 0;
            if (n === 0) return null;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => setEstadoFilter(estadoFilter === estado ? "" : estado)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
                  estadoFilter === estado
                    ? PENDIENTE_ESTADO_BADGE_CLASS[estado] + " ring-2 ring-offset-1 ring-current/30"
                    : PENDIENTE_ESTADO_BADGE_CLASS[estado] + " opacity-60 hover:opacity-100"
                }`}
              >
                <span className="tabular-nums">{n}</span>
                {PENDIENTE_ESTADO_LABELS[estado]}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Filtros */}
      {!loading ? (
        <section className="rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3.5 dark:border-stone-700 dark:bg-stone-900/40">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
            Filtros
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-medium text-stone-500">
              Estado
              <FormSelect
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as PendienteEstado | "")}
                className="mt-1 border-stone-200 text-stone-700 dark:border-stone-700"
              >
                <option value="">Todos</option>
                {PENDIENTE_ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {PENDIENTE_ESTADO_LABELS[estado]}
                  </option>
                ))}
              </FormSelect>
            </label>
            <label className="space-y-1.5 text-xs font-medium text-stone-500">
              Prioridad
              <FormSelect
                value={prioridadFilter}
                onChange={(e) => setPrioridadFilter(e.target.value as PendientePrioridad | "")}
                className="mt-1 border-stone-200 text-stone-700 dark:border-stone-700"
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
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <DesarrollosSectionHeader title="Resultados" count={filtered.length} />

          {filtered.length === 0 ? (
            <DesarrollosEmptyState
              icon={ClipboardList}
              title="No hay pendientes"
              hint="Probá otros filtros o creá pendientes desde un nodo de Desarrollos."
            />
          ) : (
            <ul className="flex flex-col gap-2.5 pb-8">
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
          )}
        </>
      ) : null}
    </AppShell>
  );
}
