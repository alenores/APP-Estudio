"use client";

import { useTemasList } from "@/app/hooks/useTemasList";
import { AppShell } from "@/components/study/app-shell";
import { EntityCard } from "@/components/study/entity-card";
import { FabLink } from "@/components/study/fab-link";
import {
  AlertText,
  EmptyState,
  LoadingText,
  TextLink,
} from "@/components/study/form-field";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TemasPage() {
  const router = useRouter();
  const { temas, loading, error } = useTemasList();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell
      title="Temas"
      backHref="/"
      actions={
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-xs text-ink-muted hover:text-accent"
        >
          Salir
        </button>
      }
    >
      {loading ? <LoadingText>Cargando temas…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && !error && temas.length === 0 ? (
        <EmptyState>No hay temas. Usá el botón + para crear el primero.</EmptyState>
      ) : null}
      <ul className="space-y-3">
        {temas.map((t) => (
          <li key={t.id}>
            <EntityCard
              href={`/temas/${t.id}`}
              nombre={t.nombre}
              subtitulo={t.descripcion}
              derivados={t.derivados}
              forwardTransition
            />
          </li>
        ))}
      </ul>
      <p className="pb-20 text-center text-xs text-ink-muted">
        <TextLink href="/">Inicio</TextLink>
      </p>
      <FabLink href="/temas/nuevo" label="Tema" />
    </AppShell>
  );
}
