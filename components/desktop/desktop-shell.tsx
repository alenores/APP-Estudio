"use client";

import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { clearEstudioOfflineCache } from "@/lib/estudio-offline-cache";
import { createClient } from "@/lib/supabase/client";
import {
  DESKTOP_MAPA_PREFIX,
  DESKTOP_SHELL_PREFIX,
} from "@/lib/shell-routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type DesktopShellProps = {
  title: string;
  children: ReactNode;
};

const NAV = [
  { href: DESKTOP_SHELL_PREFIX, label: "Explorador" },
  { href: DESKTOP_MAPA_PREFIX, label: "Mapa" },
] as const;

/** Layout exclusivo escritorio (ADR 008). Sin PWA ni gestos móviles. */
export function DesktopShell({ title, children }: DesktopShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    clearEstudioOfflineCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="desktop-shell flex min-h-dvh flex-col text-[var(--td-ink)]">
      <header className="shrink-0 border-b border-[var(--td-line)] bg-white/90 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--td-faint)]">
                APP Estudio · Escritorio
              </p>
              <h1 className="text-lg font-bold text-[var(--td-ink)]">{title}</h1>
            </div>
            <nav className="flex items-center gap-1" aria-label="Secciones escritorio">
              {NAV.map(({ href, label }) => {
                const active =
                  href === DESKTOP_SHELL_PREFIX
                    ? pathname === href || pathname.startsWith(`${href}/`)
                    : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[var(--td-navy)] text-white"
                        : "text-[var(--td-ink-soft)] hover:bg-[var(--td-line-soft)]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-[var(--td-line)] px-3 py-1.5 text-sm font-medium text-[var(--td-ink-soft)] transition-colors hover:bg-[var(--td-line-soft)]"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col px-6 pt-1 pb-0">
        {children}
      </main>
      <DeployShaFooter />
    </div>
  );
}
