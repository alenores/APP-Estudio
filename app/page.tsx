"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { InstallPwaButton } from "@/app/install-pwa-button";
import { usePwaOnDeviceInBrowser } from "@/app/hooks/usePwaOnDeviceInBrowser";
import { AndroidOpenFromHomeHelp } from "@/components/android-open-from-home-help";
import { IosPwaInstallHelp } from "@/components/ios-pwa-install-help";
import { pingSupabase } from "@/lib/supabase-health";
import {
  getPwaInstalledServerSnapshot,
  getPwaInstalledSnapshot,
  isIphoneForPwaInstall,
  isStandaloneMode,
  subscribePwaInstalled,
} from "@/lib/pwa-platform";

type SupabaseStatus =
  | { state: "loading" }
  | { state: "ok"; message: string; detail?: string }
  | { state: "error"; message: string; detail?: string };

export default function HomePage() {
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    state: "loading",
  });
  const [standalone, setStandalone] = useState(false);
  const [isIphone, setIsIphone] = useState(false);

  const isInstalledMode = useSyncExternalStore(
    subscribePwaInstalled,
    () => isStandaloneMode() || getPwaInstalledSnapshot(),
    getPwaInstalledServerSnapshot,
  );

  const pwaOnDeviceInBrowser = usePwaOnDeviceInBrowser(isInstalledMode);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setIsIphone(isIphoneForPwaInstall());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void pingSupabase().then((result) => {
      if (cancelled) return;
      setSupabaseStatus(
        result.ok
          ? { state: "ok", message: result.message, detail: result.detail }
          : { state: "error", message: result.message, detail: result.detail },
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showInstallBlock =
    !isInstalledMode && pwaOnDeviceInBrowser !== true;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">APP Estudio</h1>
          {standalone || isInstalledMode ? (
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-200">
              Modo app
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          Gestión personal de tu estudio en Platzi. Semilla del proyecto — en la
          siguiente fase definimos tablas y pantallas (ADR 002).
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Estado Supabase
        </h2>
        <div className="mt-3">
          {supabaseStatus.state === "loading" ? (
            <p className="text-sm text-slate-300">Verificando conexión…</p>
          ) : null}
          {supabaseStatus.state === "ok" ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  {supabaseStatus.message}
                </p>
                {supabaseStatus.detail ? (
                  <p className="mt-1 text-xs text-slate-500">{supabaseStatus.detail}</p>
                ) : null}
              </div>
            </div>
          ) : null}
          {supabaseStatus.state === "error" ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400" />
              <div>
                <p className="text-sm font-medium text-rose-300">
                  {supabaseStatus.message}
                </p>
                {supabaseStatus.detail ? (
                  <p className="mt-1 text-xs text-slate-500">{supabaseStatus.detail}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {pwaOnDeviceInBrowser === true ? (
        <section>
          <AndroidOpenFromHomeHelp />
        </section>
      ) : null}

      {showInstallBlock ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Instalar en el celular
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Agregá la app al inicio para abrirla como <strong className="text-slate-200">APP Estudio</strong>.
            Requiere HTTPS o localhost; en producción usá <code className="text-xs">npm run build</code> y{" "}
            <code className="text-xs">npm start</code> para probar la PWA.
          </p>
          <div className="mt-4 space-y-3">
            <InstallPwaButton fullWidth />
            {isIphone ? <IosPwaInstallHelp /> : null}
            {!isIphone && !standalone ? (
              <p className="text-xs text-slate-500">
                En Chrome Android aparece el botón cuando el navegador ofrece instalar. Si no
                aparece, probá desde el menú ⋮ → Instalar aplicación.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3">
        <p className="m-0 text-xs leading-relaxed text-slate-500">
          Fase 2: cursos, sesiones de estudio y formularios según{" "}
          <code className="text-slate-400">docs/adr/002-supabase-schema-contract.md</code>.
        </p>
      </section>
    </main>
  );
}
