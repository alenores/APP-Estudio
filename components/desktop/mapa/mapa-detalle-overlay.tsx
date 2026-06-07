"use client";

import dynamic from "next/dynamic";
import { useMapaDetalleHijos } from "@/app/hooks/useMapaDetalleHijos";
import { MapaDetalleCreateModal } from "@/components/desktop/mapa/mapa-detalle-create-modal";
import type { MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { AlertText, LoadingText } from "@/components/ui";
import { useEffect, useState } from "react";

const MapaDetalleCanvas = dynamic(
  () =>
    import("@/components/desktop/mapa/mapa-detalle-canvas").then((m) => ({
      default: m.MapaDetalleCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[var(--td-faint)]">
        Cargando lienzo…
      </div>
    ),
  },
);

type MapaDetalleOverlayProps = {
  scope: MapaDetalleScope;
  onClose: () => void;
};

function hijosLabel(scope: MapaDetalleScope): string {
  if (scope.kind === "tema") return "Cursos";
  if (scope.childKind === "mixto") return "Cursos y logros";
  return scope.childKind === "logro" ? "Logros" : "Cursos";
}

function mapaDetalleErrorMessage(error: string, scope: MapaDetalleScope): string {
  if (error.includes("lienzo_hijos_posiciones")) {
    return "La tabla lienzo_hijos_posiciones no existe o no tiene permisos. Ejecutá docs/sql/012-schema-lienzo-hijos-posiciones.sql.";
  }
  if (error.includes("enlaces_hijos_nodos")) {
    return "La tabla enlaces_hijos_nodos no existe o no tiene permisos. Ejecutá docs/sql/011-schema-enlaces-hijos-nodos.sql.";
  }
  if (error.includes("logros") && scope.childKind === "logro") {
    return "La tabla logros no existe o no tiene permisos. Ejecutá docs/sql/009-schema-logros.sql.";
  }
  return error;
}

/** Capa 1 sobre el lienzo macro — hijos de tema o nodo (ADR 010). */
export function MapaDetalleOverlay({ scope, onClose }: MapaDetalleOverlayProps) {
  const { hijos, enlaces, posiciones, loading, error, addEnlace, removeEnlace, savePosicion, reload } =
    useMapaDetalleHijos(scope);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="mapa-detalle-overlay fixed inset-0 z-50 flex items-stretch justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle: ${scope.parentLabel}`}
    >
      <button
        type="button"
        className="mapa-detalle-backdrop absolute inset-0 bg-[#0f172a]/40 backdrop-blur-[2px]"
        aria-label="Cerrar detalle"
        onClick={onClose}
      />
      <div className="mapa-detalle-panel relative z-10 flex min-h-0 w-full max-w-[min(1400px,96vw)] flex-col overflow-hidden rounded-xl border border-[var(--td-line)] bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.45)]">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--td-line)] bg-[var(--td-line-soft)]/40 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--td-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--td-navy)] hover:bg-[var(--td-line-soft)]"
          >
            ← Volver al mapa
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--td-faint)]">
              {scope.kind === "tema" ? "Tema" : "Nodo objetivo"} ·{" "}
              {hijosLabel(scope)}
            </p>
            <h2 className="truncate text-lg font-bold text-[var(--td-ink)]">
              {scope.parentLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg border border-[var(--td-line)] bg-white px-3 py-1.5 text-sm font-bold text-[var(--td-navy)] hover:bg-[var(--td-line-soft)]"
            title="Agregar curso o logro"
          >
            +
          </button>
          <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--td-ink-soft)] ring-1 ring-[var(--td-line)]">
            {loading ? "…" : hijos.length}{" "}
            {scope.kind === "tema"
              ? "cursos"
              : scope.childKind === "mixto"
                ? "hijos"
                : scope.childKind === "logro"
                  ? "logros"
                  : "cursos"}
            {!loading && enlaces.length > 0 ? (
              <span className="text-[var(--td-faint)]"> · {enlaces.length} enlaces</span>
            ) : null}
          </span>
        </header>

        <div className="mapa-detalle-body flex min-h-0 flex-1 flex-col p-3">
          {loading ? (
            <LoadingText>Cargando {hijosLabel(scope).toLowerCase()}…</LoadingText>
          ) : null}
          {error ? (
            <AlertText>{mapaDetalleErrorMessage(error, scope)}</AlertText>
          ) : null}
          {!loading && !error ? (
            <MapaDetalleCanvas
              scope={scope}
              hijos={hijos}
              enlaces={enlaces}
              posiciones={posiciones}
              onEnlaceCreated={addEnlace}
              onEnlaceRemoved={removeEnlace}
              onPositionSaved={savePosicion}
            />
          ) : null}
        </div>
      </div>

      {creating ? (
        <MapaDetalleCreateModal
          scope={scope}
          hijos={hijos}
          onClose={() => setCreating(false)}
          onCreated={() => void reload()}
        />
      ) : null}
    </div>
  );
}
