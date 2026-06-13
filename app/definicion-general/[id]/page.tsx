"use client";

import {
  useDefinicionGeneralDetalle,
} from "@/app/hooks/useDefinicionesGeneralesList";
import { DesktopShell } from "@/components/desktop/desktop-shell";
import { DesarrollosGeneralDetalleView } from "@/components/desktop/desarrollos-general-detalle-view";
import { AppShell } from "@/components/mobile/shell/app-shell";
import {
  DesarrollosDetailHero,
  DesarrollosEmptyState,
  DesarrollosFab,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { EspecificaListCard } from "@/components/mobile/desarrollos/especifica-list-card";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText } from "@/components/ui";
import { isMobileShellClient } from "@/lib/shell-detect";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { GitBranch, Layers } from "lucide-react";
import { useEffect, useState } from "react";

type SheetState = null | { mode: "especifica" } | { mode: "edit-general" };

type AppShellKind = "mobile" | "desktop";

function DefinicionGeneralDetalleMobile() {
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
        <DesarrollosDetailHero
          level="general"
          levelLabel="Definición general"
          icon={Layers}
          title={general.nombre}
          description={general.descripcion}
          editLabel="Editar general"
          onEdit={() => setSheet({ mode: "edit-general" })}
        />

        <PendientesSection
          pendientes={pendientes}
          parent={{ definicion_general_id: general.id }}
          onChanged={() => void reload()}
        />

        <DesarrollosSectionHeader title="Definiciones específicas" />
        {especificas.length === 0 ? (
          <DesarrollosEmptyState
            icon={GitBranch}
            title="Sin definiciones específicas"
            hint="Creá la primera con el botón + Específica."
          />
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

      <DesarrollosFab label="Específica" onClick={() => setSheet({ mode: "especifica" })} />

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

export default function DefinicionGeneralDetallePage() {
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
        <DesarrollosGeneralDetalleView />
      </DesktopShell>
    );
  }

  return <DefinicionGeneralDetalleMobile />;
}
