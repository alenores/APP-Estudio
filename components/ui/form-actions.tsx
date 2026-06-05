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
