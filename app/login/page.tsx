"use client";

import { createClient } from "@/lib/supabase/client";
import {
  FormField,
  FormInput,
  FormSubmitButton,
  PageLead,
  PageTitle,
  SecondaryButton,
  SurfaceCard,
  TextLink,
} from "@/components/study/form-field";
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
        <PageTitle>APP Estudio</PageTitle>
        <PageLead>Iniciá sesión para acceder a tus temas.</PageLead>
      </header>

      <SurfaceCard>
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <FormField label="Email">
            <FormInput
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Contraseña">
            <FormInput
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          {message ? (
            <p className="text-sm text-estado-pausado" role="alert">
              {message}
            </p>
          ) : null}

          <FormSubmitButton loading={loading} label="Entrar" loadingLabel="Entrando…" />

          <SecondaryButton
            disabled={loading || !email}
            onClick={() => void handleMagicLink()}
          >
            Enviar magic link
          </SecondaryButton>
        </form>
      </SurfaceCard>

      <p className="text-center text-xs text-ink-muted">
        <TextLink href="/">Volver al inicio</TextLink>
      </p>
    </main>
  );
}
