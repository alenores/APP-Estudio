import Link from "next/link";
import type { ReactNode } from "react";

export function AddEntityLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent-subtle py-3 text-sm font-semibold text-accent transition hover:border-accent/60 hover:bg-accent-subtle/80"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </Link>
  );
}

/** Botón primario relleno (home, login secundario invertido, etc.). */
export function PrimaryButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover ${className}`}
    >
      {children}
    </Link>
  );
}

/** Botón secundario con borde (CTA menos prioritario). */
export function SecondaryButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex rounded-xl border border-border-strong px-4 py-2 text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-accent-subtle ${className}`}
    >
      {children}
    </Link>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-accent hover:underline">
      {children}
    </Link>
  );
}
