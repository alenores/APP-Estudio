"use client";

import { useEffect, useState } from "react";
import { isStandaloneMode } from "@/lib/pwa-platform";

const SESSION_KEY = "app-launch-splash-v1";

/**
 * Splash de apertura desde ícono (standalone): animación fuerte, no sutil.
 * Una vez por sesión de la PWA.
 */
export function AppLaunchSplash() {
  const [phase, setPhase] = useState<"pending" | "run" | "done">("pending");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      if (!cancelled) setPhase("done");
    };

    try {
      if (!isStandaloneMode()) {
        finish();
        return;
      }
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
        finish();
        return;
      }
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sin storage: igual mostramos una vez en este montaje
    }

    if (reduce) {
      setPhase("run");
      const t = window.setTimeout(finish, 480);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    setPhase("run");
    const t = window.setTimeout(finish, 2800);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  if (phase === "pending" || phase === "done") return null;

  return (
    <div className="app-launch-splash" aria-hidden>
      <div className="app-launch-splash-bg" />
      <div className="app-launch-splash-grid" />
      <div className="app-launch-splash-orb app-launch-splash-orb-a" />
      <div className="app-launch-splash-orb app-launch-splash-orb-b" />
      <div className="app-launch-splash-ring app-launch-splash-ring-1" />
      <div className="app-launch-splash-ring app-launch-splash-ring-2" />
      <div className="app-launch-splash-ring app-launch-splash-ring-3" />
      <div className="app-launch-splash-burst" />

      <div className="app-launch-splash-core">
        <div className="app-launch-splash-book" />
        <p className="app-launch-splash-title">APP Estudio</p>
        <p className="app-launch-splash-sub">Académico Lite</p>
      </div>

      <div className="app-launch-splash-flash" />
      <div className="app-launch-splash-wipe" />
    </div>
  );
}
