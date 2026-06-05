"use client";

import { useState } from "react";
import { isLikelyInAppBrowser } from "@/lib/pwa-platform";
import { PWA_HOME_ICON_LABEL } from "@/lib/pwa-home-label";
import { PUBLIC_STATIC_IMAGE_QUERY } from "@/lib/public-static-image-query";

/** iPhone: pasos para Agregar a pantalla de inicio (ADR 004). */
export function IosPwaInstallHelp() {
  const [open, setOpen] = useState(false);
  const inApp = isLikelyInAppBrowser();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/80 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left ${
          !open ? "ios-install-pulse" : ""
        }`}
      >
        <span className="text-sm font-semibold text-indigo-950">
          Instalar en iPhone (Safari)
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-indigo-600 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-indigo-100 px-4 pb-4 pt-3 text-sm text-indigo-900">
          {inApp ? (
            <p className="m-0 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-950">
              Abrí esta página en <strong>Safari</strong> (no desde WhatsApp u otra app) para
              poder agregar el ícono.
            </p>
          ) : null}
          <ol className="m-0 list-decimal space-y-2 pl-5">
            <li>
              Tocá <strong>Compartir</strong> (cuadrado con flecha hacia arriba) en la barra de
              Safari.
            </li>
            <li>
              Elegí <strong>Agregar a inicio</strong> o <strong>Add to Home Screen</strong>.
            </li>
            <li>
              Confirmá el nombre <strong>{PWA_HOME_ICON_LABEL}</strong> y tocá Agregar.
            </li>
          </ol>
          <div className="flex justify-center pt-1">
            <div className="flex flex-col items-center gap-1">
              <div className="h-14 w-14 overflow-hidden rounded-xl border border-indigo-200 shadow-sm">
                <img
                  src={`/logo-identidad.png${PUBLIC_STATIC_IMAGE_QUERY}`}
                  alt="Vista previa del ícono"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="m-0 text-[11px] font-semibold text-indigo-800">
                {PWA_HOME_ICON_LABEL}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
