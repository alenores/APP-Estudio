"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { NavPanelProvider, useNavPanel } from "@/lib/nav-panel-context";
import { buildNavPanelStyle } from "@/lib/nav-transition";
import { DeployShaFooter } from "@/components/deploy-sha-footer";
import { NAV_STAGE_MAIN_CLASS } from "@/lib/nav-stage";
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
};

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
}: AppShellProps) {
  const router = useRouter();
  const panel = useNavPanel();

  const goBack = useCallback(() => {
    if (backHref) router.replace(backHref);
  }, [backHref, router]);

  const detail = useNavDetailGestures({
    backHref,
    onBack: goBack,
    panel,
  });

  const panelStyle = buildNavPanelStyle({
    swipeOffset: panel.swipeOffset,
    isSwiping: panel.isSwiping,
    isLeaving: panel.isLeaving,
    isEntering: detail.isEntering,
    enterOffset: detail.enterOffset,
    enterScale: detail.enterScale,
    enterOpacity: detail.enterOpacity,
  });

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
        className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col rounded-2xl bg-paper shadow-xl ring-1 ring-border/70 will-change-transform"
        style={panelStyle}
      >
        <header className="sticky top-0 z-10 rounded-t-2xl border-b border-border bg-paper/95 px-4 py-3 backdrop-blur-md">
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
