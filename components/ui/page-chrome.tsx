import type { ReactNode } from "react";

/** Tarjeta contenedora reutilizable (home, login). */
export function SurfaceCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-paper-elevated p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight text-ink">
      {children}
    </h1>
  );
}

export function PageLead({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink-muted">{children}</p>;
}

export function LoadingText({ children = "Cargando…" }: { children?: ReactNode }) {
  return <p className="text-sm text-ink-muted">{children}</p>;
}

export function AlertText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-danger-subtle px-4 py-3 text-sm text-danger" role="alert">
      {children}
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
      {children}
    </p>
  );
}
