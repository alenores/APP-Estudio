"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { InstallPwaButton } from "@/app/install-pwa-button";
import { usePwaOnDeviceInBrowser } from "@/app/hooks/usePwaOnDeviceInBrowser";
import { AndroidOpenFromHomeHelp } from "@/components/mobile/pwa/android-open-from-home-help";
import { IosPwaInstallHelp } from "@/components/mobile/pwa/ios-pwa-install-help";
import {
  PageLead,
  PageTitle,
  PrimaryButtonLink,
  SecondaryButtonLink,
  SurfaceCard,
} from "@/components/ui";
import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { NAV_STAGE_MAIN_CLASS } from "@/lib/nav-stage";
import { createClient } from "@/lib/supabase/client";
import {
  academicoEntryPath,
  desarrollosEntryPath,
} from "@/lib/shell-routes";
import { isMobileShellClient } from "@/lib/shell-detect";
import {
  readContentTypology,
  writeContentTypology,
  type ContentTypology,
} from "@/lib/content-typology";
import {
  getPwaInstalledServerSnapshot,
  getPwaInstalledSnapshot,
  isIphoneForPwaInstall,
  isStandaloneMode,
  subscribePwaInstalled,
} from "@/lib/pwa-platform";

export default function HomePage() {
  const router = useRouter();
  const [standalone, setStandalone] = useState(false);
  const [isIphone, setIsIphone] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [typology, setTypology] = useState<ContentTypology>("academico");

  const isInstalledMode = useSyncExternalStore(
    subscribePwaInstalled,
    () => isStandaloneMode() || getPwaInstalledSnapshot(),
    getPwaInstalledServerSnapshot,
  );

  const pwaOnDeviceInBrowser = usePwaOnDeviceInBrowser(isInstalledMode);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setIsIphone(isIphoneForPwaInstall());
    setTypology(readContentTypology());
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionEmail(user?.email ?? null);
    });
  }, []);

  function enterTypology(next: ContentTypology) {
    writeContentTypology(next);
    setTypology(next);
    const shell = isMobileShellClient() ? "mobile" : "desktop";
    const href =
      next === "desarrollos"
        ? desarrollosEntryPath(shell)
        : academicoEntryPath(shell);
    router.push(href);
  }

  const showInstallBlock =
    !isInstalledMode && pwaOnDeviceInBrowser !== true;

  return (
    <main className={`${NAV_STAGE_MAIN_CLASS} px-4 py-8`}>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <PageTitle>APP Estudio</PageTitle>
            {standalone || isInstalledMode ? (
              <span className="rounded-full bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                Modo app
              </span>
            ) : null}
          </div>
          <PageLead>
            Elegí la tipología de contenido: académico (Platzi) o desarrollos.
          </PageLead>
          <div className="flex flex-wrap gap-2 pt-1">
            {sessionEmail ? (
              <span className="self-center text-xs text-ink-muted">{sessionEmail}</span>
            ) : (
              <PrimaryButtonLink href="/login">Iniciar sesión</PrimaryButtonLink>
            )}
          </div>
        </header>

        <SurfaceCard>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Tipología
          </h2>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => enterTypology("academico")}
              className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                typology === "academico"
                  ? "border-accent bg-accent-subtle"
                  : "border-border hover:border-accent/40"
              }`}
            >
              <p className="font-semibold text-ink">Académico</p>
              <p className="mt-1 text-sm text-ink-muted">
                Temas, cursos, clases y seguimiento Platzi.
              </p>
            </button>
            <button
              type="button"
              onClick={() => enterTypology("desarrollos")}
              className={`rounded-xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                typology === "desarrollos"
                  ? "border-[#EA580C] bg-[#EA580C]/10"
                  : "border-border hover:border-[#EA580C]/40"
              }`}
            >
              <p className="font-semibold text-ink">Desarrollos</p>
              <p className="mt-1 text-sm text-ink-muted">
                Definición general, específica y acciones.
              </p>
            </button>
          </div>
        </SurfaceCard>

        {sessionEmail ? (
          <div className="flex flex-wrap gap-2">
            <SecondaryButtonLink href={academicoEntryPath(isMobileShellClient() ? "mobile" : "desktop")}>
              Entrar académico
            </SecondaryButtonLink>
            <SecondaryButtonLink href={desarrollosEntryPath(isMobileShellClient() ? "mobile" : "desktop")}>
              Entrar desarrollos
            </SecondaryButtonLink>
          </div>
        ) : null}

        {pwaOnDeviceInBrowser === true ? (
          <section>
            <AndroidOpenFromHomeHelp />
          </section>
        ) : null}

        {showInstallBlock ? (
          <SurfaceCard>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Instalar en el celular
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Agregá la app al inicio para abrirla como{" "}
              <strong className="text-ink">APP Estudio</strong>.
            </p>
            <div className="mt-4 space-y-3">
              <InstallPwaButton fullWidth />
              {isIphone ? <IosPwaInstallHelp /> : null}
              {!isIphone && !standalone ? (
                <p className="text-xs text-ink-muted">
                  En Chrome Android aparece el botón cuando el navegador ofrece instalar. Si no
                  aparece, probá desde el menú ⋮ → Instalar aplicación.
                </p>
              ) : null}
            </div>
          </SurfaceCard>
        ) : null}
      </div>
      <DeployShaFooter />
    </main>
  );
}
