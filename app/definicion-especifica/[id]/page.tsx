"use client";

import {
  useDefinicionEspecificaDetalle,
} from "@/app/hooks/useDefinicionesGeneralesList";
import { DesktopShell } from "@/components/desktop/desktop-shell";
import { DesarrollosEspecificaDetalleView } from "@/components/desktop/desarrollos-especifica-detalle-view";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AccionListCard } from "@/components/mobile/desarrollos/accion-list-card";
import { CaracteristicaListCard } from "@/components/mobile/desarrollos/caracteristica-list-card";
import {
  DesarrollosDetailHero,
  DesarrollosEmptyState,
  DesarrollosFab,
  DesarrollosMetaLine,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { CaracteristicaForm } from "@/components/shared/forms/caracteristica-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { isMobileShellClient } from "@/lib/shell-detect";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { CornerDownRight, Play, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";

type SheetState =
  | null
  | { mode: "accion" }
  | { mode: "caracteristica" }
  | { mode: "edit-especifica" };

type AppShellKind = "mobile" | "desktop";

function DefinicionEspecificaDetalleMobile() {
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
        <DesarrollosDetailHero
          level="especifica"
          levelLabel="Definición específica"
          icon={CornerDownRight}
          title={especifica.nombre}
          description={especifica.descripcion}
          editLabel="Editar específica"
          onEdit={() => setSheet({ mode: "edit-especifica" })}
          meta={
            <DesarrollosMetaLine>
              General:{" "}
              <TextLink href={`/definicion-general/${general.id}`}>
                {general.nombre}
              </TextLink>
            </DesarrollosMetaLine>
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

        <DesarrollosSectionHeader
          title="Acciones"
          helpSectionId="acciones"
        />
        {acciones.length === 0 ? (
          <DesarrollosEmptyState
            icon={Play}
            title="Sin acciones"
            hint="Definí pasos concretos con el botón + Acción."
          />
        ) : (
          <ul className="flex flex-col gap-2 pb-20">
            {acciones.map((a) => (
              <li key={a.id}>
                <AccionListCard accion={a} />
              </li>
            ))}
          </ul>
        )}
      </AppShell>

      <DesarrollosFab label="Acción" onClick={() => setSheet({ mode: "accion" })} />

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

export default function DefinicionEspecificaDetallePage() {
  const [shell, setShell] = useState<AppShellKind | null>(null);

  useEffect(() => {
    setShell(isMobileShellClient() ? "mobile" : "desktop");
  }, []);

  if (shell === null) {
    return <LoadingText />;
  }

  if (shell === "desktop") {
    return (
      <DesktopShell title="Explorador desarrollos">
        <DesarrollosEspecificaDetalleView />
      </DesktopShell>
    );
  }

  return <DefinicionEspecificaDetalleMobile />;
}
