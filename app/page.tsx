"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { InstallPwaButton } from "@/app/install-pwa-button";
import { usePwaOnDeviceInBrowser } from "@/app/hooks/usePwaOnDeviceInBrowser";
import { AndroidOpenFromHomeHelp } from "@/components/android-open-from-home-help";
import { IosPwaInstallHelp } from "@/components/ios-pwa-install-help";
import { pingSupabase } from "@/lib/supabase-health";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
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
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const isInstalledMode = useSyncExternalStore(
    subscribePwaInstalled,
    () => isStandaloneMode() || getPwaInstalledSnapshot(),
    getPwaInstalledServerSnapshot,
  );

  const pwaOnDeviceInBrowser = usePwaOnDeviceInBrowser(isInstalledMode);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setIsIphone(isIphoneForPwaInstall());
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionEmail(user?.email ?? null);
    });
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
          Gestión personal de tu estudio en Platzi. Temas, cursos, clases y
          seguimiento (ADR 002).
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/temas"
            className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Mis temas
          </Link>
          {sessionEmail ? (
            <span className="self-center text-xs text-slate-500">{sessionEmail}</span>
          ) : (
            <Link
              href="/login"
              className="inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
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
            Instalá como <strong className="text-slate-200">APP Estudio</strong> para abrirla
            en modo app (sin barra del navegador). Usá el botón cuando Chrome lo habilite o
            el menú ⋮ → Instalar aplicación.
          </p>
          <div className="mt-4 space-y-3">
            <InstallPwaButton fullWidth />
            {isIphone ? <IosPwaInstallHelp /> : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3">
        <p className="m-0 text-xs leading-relaxed text-slate-500">
          Próximo: detalle de curso/clase, altas dedicadas e importador de clases.
        </p>
      </section>
    </main>
  );
}
