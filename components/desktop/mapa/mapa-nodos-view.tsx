"use client";

import dynamic from "next/dynamic";
import { useMapaNodos } from "@/app/hooks/useMapaNodos";
import type { MapaNodo } from "@/app/types/mapa";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { MapaNodoForm } from "@/components/desktop/mapa/mapa-nodo-form";
import { MapaObjetivoFiltroBar } from "@/components/desktop/mapa/mapa-objetivo-ui";
import { AlertText, LoadingText } from "@/components/ui";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import type { MapaObjetivoFiltro } from "@/lib/mapa-objetivo";
import { posicionNodoEnLienzo } from "@/lib/mapa-layout";
import { useCallback, useState } from "react";

const MapaCanvas = dynamic(
  () =>
    import("@/components/desktop/mapa/mapa-canvas").then((m) => ({
      default: m.MapaCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-[#f1f5f9] text-sm text-[var(--td-faint)]">
        Cargando lienzo…
      </div>
    ),
  },
);

type VistaMapa = "lienzo" | "lista";

/** Mapa de conocimiento — ABM + lienzo (ADR 009). Solo escritorio. */
export function MapaNodosView() {
  const {
    nodos,
    enlaces,
    objetivos,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlace,
    removeEnlace,
  } = useMapaNodos();
  const [vista, setVista] = useState<VistaMapa>("lienzo");
  const [filtroObjetivo, setFiltroObjetivo] =
    useState<MapaObjetivoFiltro>("todos");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MapaNodo | null>(null);

  const handleEditNodo = useCallback(
    (id: number) => {
      const nodo = nodos.find((n) => n.id === id);
      if (nodo) setEditing(nodo);
    },
    [nodos],
  );

  const handlePositionSaved = useCallback(
    (id: number, pos_x: number, pos_y: number) => {
      patchPosicion(id, pos_x, pos_y);
    },
    [patchPosicion],
  );

  function tituloNodo(id: number): string {
    return nodos.find((n) => n.id === id)?.titulo ?? `#${id}`;
  }

  function closeModals() {
    setCreating(false);
    setEditing(null);
  }

  async function onSaved() {
    closeModals();
    await reload();
  }

  if (loading) {
    return <LoadingText>Cargando nodos…</LoadingText>;
  }

  if (error) {
    return (
      <AlertText>
        {error.includes("mapa_nodos") || error.includes("mapa_enlaces")
          ? "Las tablas del mapa aún no existen en Supabase. Ejecutá docs/sql/002-schema-mapa-conocimiento.sql en el SQL Editor."
          : error.includes("objetivos")
            ? "La tabla objetivos no existe o no tiene permisos. Ejecutá docs/sql/003-schema-objetivos.sql."
            : error}
      </AlertText>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mapa-toolbar flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-white/15 px-3 py-2">
        {vista === "lienzo" ? (
          <MapaObjetivoFiltroBar
            objetivos={objetivos}
            value={filtroObjetivo}
            onChange={setFiltroObjetivo}
          />
        ) : null}
        <div
          className="flex rounded-lg border border-white/25 bg-[var(--td-navy)]/90 p-0.5"
          role="tablist"
          aria-label="Vista del mapa"
        >
          {(
            [
              { id: "lienzo" as const, label: "Lienzo" },
              { id: "lista" as const, label: "Lista" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={vista === id}
              onClick={() => setVista(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                vista === id
                  ? "bg-[var(--td-navy)] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-lg bg-[var(--td-navy)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--td-navy-2)]"
        >
          + Nuevo nodo
        </button>
      </div>

      <div
        className={vista === "lienzo" ? "flex min-h-0 flex-1 flex-col" : "hidden"}
        role="tabpanel"
        aria-label="Lienzo"
        aria-hidden={vista !== "lienzo"}
      >
        <MapaCanvas
          nodos={nodos}
          enlaces={enlaces}
          objetivos={objetivos}
          filtroObjetivo={filtroObjetivo}
          onEditNodo={handleEditNodo}
          onPositionSaved={handlePositionSaved}
          onEnlaceCreated={addEnlace}
          onEnlaceRemoved={removeEnlace}
        />
      </div>

      <div
        className={vista === "lista" ? "min-h-0 flex-1 overflow-y-auto px-4 py-3" : "hidden"}
        role="tabpanel"
        aria-label="Lista"
        aria-hidden={vista !== "lista"}
      >
        {nodos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--td-line)] px-6 py-14 text-center text-sm text-[var(--td-faint)]">
            Todavía no hay nodos. Creá el primero para armar tu mapa.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
              <table className="desktop-data-table w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/60 text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                    <th className="px-3 py-2.5">Título</th>
                    <th className="px-3 py-2.5">Etapa</th>
                    <th className="px-3 py-2.5">Carril</th>
                    <th className="px-3 py-2.5">Posición</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {nodos.map((n) => (
                    <tr
                      key={n.id}
                      className="border-b border-[var(--td-line)]/80 last:border-0 hover:bg-[var(--td-line-soft)]/35"
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-[var(--td-ink)]">{n.titulo}</p>
                        {n.descripcion?.trim() ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--td-ink-soft)]">
                            {n.descripcion}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{n.etapa}</td>
                      <td className="px-3 py-2.5 tabular-nums">{n.carril}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--td-ink-soft)]">
                        {(() => {
                          const p = posicionNodoEnLienzo(n);
                          return `${Math.round(p.x)}, ${Math.round(p.y)}`;
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setEditing(n)}
                          className="rounded-lg border border-[var(--td-line)] px-2.5 py-1 text-xs font-semibold text-[var(--td-navy)] hover:bg-[var(--td-line-soft)]"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[var(--td-faint)]">
                Enlaces ({enlaces.length})
              </h2>
              {enlaces.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--td-line)] px-4 py-8 text-center text-sm text-[var(--td-faint)]">
                  Todavía no hay enlaces. Creálos en el lienzo arrastrando entre nodos.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--td-line)]">
                  <table className="desktop-data-table w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/60 text-[11px] font-bold uppercase tracking-wide text-[var(--td-ink-soft)]">
                        <th className="px-3 py-2.5">Origen</th>
                        <th className="px-3 py-2.5">Destino</th>
                        <th className="px-3 py-2.5">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enlaces.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-[var(--td-line)]/80 last:border-0"
                        >
                          <td className="px-3 py-2.5 font-medium text-[var(--td-ink)]">
                            {tituloNodo(e.origen_id)}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-[var(--td-ink)]">
                            → {tituloNodo(e.destino_id)}
                          </td>
                          <td className="px-3 py-2.5 text-[var(--td-ink-soft)]">
                            {e.tipo ?? "prerequisito"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DesktopModal
        open={creating}
        onClose={closeModals}
        title="Nuevo nodo"
        subtitle="Mapa de conocimiento"
      >
        <div className={estudioFormWellClass("tema")}>
          <MapaNodoForm onSuccess={() => void onSaved()} />
        </div>
      </DesktopModal>

      <DesktopModal
        open={editing != null}
        onClose={closeModals}
        title="Editar nodo"
        subtitle={editing?.titulo}
      >
        {editing ? (
          <div className={estudioFormWellClass("tema")}>
            <MapaNodoForm
              nodo={editing}
              onSuccess={() => void onSaved()}
              onDelete={() => void onSaved()}
            />
          </div>
        ) : null}
      </DesktopModal>
    </div>
  );
}
