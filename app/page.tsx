"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { InstallPwaButton } from "@/app/install-pwa-button";
import { usePwaOnDeviceInBrowser } from "@/app/hooks/usePwaOnDeviceInBrowser";
import { AndroidOpenFromHomeHelp } from "@/components/android-open-from-home-help";
import { IosPwaInstallHelp } from "@/components/ios-pwa-install-help";
import {
  PageLead,
  PageTitle,
  PrimaryButtonLink,
  SecondaryButtonLink,
  SurfaceCard,
} from "@/components/study/form-field";
import { createClient } from "@/lib/supabase/client";
import {
  getPwaInstalledServerSnapshot,
  getPwaInstalledSnapshot,
  isIphoneForPwaInstall,
  isStandaloneMode,
  subscribePwaInstalled,
} from "@/lib/pwa-platform";

export default function HomePage() {
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

  const showInstallBlock =
    !isInstalledMode && pwaOnDeviceInBrowser !== true;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
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
          Tu cuaderno digital para temas, cursos, clases y seguimiento del estudio en
          Platzi.
        </PageLead>
        <div className="flex flex-wrap gap-2 pt-1">
          {sessionEmail ? (
            <>
              <PrimaryButtonLink href="/temas">Mis temas</PrimaryButtonLink>
              <span className="self-center text-xs text-ink-muted">{sessionEmail}</span>
            </>
          ) : (
            <>
              <PrimaryButtonLink href="/login">Iniciar sesión</PrimaryButtonLink>
              <SecondaryButtonLink href="/temas">Mis temas</SecondaryButtonLink>
            </>
          )}
        </div>
      </header>

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
    </main>
  );
}
