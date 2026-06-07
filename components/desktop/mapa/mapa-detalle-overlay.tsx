"use client";

import dynamic from "next/dynamic";
import { useMapaDetalleHijos } from "@/app/hooks/useMapaDetalleHijos";
import { MapaDetalleCreateModal } from "@/components/desktop/mapa/mapa-detalle-create-modal";
import { MapaDetalleParentPanel } from "@/components/desktop/mapa/mapa-detalle-parent-panel";
import type { MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { AlertText, LoadingText } from "@/components/ui";
import type { MapaDetalleHijoKind } from "@/lib/mapa-detalle-types";
import { formLienzoColocacionDesdePadreDetalle } from "@/lib/form-lienzo-colocacion-types";
import { useEffect, useState } from "react";

type DetalleCreateState =
  | { source: "footer" }
  | {
      source: "card";
      kind: MapaDetalleHijoKind;
      id: number;
      label: string;
    };

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
  const [creating, setCreating] = useState<DetalleCreateState | null>(null);

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
      <div className="mapa-detalle-panel relative z-10 flex min-h-0 w-full max-w-[min(1680px,98vw)] flex-col overflow-hidden rounded-xl border border-[var(--td-line)] bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.45)]">
        <button
          type="button"
          onClick={onClose}
          className="mapa-detalle-close absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--td-line)] bg-white/95 text-xl font-light leading-none text-[var(--td-ink-soft)] shadow-sm backdrop-blur-sm transition-[transform,background-color,border-color,color] duration-150 hover:border-[var(--td-navy)]/30 hover:bg-white hover:text-[var(--td-navy)] active:scale-95"
          aria-label="Cerrar detalle"
          title="Cerrar"
        >
          ×
        </button>

        <div className="mapa-detalle-body flex min-h-0 flex-1 flex-col overflow-hidden p-3 pt-12">
          <div className="mapa-detalle-split flex min-h-0 flex-1 gap-3 overflow-hidden">
            <aside
              className="mapa-detalle-parent-column flex min-h-0 w-[min(440px,38%)] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]"
              aria-label={
                scope.kind === "tema" ? "Detalle del tema" : "Detalle del nodo"
              }
            >
              <MapaDetalleParentPanel
                scope={scope}
                onCreateHijo={() => setCreating({ source: "footer" })}
                onParentDeleted={onClose}
              />
            </aside>

            <section
              className="mapa-detalle-canvas-column flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              aria-label={`Lienzo de ${hijosLabel(scope).toLowerCase()}`}
            >
              {loading ? (
                <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-[var(--td-line)] bg-[#f8fafc]">
                  <LoadingText>
                    Cargando {hijosLabel(scope).toLowerCase()}…
                  </LoadingText>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-[var(--td-line)] bg-[#f8fafc] p-3">
                  <AlertText>{mapaDetalleErrorMessage(error, scope)}</AlertText>
                </div>
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
                  onAddFromHijo={(kind, id, label) =>
                    setCreating({ source: "card", kind, id, label })
                  }
                />
              ) : null}
            </section>
          </div>
        </div>
      </div>

      {creating ? (
        <MapaDetalleCreateModal
          scope={scope}
          hijos={hijos}
          onClose={() => setCreating(null)}
          onCreated={() => void reload()}
          initialKind={
            creating.source === "card"
              ? creating.kind
              : undefined
          }
          initialLienzoColocacion={
            creating.source === "card"
              ? formLienzoColocacionDesdePadreDetalle({
                  kind: creating.kind,
                  id: creating.id,
                })
              : undefined
          }
          lockEnlacePadre={creating.source === "card"}
          enlacePadreLabel={
            creating.source === "card" ? creating.label : undefined
          }
          lockKind={creating.source === "card"}
        />
      ) : null}
    </div>
  );
}
