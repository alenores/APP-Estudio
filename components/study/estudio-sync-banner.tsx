"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";

/**
 * Botón Actualizar y estado de sync (ADR 001). Usar en listado de temas.
 */
export function EstudioSyncBanner() {
  const {
    packReady,
    syncing,
    syncingDetail,
    hasUpdatesAvailable,
    updatesCheckDone,
    actualizarDatos,
    error,
  } = useEstudioData();

  const showButton = !syncing && (hasUpdatesAvailable || !packReady);

  if (!showButton && !syncing && !error) return null;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-paper-elevated px-3.5 py-3">
      {syncing ? (
        <p className="text-sm text-ink-muted">
          {syncingDetail ?? "Actualizando…"}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {showButton ? (
        <button
          type="button"
          onClick={() => void actualizarDatos()}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 active:scale-[0.98]"
        >
          {!packReady ? "Descargar datos" : "Actualizar datos"}
        </button>
      ) : null}
      {packReady && updatesCheckDone && !hasUpdatesAvailable && !syncing ? (
        <p className="text-xs text-ink-muted">Datos locales al día.</p>
      ) : null}
    </div>
  );
}
