"use client";

import { useTemasList } from "@/app/hooks/useTemasList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { EstudioSyncBanner } from "@/components/shared/sync/estudio-sync-banner";
import { TemaListCard } from "@/components/mobile/cards/tema-list-card";
import { FabLink } from "@/components/mobile/fab/fab-link";
import {
  AlertText,
  EmptyState,
  LoadingText,
  TextLink,
} from "@/components/ui";
import { clearEstudioOfflineCache } from "@/lib/estudio-offline-cache";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function TemasPage() {
  const router = useRouter();
  const { temas, cursosStatsPorTema, loading, error } = useTemasList();

  async function signOut() {
    const supabase = createClient();
    clearEstudioOfflineCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell
      title="Temas"
      titleHelpSectionId="temas"
      backHref="/"
      shellTone="tema"
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
      <div className="estudio-progress-cards">
      <EstudioSyncBanner />
      {loading ? <LoadingText>Cargando temas…</LoadingText> : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && !error && temas.length === 0 ? (
        <EmptyState>No hay temas. Usá el botón + para crear el primero.</EmptyState>
      ) : null}
      <ul className="space-y-3">
        {temas.map((t) => (
          <li key={t.id}>
            <TemaListCard
              tema={t}
              cursosStats={
                cursosStatsPorTema.get(t.id) ?? { terminadas: 0, total: 0 }
              }
            />
          </li>
        ))}
      </ul>
      </div>
      <p className="pb-20 text-center text-xs text-ink-muted">
        <TextLink href="/">Inicio</TextLink>
      </p>
      <FabLink href="/temas/nuevo" label="Tema" />
    </AppShell>
  );
}
