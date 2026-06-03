"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getPwaInstalledServerSnapshot,
  getPwaInstalledSnapshot,
  isIphoneForPwaInstall,
  subscribePwaInstalled,
} from "@/lib/pwa-platform";
import {
  beginInstallFeedbackCooldown,
  clearInstallFeedbackCooldown,
  INSTALL_FEEDBACK_DELAY_MS,
  markPwaOnDeviceFromInstallEvent,
  notifyPwaOnDeviceChanged,
} from "@/lib/pwa-on-device";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallPwaButtonProps = {
  fullWidth?: boolean;
};

function ChromeMenuInstallHelp() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-left text-sm text-slate-300">
      <p className="m-0 font-medium text-slate-200">
        Si el botón no responde, instalá desde Chrome:
      </p>
      <ol className="mb-0 mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-400">
        <li>
          Menú <strong className="text-slate-300">⋮</strong> (arriba a la derecha).
        </li>
        <li>
          Elegí <strong className="text-slate-300">Instalar aplicación</strong> o{" "}
          <strong className="text-slate-300">Instalar app</strong>.
        </li>
        <li>
          Si solo ves <strong className="text-slate-300">Agregar a pantalla</strong>,
          borrá accesos directos viejos, recargá la página y probá de nuevo.
        </li>
        <li>Abrí el ícono <strong className="text-slate-300">APP Estudio</strong> desde el inicio (sin barra de URL).</li>
      </ol>
    </div>
  );
}

export function InstallPwaButton({ fullWidth = false }: InstallPwaButtonProps = {}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);
  const isInstalled = useSyncExternalStore(
    subscribePwaInstalled,
    getPwaInstalledSnapshot,
    getPwaInstalledServerSnapshot,
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIphone, setIsIphone] = useState(false);

  useEffect(() => {
    setIsIphone(isIphoneForPwaInstall());
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setDismissedPrompt(false);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
      setDismissedPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isIphone) return null;
  if (isInstalled && !isInstalling) return null;

  const onInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        beginInstallFeedbackCooldown(INSTALL_FEEDBACK_DELAY_MS);
        setInstallPrompt(null);
        setDismissedPrompt(false);
        setIsInstalling(true);
        try {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, INSTALL_FEEDBACK_DELAY_MS);
          });
        } finally {
          setIsInstalling(false);
          markPwaOnDeviceFromInstallEvent();
          clearInstallFeedbackCooldown();
          notifyPwaOnDeviceChanged();
        }
      } else {
        setInstallPrompt(null);
        setDismissedPrompt(true);
      }
    } catch {
      setDismissedPrompt(true);
    }
  };

  const buttonClassName = fullWidth
    ? "w-full rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-55"
    : "rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100";

  const showPromptButton = Boolean(installPrompt) && !isInstalling;
  const showMenuHelp = !installPrompt && !isInstalling;

  const installingBlock = isInstalling ? (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-5 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="m-0 text-sm font-medium text-indigo-100">Instalando la app…</p>
      <p className="m-0 text-xs text-indigo-200/80">Solo un momento</p>
      <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-indigo-900/50">
        <div className="progress-bar-indeterminate h-full w-[38%] rounded-full bg-indigo-500" />
      </div>
    </div>
  ) : null;

  const content = (
    <div className={`flex w-full flex-col gap-3 ${fullWidth ? "" : "mt-2"}`}>
      {showPromptButton ? (
        <button
          type="button"
          onClick={() => void onInstall()}
          className={buttonClassName}
        >
          Instalar app
        </button>
      ) : null}
      {showMenuHelp ? (
        <>
          {dismissedPrompt ? (
            <p className="m-0 text-xs text-amber-200/90">
              Instalación cancelada. Recargá la página o usá el menú ⋮ de Chrome.
            </p>
          ) : null}
          <ChromeMenuInstallHelp />
        </>
      ) : null}
      {installingBlock}
    </div>
  );

  return content;
}
