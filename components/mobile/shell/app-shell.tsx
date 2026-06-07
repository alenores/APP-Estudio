"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { NavPanelProvider, useNavPanel } from "@/lib/nav-panel-context";
import { buildNavPanelStyle } from "@/lib/nav-transition";
import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { NAV_STAGE_MAIN_CLASS } from "@/lib/nav-stage";
import {
  estudioEntityShellBgVar,
  isEstudioEntityTone,
  mobileShellToneClass,
  shellToneFromPath,
  type EstudioShellTone,
} from "@/lib/estudio-shell-tone";
import { useNavDetailGestures } from "@/lib/use-nav-detail-gestures";

type AppShellProps = {
  /** Título en cabecera; omitir si solo usás `breadcrumb`. */
  title?: string;
  /** Crumb superior (ej. detalle tema); reemplaza el `<h1>`. */
  breadcrumb?: string;
  backHref?: string;
  children: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
  /** Tono del panel deslizante según entidad (tema / curso / clase). */
  shellTone?: EstudioShellTone;
};

function mobileShellSurfaceStyle(tone: EstudioShellTone): CSSProperties {
  if (tone === "seguimiento") {
    return {
      "--mobile-shell-bg": "var(--estudio-shell-seguimiento)",
      backgroundColor: "var(--estudio-shell-seguimiento)",
    } as CSSProperties;
  }
  if (isEstudioEntityTone(tone)) {
    const bg = estudioEntityShellBgVar(tone);
    return {
      "--mobile-shell-bg": bg,
      backgroundColor: bg,
    } as CSSProperties;
  }
  return {
    "--mobile-shell-bg": "var(--estudio-shell-neutral)",
    backgroundColor: "var(--estudio-shell-neutral)",
  } as CSSProperties;
}

/**
 * Escenario fijo (fondo) + hoja `data-nav-panel` que se desliza — efecto “libro” al navegar.
 */
function AppShellInner({
  title = "",
  breadcrumb,
  backHref,
  children,
  actions,
  contentClassName,
  shellTone = "neutral",
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useNavPanel();

  const resolvedTone = useMemo(() => {
    const pathTone = shellToneFromPath(pathname);
    return pathTone !== "neutral" ? pathTone : shellTone;
  }, [pathname, shellTone]);

  const goBack = useCallback(() => {
    if (backHref) router.replace(backHref);
  }, [backHref, router]);

  const detail = useNavDetailGestures({
    backHref,
    onBack: goBack,
    panel,
  });

  const motionStyle = buildNavPanelStyle({
    swipeOffset: panel.swipeOffset,
    isSwiping: panel.isSwiping,
    isLeaving: panel.isLeaving,
    isEntering: detail.isEntering,
    enterOffset: detail.enterOffset,
    enterScale: detail.enterScale,
    enterOpacity: detail.enterOpacity,
  });

  const panelStyle = {
    ...mobileShellSurfaceStyle(resolvedTone),
    ...motionStyle,
  };

  return (
    <main
      className={`${NAV_STAGE_MAIN_CLASS} px-2 pt-4`}
      style={{ touchAction: backHref ? "pan-y" : undefined }}
      onPointerDown={backHref ? detail.onPointerDown : undefined}
      onPointerMove={backHref ? detail.onPointerMove : undefined}
      onPointerUp={backHref ? detail.onPointerUp : undefined}
      onPointerCancel={backHref ? detail.onPointerCancel : undefined}
    >
      <div
        data-nav-panel
        data-shell-tone={resolvedTone}
        className={`mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col rounded-2xl shadow-xl ring-1 ring-black/10 will-change-transform ${mobileShellToneClass(resolvedTone)}`}
        style={panelStyle}
      >
        <header className="mobile-shell-header sticky top-0 z-10 rounded-t-2xl border-b px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-accent-subtle hover:text-accent"
                aria-label="Volver"
              >
                ←
              </Link>
            ) : null}
            {breadcrumb ? (
              <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                {breadcrumb}
              </p>
            ) : (
              <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-ink">
                {title}
              </h1>
            )}
            {actions}
          </div>
        </header>
        <div
          className={
            contentClassName ??
            "flex flex-1 flex-col gap-6 px-4 py-6"
          }
        >
          {children}
        </div>
      </div>
      <DeployShaFooter />
    </main>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <NavPanelProvider>
      <AppShellInner {...props} />
    </NavPanelProvider>
  );
}
