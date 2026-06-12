"use client";

import { useAccionDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { CaracteristicaListCard } from "@/components/mobile/desarrollos/caracteristica-list-card";
import {
  DesarrollosDetailHero,
  DesarrollosEmptyState,
  DesarrollosMetaLine,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { CaracteristicaForm } from "@/components/shared/forms/caracteristica-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { Play, StickyNote } from "lucide-react";
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
        <DesarrollosDetailHero
          level="accion"
          levelLabel="Acción"
          icon={Play}
          title={accion.nombre}
          description={accion.descripcion}
          editLabel="Editar acción"
          onEdit={() => setSheet({ mode: "edit" })}
          meta={
            <>
              <DesarrollosMetaLine>
                Específica:{" "}
                <TextLink href={`/definicion-especifica/${especifica.id}`}>
                  {especifica.nombre}
                </TextLink>
              </DesarrollosMetaLine>
              <DesarrollosMetaLine>
                General:{" "}
                <TextLink href={`/definicion-general/${general.id}`}>
                  {general.nombre}
                </TextLink>
              </DesarrollosMetaLine>
            </>
          }
        />

        <DesarrollosSectionHeader
          title="Características"
          actionLabel="+ Nueva"
          onAction={() => setSheet({ mode: "caracteristica" })}
        />
        {caracteristicas.length === 0 ? (
          <DesarrollosEmptyState
            icon={StickyNote}
            title="Sin características"
            hint="Agregá notas, implicancias técnicas o prompts con + Nueva."
          />
        ) : (
          <ul className="flex flex-col gap-3 pb-8">
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
