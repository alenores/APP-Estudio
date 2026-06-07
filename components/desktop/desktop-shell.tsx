"use client";

import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { DesktopUserMenu } from "@/components/desktop/desktop-user-menu";
import {
  DesktopShellToolbarSlotProvider,
} from "@/components/desktop/desktop-shell-toolbar";
import {
  DESKTOP_MAPA_PREFIX,
  DESKTOP_SHELL_PREFIX,
} from "@/lib/shell-routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";

type DesktopShellProps = {
  title: string;
  children: ReactNode;
  /** Clases del `<main>`. Mapa usa `desktop-main-inset`. */
  mainClassName?: string;
};

const MAIN_DEFAULT =
  "desktop-main-default mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col px-6 pt-1 pb-0";

/** Layout exclusivo escritorio (ADR 008). Sin PWA ni gestos móviles. */
export function DesktopShell({
  title,
  children,
  mainClassName = MAIN_DEFAULT,
}: DesktopShellProps) {
  const pathname = usePathname();
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);
  const toolbarRef = useCallback((node: HTMLDivElement | null) => {
    setToolbarSlot(node);
  }, []);

  const NAV = [
    { href: DESKTOP_SHELL_PREFIX, label: "Explorador" },
    { href: DESKTOP_MAPA_PREFIX, label: "Mapa" },
  ] as const;

  return (
    <div className="desktop-shell flex min-h-dvh flex-col text-[var(--td-ink)]">
      <header className="shrink-0 border-b border-[var(--td-line)] bg-white/90 px-4 py-2 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3">
          <div className="desktop-shell-header-start flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="min-w-0 shrink">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--td-faint)]">
                APP Estudio · Escritorio
              </p>
              <h1 className="truncate text-base font-bold text-[var(--td-ink)] sm:text-lg">
                {title}
              </h1>
            </div>
            <nav
              className="flex shrink-0 items-center gap-1"
              aria-label="Secciones escritorio"
            >
              {NAV.map(({ href, label }) => {
                const active =
                  href === DESKTOP_SHELL_PREFIX
                    ? pathname === href || pathname.startsWith(`${href}/`)
                    : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-lg px-2.5 py-1 text-sm font-semibold transition-colors sm:px-3 sm:py-1.5 ${
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
          <div className="desktop-shell-header-end ml-auto flex min-w-0 items-center justify-end gap-2">
            <div
              ref={toolbarRef}
              id="desktop-shell-toolbar"
              className="desktop-shell-toolbar-slot flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto empty:hidden"
            />
            <DesktopUserMenu />
          </div>
        </div>
      </header>
      <DesktopShellToolbarSlotProvider slot={toolbarSlot}>
        <main className={mainClassName}>{children}</main>
      </DesktopShellToolbarSlotProvider>
      <DeployShaFooter />
    </div>
  );
}
