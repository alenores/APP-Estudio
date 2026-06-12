"use client";

import {
  useDefinicionEspecificaDetalle,
} from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AccionListCard } from "@/components/mobile/desarrollos/accion-list-card";
import { CaracteristicaListCard } from "@/components/mobile/desarrollos/caracteristica-list-card";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { CaracteristicaForm } from "@/components/shared/forms/caracteristica-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, SurfaceCard, TextLink } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type SheetState =
  | null
  | { mode: "accion" }
  | { mode: "caracteristica" }
  | { mode: "edit-especifica" };

export default function DefinicionEspecificaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const {
    especifica,
    general,
    acciones,
    caracteristicas,
    pendientes,
    loading,
    error,
    reload,
  } = useDefinicionEspecificaDetalle(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  if (loading) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="curso">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !especifica || !general) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="curso">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        breadcrumb={`Específica · ${especifica.nombre}`}
        backHref={`/definicion-general/${general.id}`}
        shellTone="clase"
      >
        <SurfaceCard className="border-indigo-200 bg-indigo-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Definición específica
          </p>
          <h1 className="mt-1 text-lg font-semibold">{especifica.nombre}</h1>
          {especifica.descripcion ? (
            <p className="mt-2 text-sm text-ink-muted">{especifica.descripcion}</p>
          ) : null}
          <p className="mt-2 text-xs text-ink-muted">
            General:{" "}
            <TextLink href={`/definicion-general/${general.id}`}>
              {general.nombre}
            </TextLink>
          </p>
          <button
            type="button"
            onClick={() => setSheet({ mode: "edit-especifica" })}
            className="mt-3 text-xs font-semibold text-indigo-800"
          >
            Editar específica
          </button>
        </SurfaceCard>

        <div className="mb-3 mt-6 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Características
          </h2>
          <button
            type="button"
            onClick={() => setSheet({ mode: "caracteristica" })}
            className="text-xs font-semibold text-indigo-800"
          >
            + Nueva
          </button>
        </div>
        {caracteristicas.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin características.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {caracteristicas.map((c) => (
              <li key={c.id}>
                <CaracteristicaListCard
                  caracteristica={c}
                  onDeleted={() => void reload()}
                />
              </li>
            ))}
          </ul>
        )}

        <PendientesSection
          pendientes={pendientes}
          parent={{ definicion_especifica_id: especifica.id }}
          onChanged={() => void reload()}
        />

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Acciones
        </h2>
        {acciones.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin acciones.</p>
        ) : (
          <ul className="flex flex-col gap-3 pb-20">
            {acciones.map((a) => (
              <li key={a.id}>
                <AccionListCard accion={a} />
              </li>
            ))}
          </ul>
        )}
      </AppShell>

      <button
        type="button"
        onClick={() => setSheet({ mode: "accion" })}
        className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-fuchsia-700 px-5 text-sm font-semibold text-white shadow-lg active:scale-95"
      >
        <span className="text-lg leading-none">+</span>
        Acción
      </button>

      <StudySheet open={sheet?.mode === "accion"} onClose={() => setSheet(null)} title="Nueva acción">
        <AccionForm
          especificaId={especifica.id}
          onSuccess={async (newId) => {
            setSheet(null);
            await reload();
            router.push(`/acciones/${newId}`);
          }}
        />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "caracteristica"}
        onClose={() => setSheet(null)}
        title="Nueva característica"
      >
        <CaracteristicaForm
          parent={{ definicion_especifica_id: especifica.id }}
          onSuccess={() => {
            setSheet(null);
            void reload();
          }}
        />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "edit-especifica"}
        onClose={() => setSheet(null)}
        title="Editar definición específica"
      >
        <DefinicionEspecificaForm
          generalId={general.id}
          especifica={especifica}
          onSuccess={async () => {
            setSheet(null);
            await reload();
          }}
          onDelete={() => {
            setSheet(null);
            router.replace(`/definicion-general/${general.id}`);
          }}
        />
      </StudySheet>
    </>
  );
}
