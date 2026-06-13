"use client";

import type { MapaDesarrolloDetalleScope } from "@/lib/desarrollos-lienzo-types";
import { useMapaDesarrollosDetalle } from "@/app/hooks/useMapaDesarrollosDetalle";
import { AlertText } from "@/components/ui";
import { CardChatLinkIcon } from "@/components/shared/links/card-chat-link-icon";
import { DesarrollosEmptyState } from "@/components/mobile/desarrollos/desarrollos-chrome";
import { Layers, Play, X } from "lucide-react";

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
    <div className="absolute inset-0 z-30 flex flex-col bg-stone-50/95 backdrop-blur-sm dark:bg-stone-950/95">
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EA580C]/10 text-[#EA580C]">
            <Layers className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EA580C]">
              Detalle desarrollos
            </p>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {scope.parentLabel}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white active:scale-95 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-900"
        >
          <X className="h-4 w-4" aria-hidden />
          Cerrar
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? <p className="text-sm text-stone-500">Cargando acciones…</p> : null}
        {error ? <AlertText>{error}</AlertText> : null}
        <p className="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">
          {acciones.length} acciones · {enlaces.length} enlaces en overlay
        </p>
        {acciones.length === 0 && !loading ? (
          <DesarrollosEmptyState
            icon={Play}
            title="Sin acciones"
            hint="Creá acciones desde el explorador o la vista móvil."
          />
        ) : (
          <ul className="space-y-2">
            {acciones.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-stone-700 dark:bg-stone-900"
              >
                <div className="flex items-start gap-2">
                  <Play
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#EA580C]"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{a.nombre}</p>
                    {a.descripcion ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
                        {a.descripcion}
                      </p>
                    ) : null}
                  </div>
                  <CardChatLinkIcon linkChat={a.link_chat} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
