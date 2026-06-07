"use client";

import { useEffect } from "react";

const PWA_CACHE_BUST = "app-estudio-v2";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const isSecureContext =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    if (!isSecureContext) return;

    const bustKey = "pwa-cache-bust-v1";

    void (async () => {
      try {
        const previousBust = window.localStorage.getItem(bustKey);
        if (previousBust !== PWA_CACHE_BUST) {
          window.localStorage.setItem(bustKey, PWA_CACHE_BUST);
        }
      } catch {
        /* ignore */
      }

      try {
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        const registration = await navigator.serviceWorker.register("/sw.js");
        await registration.update();

        if (registration.waiting && navigator.serviceWorker.controller) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      } catch {
        // Registro best-effort.
      }
    })();
  }, []);

  return null;
}
