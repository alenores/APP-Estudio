"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/temas";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError === "auth" ? "No se pudo completar el inicio de sesión." : null,
  );

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function handleMagicLink() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Revisá tu correo y abrí el enlace para entrar.");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">APP Estudio</h1>
        <p className="text-sm text-slate-400">Iniciá sesión con tu cuenta de Supabase.</p>
      </header>

      <form
        onSubmit={handlePasswordLogin}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-indigo-500/0 transition focus:ring-2 focus:ring-indigo-500/50"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Contraseña
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:ring-2 focus:ring-indigo-500/50"
          />
        </label>

        {message ? (
          <p className="text-sm text-amber-300" role="alert">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>

        <button
          type="button"
          disabled={loading || !email}
          onClick={() => void handleMagicLink()}
          className="w-full rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-60"
        >
          Enviar magic link
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        <Link href="/" className="text-indigo-400 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
