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

export function InstallPwaButton({ fullWidth = false }: InstallPwaButtonProps = {}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
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
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
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
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      beginInstallFeedbackCooldown(INSTALL_FEEDBACK_DELAY_MS);
      setInstallPrompt(null);
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
    }
  };

  const buttonClassName = fullWidth
    ? "w-full rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-55"
    : "rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60";

  const buttonOnly = (
    <button
      type="button"
      onClick={() => void onInstall()}
      disabled={!installPrompt || isInstalling}
      className={buttonClassName}
    >
      Instalar app
    </button>
  );

  const installingBlock = isInstalling ? (
    <div
      className="flex flex-col items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-5 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="m-0 text-sm font-medium text-indigo-950">Instalando la app…</p>
      <p className="m-0 text-xs text-indigo-700">Solo un momento</p>
      <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-indigo-200">
        <div className="progress-bar-indeterminate h-full w-[38%] rounded-full bg-indigo-600" />
      </div>
    </div>
  ) : null;

  if (fullWidth) {
    return (
      <div className="flex w-full flex-col gap-2">
        {!isInstalling ? buttonOnly : null}
        {installingBlock}
      </div>
    );
  }

  return (
    <div className="mt-2 flex w-full flex-col gap-2">
      {!isInstalling ? buttonOnly : null}
      {installingBlock}
    </div>
  );
}
