"use client";

import { useDefinicionesGeneralesList } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { GeneralListCard } from "@/components/mobile/desarrollos/general-list-card";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import {
  AlertText,
  EmptyState,
  LoadingText,
  TextLink,
} from "@/components/ui";
import { clearDesarrollosOfflineCache } from "@/lib/desarrollos-offline-cache";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DesarrollosPage() {
  const router = useRouter();
  const {
    generales,
    especificasCountByGeneral,
    accionesCountByGeneral,
    loading,
    error,
    reload,
  } = useDefinicionesGeneralesList();
  const [sheetOpen, setSheetOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    clearDesarrollosOfflineCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <AppShell
        title="Desarrollos"
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
        <DesarrollosSyncBanner />
        {loading ? <LoadingText>Cargando desarrollos…</LoadingText> : null}
        {error ? <AlertText>{error}</AlertText> : null}
        {!loading && !error && generales.length === 0 ? (
          <EmptyState>
            No hay definiciones generales. Usá el botón + para crear la primera.
          </EmptyState>
        ) : null}
        <ul className="mt-4 flex flex-col gap-3">
          {generales.map((g) => (
            <li key={g.id}>
              <GeneralListCard
                general={g}
                especificasCount={especificasCountByGeneral.get(g.id) ?? 0}
                accionesCount={accionesCountByGeneral.get(g.id) ?? 0}
              />
            </li>
          ))}
        </ul>
        <p className="mt-6 pb-20 text-center">
          <TextLink href="/">Cambiar tipología</TextLink>
        </p>
      </AppShell>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-violet-700 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-600 active:scale-95"
      >
        <span className="text-lg leading-none">+</span>
        General
      </button>

      <StudySheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Nueva definición general">
        <DefinicionGeneralForm
          onSuccess={async (id) => {
            setSheetOpen(false);
            await reload();
            router.push(`/definicion-general/${id}`);
          }}
        />
      </StudySheet>
    </>
  );
}
