"use client";

import { PWA_HOME_ICON_LABEL } from "@/lib/pwa-home-label";
import { PUBLIC_STATIC_IMAGE_QUERY } from "@/lib/public-static-image-query";

/** Android: PWA instalada pero abierta en navegador — ir al ícono de inicio (ADR 004). */
export function AndroidOpenFromHomeHelp() {
  return (
    <div
      className="rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50 to-white px-4 py-5 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p className="m-0 mb-1 text-lg font-semibold text-emerald-950">App instalada</p>
      <p className="m-0 mb-4 text-sm text-emerald-800">
        Salí del navegador y abrí el ícono <strong>{PWA_HOME_ICON_LABEL}</strong> en tu inicio.
      </p>
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 overflow-hidden rounded-[14px] border border-slate-200 shadow-sm">
            <img
              src={`/logo-identidad.png${PUBLIC_STATIC_IMAGE_QUERY}`}
              alt="Ícono de la app"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="m-0 text-[11px] font-semibold text-emerald-900">
            {PWA_HOME_ICON_LABEL}
          </p>
        </div>
      </div>
    </div>
  );
}
