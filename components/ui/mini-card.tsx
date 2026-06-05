import type { ReactNode } from "react";

/** Tipografía compartida de mini-cards (tiempo, estado) en detalle. */
export const TD_MINI_CARD_TITLE =
  "truncate text-center text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--td-faint)]";

type MiniCardProps = {
  title: string;
  delayClass?: string;
  surfaceClass?: string;
  className?: string;
  children: ReactNode;
};

export function MiniCard({
  title,
  delayClass = "",
  surfaceClass = "",
  className = "",
  children,
}: MiniCardProps) {
  return (
    <section
      className={`td-card td-rise ${delayClass} flex min-h-0 min-w-0 flex-col px-2 py-2 ${surfaceClass} ${className}`}
    >
      <p className={TD_MINI_CARD_TITLE}>{title}</p>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
    </section>
  );
}
