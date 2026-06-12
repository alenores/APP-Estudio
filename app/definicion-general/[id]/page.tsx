"use client";

import {
  useDefinicionGeneralDetalle,
} from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { EspecificaListCard } from "@/components/mobile/desarrollos/especifica-list-card";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, SurfaceCard } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type SheetState = null | { mode: "especifica" } | { mode: "edit-general" };

export default function DefinicionGeneralDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { general, especificas, accionesCountByEspecifica, pendientes, loading, error, reload } =
    useDefinicionGeneralDetalle(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  if (loading) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="curso">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !general) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="curso">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        breadcrumb={`General · ${general.nombre}`}
        backHref="/desarrollos"
        shellTone="curso"
      >
        <SurfaceCard className="border-violet-200 bg-violet-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Definición general
          </p>
          <h1 className="mt-1 text-lg font-semibold">{general.nombre}</h1>
          {general.descripcion ? (
            <p className="mt-2 text-sm text-ink-muted">{general.descripcion}</p>
          ) : null}
          <button
            type="button"
            onClick={() => setSheet({ mode: "edit-general" })}
            className="mt-3 text-xs font-semibold text-violet-800"
          >
            Editar general
          </button>
        </SurfaceCard>

        <PendientesSection
          pendientes={pendientes}
          parent={{ definicion_general_id: general.id }}
          onChanged={() => void reload()}
        />

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Definiciones específicas
        </h2>
        {especificas.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin definiciones específicas.</p>
        ) : (
          <ul className="flex flex-col gap-3 pb-20">
            {especificas.map((e) => (
              <li key={e.id}>
                <EspecificaListCard
                  especifica={e}
                  accionesCount={accionesCountByEspecifica.get(e.id) ?? 0}
                />
              </li>
            ))}
          </ul>
        )}
      </AppShell>

      <button
        type="button"
        onClick={() => setSheet({ mode: "especifica" })}
        className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-indigo-700 px-5 text-sm font-semibold text-white shadow-lg active:scale-95"
      >
        <span className="text-lg leading-none">+</span>
        Específica
      </button>

      <StudySheet
        open={sheet?.mode === "especifica"}
        onClose={() => setSheet(null)}
        title="Nueva definición específica"
      >
        <DefinicionEspecificaForm
          generalId={general.id}
          onSuccess={async (newId) => {
            setSheet(null);
            await reload();
            router.push(`/definicion-especifica/${newId}`);
          }}
        />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "edit-general"}
        onClose={() => setSheet(null)}
        title="Editar definición general"
      >
        <DefinicionGeneralForm
          general={general}
          onSuccess={async () => {
            setSheet(null);
            await reload();
          }}
          onDelete={() => {
            setSheet(null);
            router.replace("/desarrollos");
          }}
        />
      </StudySheet>
    </>
  );
}
