import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-xl border border-border bg-paper-elevated px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

type FormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function FormSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function FormTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function FormSubmitButton({
  loading,
  label,
  loadingLabel = "Guardando…",
}: {
  loading: boolean;
  label: string;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl bg-danger-subtle px-3 py-2 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

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

/** Botón secundario dentro de formularios (ej. magic link en login). */
export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`w-full rounded-xl border-2 border-accent/30 bg-accent-subtle py-2.5 text-sm font-semibold text-accent transition hover:border-accent/50 hover:bg-accent-subtle/80 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

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
    <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
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

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-accent hover:underline">
      {children}
    </Link>
  );
}
