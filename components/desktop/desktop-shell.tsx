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
import { useCallback, useState, type CSSProperties, type ReactNode } from "react";

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
    { href: DESKTOP_SHELL_PREFIX, label: "Explorador", icon: ExplorerIcon },
    { href: DESKTOP_MAPA_PREFIX, label: "Mapa", icon: MapIcon },
  ] as const;

  return (
    <div className="desktop-shell flex min-h-dvh flex-col text-[var(--td-ink)]">
      {/* Header glassmorphism dark */}
      <header
        style={{
          background: "var(--ds-header-bg)",
          borderBottom: "1px solid var(--ds-header-border)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        } as CSSProperties}
        className="shrink-0 px-4 py-2.5 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3">
          {/* Logo + marca */}
          <div className="desktop-shell-header-start flex min-w-0 items-center gap-5 sm:gap-7">
            <div className="flex min-w-0 shrink items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%)",
                  boxShadow: "0 4px 14px -2px rgba(59,130,246,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
                } as CSSProperties}
              >
                <AppLogoIcon />
              </div>
              <div className="min-w-0 shrink">
                <p
                  className="text-[9.5px] font-extrabold uppercase tracking-[0.2em]"
                  style={{ color: "var(--ds-text-muted)" }}
                >
                  APP Estudio
                </p>
                <h1
                  className="truncate text-[15px] font-bold leading-tight sm:text-base"
                  style={{ color: "var(--ds-text)" }}
                >
                  {title}
                </h1>
              </div>
            </div>

            {/* Nav links */}
            <nav
              className="flex shrink-0 items-center gap-1"
              aria-label="Secciones escritorio"
            >
              {NAV.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                      active ? "text-white" : "hover:text-white"
                    }`}
                    style={
                      active
                        ? ({
                            background: "rgba(59,130,246,0.18)",
                            color: "#93c5fd",
                            boxShadow: "0 0 0 1px rgba(59,130,246,0.35), 0 4px 12px -2px rgba(59,130,246,0.2)",
                          } as CSSProperties)
                        : ({ color: "var(--ds-text-muted)" } as CSSProperties)
                    }
                  >
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      style={active ? { color: "#60a5fa" } : { color: "var(--ds-text-muted)" }}
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Derecha: toolbar + usuario */}
          <div className="desktop-shell-header-end ml-auto flex min-w-0 items-center justify-end gap-2">
            <div
              ref={toolbarRef}
              id="desktop-shell-toolbar"
              className="desktop-shell-toolbar-slot flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto empty:hidden"
            />
            <div
              className="h-5 w-px shrink-0 mx-1"
              style={{ background: "var(--ds-border)" }}
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

function AppLogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.6" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.35" />
    </svg>
  );
}

function ExplorerIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="5" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="1.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="9.5" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MapIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2" fill="currentColor" fillOpacity="0.5" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
