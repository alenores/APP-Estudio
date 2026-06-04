"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useSwipeBack } from "@/lib/use-swipe-back";

type AppShellProps = {
  title: string;
  backHref?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AppShell({ title, backHref, children, actions }: AppShellProps) {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (backHref) router.push(backHref);
  }, [backHref, router]);
  const swipeRef = useSwipeBack(backHref ? goBack : undefined);

  return (
    <div
      ref={swipeRef}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-paper will-change-transform"
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
