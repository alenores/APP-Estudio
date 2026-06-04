"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { NavPanelProvider, useNavPanel } from "@/lib/nav-panel-context";
import { buildNavPanelStyle } from "@/lib/nav-transition";
import { useNavDetailGestures } from "@/lib/use-nav-detail-gestures";

type AppShellProps = {
  title: string;
  backHref?: string;
  children: ReactNode;
  actions?: ReactNode;
};

function AppShellInner({ title, backHref, children, actions }: AppShellProps) {
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

  const pointerHandlers = backHref
    ? {
        onPointerDown: detail.onPointerDown,
        onPointerMove: detail.onPointerMove,
        onPointerUp: detail.onPointerUp,
        onPointerCancel: detail.onPointerCancel,
      }
    : {};

  return (
    <div
      data-nav-panel
      className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-paper will-change-transform"
      style={{ touchAction: "pan-y", ...panelStyle }}
      {...pointerHandlers}
    >
      <header className="sticky top-0 z-10 border-b border-border bg-paper/95 px-4 py-3 backdrop-blur-md">
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
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-ink">
            {title}
          </h1>
          {actions}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6">{children}</div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <NavPanelProvider>
      <AppShellInner {...props} />
    </NavPanelProvider>
  );
}
