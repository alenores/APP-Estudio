"use client";

import { useAccionDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { CaracteristicaListCard } from "@/components/mobile/desarrollos/caracteristica-list-card";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { CaracteristicaForm } from "@/components/shared/forms/caracteristica-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, SurfaceCard, TextLink } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type SheetState = null | { mode: "edit" } | { mode: "caracteristica" };

export default function AccionDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { accion, especifica, general, caracteristicas, pendientes, loading, error, reload } =
    useAccionDetalle(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  if (loading) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="clase">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !accion || !especifica || !general) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="clase">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        breadcrumb={`Acción · ${accion.nombre}`}
        backHref={`/definicion-especifica/${especifica.id}`}
        shellTone="clase"
      >
        <SurfaceCard className="border-fuchsia-200 bg-fuchsia-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">
            Acción
          </p>
          <h1 className="mt-1 text-lg font-semibold">{accion.nombre}</h1>
          {accion.descripcion ? (
            <p className="mt-2 text-sm text-ink-muted">{accion.descripcion}</p>
          ) : null}
          <p className="mt-3 text-xs text-ink-muted">
            Específica:{" "}
            <TextLink href={`/definicion-especifica/${especifica.id}`}>
              {especifica.nombre}
            </TextLink>
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            General:{" "}
            <TextLink href={`/definicion-general/${general.id}`}>
              {general.nombre}
            </TextLink>
          </p>
          <button
            type="button"
            onClick={() => setSheet({ mode: "edit" })}
            className="mt-3 text-xs font-semibold text-fuchsia-800"
          >
            Editar acción
          </button>
        </SurfaceCard>

        <div className="mb-3 mt-6 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Características
          </h2>
          <button
            type="button"
            onClick={() => setSheet({ mode: "caracteristica" })}
            className="text-xs font-semibold text-fuchsia-800"
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
          parent={{ accion_id: accion.id }}
          onChanged={() => void reload()}
        />
      </AppShell>

      <StudySheet open={sheet?.mode === "edit"} onClose={() => setSheet(null)} title="Editar acción">
        <AccionForm
          especificaId={especifica.id}
          accion={accion}
          onSuccess={async () => {
            setSheet(null);
            await reload();
          }}
          onDelete={() => {
            setSheet(null);
            router.replace(`/definicion-especifica/${especifica.id}`);
          }}
        />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "caracteristica"}
        onClose={() => setSheet(null)}
        title="Nueva característica"
      >
        <CaracteristicaForm
          parent={{ accion_id: accion.id }}
          onSuccess={() => {
            setSheet(null);
            void reload();
          }}
        />
      </StudySheet>
    </>
  );
}
