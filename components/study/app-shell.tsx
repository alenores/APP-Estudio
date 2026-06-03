import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  backHref?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AppShell({ title, backHref, children, actions }: AppShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Volver"
            >
              ←
            </Link>
          ) : null}
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-white">
            {title}
          </h1>
          {actions}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-6">{children}</div>
    </div>
  );
}
