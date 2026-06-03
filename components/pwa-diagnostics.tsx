"use client";

import { useEffect, useState } from "react";
import { isLikelyInAppBrowser } from "@/lib/pwa-platform";

type PwaDiag = { bipAt: number | null; installedAt: number | null };

type DiagState = {
  secureContext: boolean;
  swSupported: boolean;
  swRegistered: boolean;
  swActive: boolean;
  swControlling: boolean;
  swScope: string | null;
  manifestLink: string | null;
  bipFiredEarly: boolean;
  bipFiredAfterMount: boolean;
  displayStandalone: boolean;
  inAppBrowser: boolean;
  installedFlag: boolean;
  everStandaloneFlag: boolean;
  userAgent: string;
};

function readWindowDiag(): PwaDiag {
  const w = window as unknown as { __pwaDiag?: PwaDiag };
  return w.__pwaDiag ?? { bipAt: null, installedAt: null };
}

function Row({ label, ok, value }: { label: string; ok: boolean | null; value: string }) {
  const dot =
    ok === null ? "bg-slate-500" : ok ? "bg-emerald-400" : "bg-rose-400";
  return (
    <li className="flex items-start justify-between gap-3 border-b border-slate-800/60 py-1.5 last:border-0">
      <span className="flex items-center gap-2 text-slate-400">
        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="text-right font-mono text-[11px] text-slate-200 break-all">
        {value}
      </span>
    </li>
  );
}

/** Panel TEMPORAL de diagnóstico de instalación PWA. Quitar cuando se resuelva. */
export function PwaDiagnostics() {
  const [diag, setDiag] = useState<DiagState | null>(null);

  useEffect(() => {
    let bipAfterMount = false;
    const onBip = () => {
      bipAfterMount = true;
      collect();
    };
    window.addEventListener("beforeinstallprompt", onBip);

    function collect() {
      const reg =
        typeof navigator !== "undefined" && "serviceWorker" in navigator
          ? navigator.serviceWorker.controller
          : null;
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      const winDiag = readWindowDiag();

      setDiag((prev) => ({
        secureContext: window.isSecureContext,
        swSupported: "serviceWorker" in navigator,
        swRegistered: prev?.swRegistered ?? false,
        swActive: prev?.swActive ?? false,
        swControlling: Boolean(reg),
        swScope: prev?.swScope ?? null,
        manifestLink: link?.getAttribute("href") ?? null,
        bipFiredEarly: winDiag.bipAt !== null,
        bipFiredAfterMount: bipAfterMount || (prev?.bipFiredAfterMount ?? false),
        displayStandalone: window.matchMedia("(display-mode: standalone)").matches,
        inAppBrowser: isLikelyInAppBrowser(),
        installedFlag: window.localStorage.getItem("pwa-installed-v1") === "1",
        everStandaloneFlag:
          window.localStorage.getItem("pwa-ever-standalone-v1") === "1",
        userAgent: navigator.userAgent,
      }));
    }

    collect();

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistration().then((reg) => {
        setDiag((prev) =>
          prev
            ? {
                ...prev,
                swRegistered: Boolean(reg),
                swActive: Boolean(reg?.active),
                swScope: reg?.scope ?? null,
              }
            : prev,
        );
      });
    }

    const interval = window.setInterval(collect, 1500);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.clearInterval(interval);
    };
  }, []);

  if (!diag) return null;

  return (
    <section className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 text-xs">
      <h2 className="m-0 text-xs font-semibold uppercase tracking-wide text-amber-300">
        Diagnóstico PWA (temporal)
      </h2>
      <ul className="mt-3 list-none p-0">
        <Row label="Contexto seguro (HTTPS)" ok={diag.secureContext} value={String(diag.secureContext)} />
        <Row label="Soporta Service Worker" ok={diag.swSupported} value={String(diag.swSupported)} />
        <Row label="SW registrado" ok={diag.swRegistered} value={String(diag.swRegistered)} />
        <Row label="SW activo" ok={diag.swActive} value={String(diag.swActive)} />
        <Row label="SW controla la página" ok={diag.swControlling} value={String(diag.swControlling)} />
        <Row label="SW scope" ok={diag.swScope ? true : null} value={diag.swScope ?? "—"} />
        <Row label="<link rel=manifest>" ok={Boolean(diag.manifestLink)} value={diag.manifestLink ?? "ausente"} />
        <Row
          label="beforeinstallprompt (temprano, window)"
          ok={diag.bipFiredEarly}
          value={diag.bipFiredEarly ? "SÍ disparó" : "no"}
        />
        <Row
          label="beforeinstallprompt (tras montar React)"
          ok={diag.bipFiredAfterMount}
          value={diag.bipFiredAfterMount ? "SÍ disparó" : "no"}
        />
        <Row label="display-mode standalone" ok={diag.displayStandalone ? true : null} value={String(diag.displayStandalone)} />
        <Row label="Navegador in-app (WhatsApp/IG)" ok={diag.inAppBrowser ? false : true} value={String(diag.inAppBrowser)} />
        <Row label="flag pwa-installed" ok={null} value={String(diag.installedFlag)} />
        <Row label="flag ever-standalone" ok={null} value={String(diag.everStandaloneFlag)} />
        <Row label="User-Agent" ok={null} value={diag.userAgent} />
      </ul>
      <p className="mt-3 mb-0 leading-relaxed text-amber-200/80">
        Si <strong>beforeinstallprompt (temprano)</strong> = SÍ pero <strong>(tras montar React)</strong> = no,
        el evento llega antes de que el botón lo capture (problema de timing por auth). Si ambos = no,
        Chrome aún no considera instalable la app.
      </p>
    </section>
  );
}
