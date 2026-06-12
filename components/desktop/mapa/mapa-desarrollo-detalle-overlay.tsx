"use client";

import type { MapaDesarrolloDetalleScope } from "@/lib/desarrollos-lienzo-types";
import { useMapaDesarrollosDetalle } from "@/app/hooks/useMapaDesarrollosDetalle";
import { AlertText } from "@/components/ui";

type MapaDesarrolloDetalleOverlayProps = {
  scope: MapaDesarrolloDetalleScope;
  onClose: () => void;
};

/** Overlay capa 1 — listado acciones del general (ADR 011). */
export function MapaDesarrolloDetalleOverlay({
  scope,
  onClose,
}: MapaDesarrolloDetalleOverlayProps) {
  const { acciones, enlaces, loading, error } = useMapaDesarrollosDetalle(scope);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white/95 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-violet-200 px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase text-violet-700">Detalle desarrollos</p>
          <h2 className="text-lg font-semibold">{scope.parentLabel}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-violet-300 px-3 py-1 text-sm font-semibold"
        >
          Cerrar
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? <p className="text-sm text-ink-muted">Cargando acciones…</p> : null}
        {error ? <AlertText>{error}</AlertText> : null}
        <p className="mb-3 text-sm text-ink-muted">
          {acciones.length} acciones · {enlaces.length} enlaces en overlay
        </p>
        <ul className="space-y-2">
          {acciones.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-fuchsia-200 bg-fuchsia-50/50 px-3 py-2 text-sm"
            >
              <p className="font-semibold">{a.nombre}</p>
              {a.descripcion ? (
                <p className="text-xs text-ink-muted">{a.descripcion}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
