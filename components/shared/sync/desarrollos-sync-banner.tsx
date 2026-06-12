"use client";

import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";

/** Botón Actualizar — tipología desarrollos (ADR 011). */
export function DesarrollosSyncBanner() {
  const {
    packReady,
    syncing,
    syncingDetail,
    hasUpdatesAvailable,
    updatesCheckDone,
    actualizarDatos,
    error,
  } = useDesarrollosData();

  const showButton = !syncing && (hasUpdatesAvailable || !packReady);

  if (!showButton && !syncing && !error) return null;

  return (
    <div className="space-y-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3.5 py-3">
      {syncing ? (
        <p className="text-sm text-ink-muted">{syncingDetail ?? "Actualizando…"}</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {showButton ? (
        <button
          type="button"
          onClick={() => void actualizarDatos()}
          className="w-full rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-[0.98]"
        >
          {!packReady ? "Descargar desarrollos" : "Actualizar desarrollos"}
        </button>
      ) : null}
      {packReady && updatesCheckDone && !hasUpdatesAvailable && !syncing ? (
        <p className="text-xs text-ink-muted">Datos locales al día.</p>
      ) : null}
    </div>
  );
}
