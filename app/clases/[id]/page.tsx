"use client";

import { useClaseDetalle } from "@/app/hooks/useClaseDetalle";
import { AppShell } from "@/components/study/app-shell";
import { AlertText, LoadingText, TextLink } from "@/components/study/form-field";
import { DualPanelTabs } from "@/components/study/dual-panel-tabs";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { ExternalLinkPreview } from "@/components/study/external-link-preview";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import { ConceptoList } from "@/components/study/concepto-list";
import { ConceptoForm } from "@/components/study/forms/concepto-form";
import { SeguimientoForm } from "@/components/study/forms/seguimiento-form";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { StudySheet } from "@/components/study/study-sheet";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type ClaseSheet = null | "seguimiento" | "concepto";

export default function ClaseDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { clase, seguimientos, conceptos, loading, error, reload } =
    useClaseDetalle(id);
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
      <AppShell title="Clase" backHref="/temas">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !clase) {
    return (
      <AppShell title="Clase" backHref="/temas">
        <AlertText>{error ?? "No encontrada"}</AlertText>
      </AppShell>
    );
  }

  const meta = [
    clase.dificultad ? { label: "Dificultad", value: clase.dificultad } : null,
  ].filter((m): m is { label: string; value: string } => m != null);

  return (
    <>
      <AppShell title={clase.nombre} backHref={`/cursos/${clase.curso_id}`}>
        <EntityDetailHeader
          nombre={clase.nombre}
          descripcion={clase.descripcion}
          derivados={clase.derivados}
          meta={meta}
        />

        {clase.link ? <ExternalLinkPreview link={clase.link} /> : null}

        <DualPanelTabs
          panelA={{
            label: `Seguimiento (${seguimientos.length})`,
            content: (
              <div className="pb-20">
                <SeguimientoList items={seguimientos} />
              </div>
            ),
          }}
          panelB={{
            label: `Conceptos (${conceptos.length})`,
            content: (
              <div className="pb-20">
                <ConceptoList items={conceptos} />
              </div>
            ),
          }}
        />

        <p className="text-center text-xs text-ink-muted">
          <TextLink href={`/cursos/${clase.curso_id}`}>Volver al curso</TextLink>
        </p>
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
      >
        <ConceptoForm parent={{ claseId: clase.id }} onSuccess={onChildCreated} />
      </StudySheet>
    </>
  );
}
