"use client";

import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { useEffect } from "react";

/** Botón Actualizar — tipología desarrollos (ADR 011). */
export function DesarrollosSyncBanner() {
  const {
    packReady,
    syncing,
    syncingDetail,
    hasUpdatesAvailable,
    actualizarDatos,
    recheckUpdates,
    error,
  } = useDesarrollosData();

  useEffect(() => {
    void recheckUpdates();
  }, [recheckUpdates]);

  const showButton = !syncing && (hasUpdatesAvailable || !packReady);

  if (!showButton && !syncing && !error) return null;

  return (
    <div className="w-full space-y-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3.5 py-3 dark:border-stone-700 dark:bg-stone-900/50">
      {syncing ? (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {syncingDetail ?? "Actualizando…"}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
      {showButton ? (
        <button
          type="button"
          onClick={() => void actualizarDatos()}
          className="w-full rounded-xl bg-[#EA580C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#EA580C]/20 transition hover:bg-[#c2410c] active:scale-[0.98]"
        >
          {!packReady ? "Descargar desarrollos" : "Actualizar desarrollos"}
        </button>
      ) : null}
    </div>
  );
}
