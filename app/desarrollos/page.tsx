"use client";

import { useDefinicionesGeneralesList } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import {
  DesarrollosEmptyState,
  DesarrollosFab,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { GeneralListCard } from "@/components/mobile/desarrollos/general-list-card";
import { DesarrollosSyncBanner } from "@/components/shared/sync/desarrollos-sync-banner";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText } from "@/components/ui";
import { clearDesarrollosOfflineCache } from "@/lib/desarrollos-offline-cache";
import { createClient } from "@/lib/supabase/client";
import { ClipboardList, Layers, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 active:scale-95 dark:hover:bg-stone-800"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        }
      >
        {/* Sync banner */}
        <DesarrollosSyncBanner />

        {/* Quick action: todos los pendientes */}
        <Link
          href="/pendientes"
          className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm font-medium text-stone-700 transition-[border-color,background-color] hover:border-stone-300 hover:bg-stone-100/80 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-300"
        >
          <ClipboardList className="h-4 w-4 shrink-0 text-[#EA580C]" aria-hidden />
          <span className="flex-1">Ver todos los pendientes</span>
          <span className="text-xs text-stone-400">→</span>
        </Link>

        {loading ? <LoadingText>Cargando desarrollos…</LoadingText> : null}
        {error ? <AlertText>{error}</AlertText> : null}

        {!loading && !error ? (
          <>
            <DesarrollosSectionHeader
              title="Definiciones generales"
              count={generales.length > 0 ? generales.length : undefined}
              helpSectionId="definicion-general"
            />
            {generales.length === 0 ? (
              <DesarrollosEmptyState
                icon={Layers}
                title="Sin definiciones generales"
                hint="Usá el botón + General para crear la primera."
              />
            ) : (
              <ul className="flex flex-col gap-3 pb-20">
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
            )}
          </>
        ) : null}

        <p className="pb-6 text-center">
          <Link
            href="/"
            className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline dark:text-stone-500"
          >
            Cambiar tipología
          </Link>
        </p>
      </AppShell>

      <DesarrollosFab label="General" onClick={() => setSheetOpen(true)} />

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
