import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:ring-2 focus:ring-indigo-500/50";

type FormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-rose-400" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function FormTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={inputClass} {...props} />;
}

export function FormSubmitButton({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
    >
      {loading ? "Guardando…" : label}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-sm text-rose-300" role="alert">
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
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 py-3 text-sm font-semibold text-indigo-300 transition hover:border-indigo-400/60 hover:bg-indigo-500/10"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </Link>
  );
}
