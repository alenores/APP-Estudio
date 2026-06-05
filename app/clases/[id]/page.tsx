"use client";

import { useClaseDetalleMetrics } from "@/app/hooks/useClaseDetalleMetrics";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AlertText, LoadingText } from "@/components/ui";
import { FabExpandMenu } from "@/components/mobile/fab/fab-expand-menu";
import { ConceptoForm } from "@/components/shared/forms/concepto-form";
import { SeguimientoForm } from "@/components/shared/forms/seguimiento-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { ClaseDetalleView } from "@/components/mobile/detalle/clase-detalle-view";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type ClaseSheet = null | "seguimiento" | "concepto";

export default function ClaseDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { clase, seguimientos, conceptos, loading, error, reload, metrics } =
    useClaseDetalleMetrics(id);
  const [sheet, setSheet] = useState<ClaseSheet>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
  }

  if (loading) {
    return (
      <AppShell title="Clase" backHref="/temas" shellTone="clase">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !clase || !metrics) {
    return (
      <AppShell title="Clase" backHref="/temas" shellTone="clase">
        <AlertText>{error ?? "No encontrada"}</AlertText>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        breadcrumb={`Clase · ${clase.nombre}`}
        backHref={`/cursos/${clase.curso_id}`}
        shellTone="clase"
        contentClassName="estudio-detalle-shell tema-detalle-shell flex min-h-0 flex-1 flex-col gap-0 px-2 pt-4 pb-0"
      >
        <ClaseDetalleView
          clase={clase}
          seguimientos={seguimientos}
          conceptos={conceptos}
          metrics={metrics}
        />
      </AppShell>

      <FabExpandMenu
        mainLabel="Acciones de la clase"
        onSelect={(actionId) => setSheet(actionId as ClaseSheet)}
        actions={[
          { id: "seguimiento", label: "Seguimiento", variant: "solid" },
          { id: "concepto", label: "Concepto", variant: "solid" },
        ]}
      />

      <StudySheet
        open={sheet === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
        subtitle={clase.nombre}
      >
        <SeguimientoForm
          parent={{ claseId: clase.id }}
          onSuccess={onChildCreated}
        />
      </StudySheet>

      <StudySheet
        open={sheet === "concepto"}
        onClose={closeSheet}
        title="Nuevo concepto"
        subtitle={clase.nombre}
      >
        <ConceptoForm parent={{ claseId: clase.id }} onSuccess={onChildCreated} />
      </StudySheet>
    </>
  );
}
