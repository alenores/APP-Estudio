"use client";

import { useCursoDetalleMetrics } from "@/app/hooks/useCursoDetalleMetrics";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AlertText, LoadingText } from "@/components/ui";
import { FabExpandMenu } from "@/components/mobile/fab/fab-expand-menu";
import type { ChildQuickAction } from "@/components/mobile/cards/child-context-menu";
import { ClaseForm } from "@/components/shared/forms/clase-form";
import { FormParentBanner } from "@/components/shared/forms/form-parent-banner";
import type { ConceptoParent, SeguimientoParent } from "@/lib/form-parent-types";
import {
  conceptoParentKind,
  formatFormParentSubtitle,
  seguimientoParentKind,
} from "@/lib/form-parent-context";
import { ConceptoForm } from "@/components/shared/forms/concepto-form";
import { SeguimientoForm } from "@/components/shared/forms/seguimiento-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { CursoDetalleView } from "@/components/mobile/detalle/curso-detalle-view";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type SheetState =
  | null
  | { mode: "clase" }
  | { mode: "seguimiento"; parent: SeguimientoParent; contextLabel?: string }
  | { mode: "concepto"; parent: ConceptoParent; contextLabel?: string };

export default function CursoDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { curso, clases, seguimientos, conceptos, loading, error, reload, metrics } =
    useCursoDetalleMetrics(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
  }

  function openClaseQuickAction(
    claseId: number,
    nombre: string,
    action: ChildQuickAction,
  ) {
    if (action === "seguimiento") {
      setSheet({
        mode: "seguimiento",
        parent: { claseId },
        contextLabel: nombre,
      });
    } else {
      setSheet({
        mode: "concepto",
        parent: { claseId },
        contextLabel: nombre,
      });
    }
  }

  if (loading) {
    return (
      <AppShell title="Curso" backHref="/temas" shellTone="curso">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !curso || !metrics) {
    return (
      <AppShell title="Curso" backHref="/temas" shellTone="curso">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  const seguimientoParent =
    sheet?.mode === "seguimiento"
      ? {
          kind: seguimientoParentKind(sheet.parent),
          name: sheet.contextLabel ?? curso.nombre,
        }
      : null;
  const conceptoParent =
    sheet?.mode === "concepto"
      ? {
          kind: conceptoParentKind(sheet.parent),
          name: sheet.contextLabel ?? curso.nombre,
        }
      : null;

  return (
    <>
      <AppShell
        breadcrumb={`Curso · ${curso.nombre}`}
        backHref={`/temas/${curso.tema_id}`}
        shellTone="curso"
        contentClassName="estudio-detalle-shell tema-detalle-shell flex min-h-0 flex-1 flex-col gap-0 px-2 pt-4 pb-0"
      >
        <CursoDetalleView
          curso={curso}
          clases={clases}
          seguimientos={seguimientos}
          conceptos={conceptos}
          metrics={metrics}
          onClaseQuickAction={openClaseQuickAction}
        />
      </AppShell>

      <FabExpandMenu
        mainLabel="Acciones del curso"
        onSelect={(actionId) => {
          if (actionId === "clase") setSheet({ mode: "clase" });
          if (actionId === "seguimiento") {
            setSheet({ mode: "seguimiento", parent: { cursoId: curso.id } });
          }
          if (actionId === "concepto") {
            setSheet({ mode: "concepto", parent: { cursoId: curso.id } });
          }
        }}
        actions={[
          { id: "seguimiento", label: "Seguimiento", variant: "solid" },
          { id: "concepto", label: "Concepto", variant: "solid" },
          { id: "clase", label: "Agregar clase", variant: "dashed" },
        ]}
      />

      <StudySheet
        open={sheet?.mode === "clase"}
        onClose={closeSheet}
        title="Nueva clase"
        subtitle={formatFormParentSubtitle("curso", curso.nombre)}
        tone="clase"
      >
        <FormParentBanner parentKind="curso" parentName={curso.nombre} className="mb-4" />
        <ClaseForm cursoId={curso.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
        subtitle={
          seguimientoParent
            ? formatFormParentSubtitle(
                seguimientoParent.kind,
                seguimientoParent.name,
              )
            : undefined
        }
        tone="seguimiento"
      >
        {sheet?.mode === "seguimiento" && seguimientoParent ? (
          <>
            <FormParentBanner
              parentKind={seguimientoParent.kind}
              parentName={seguimientoParent.name}
              className="mb-4"
            />
            <SeguimientoForm
              parent={sheet.parent}
              onSuccess={onChildCreated}
            />
          </>
        ) : null}
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "concepto"}
        onClose={closeSheet}
        title="Nuevo concepto"
        subtitle={
          conceptoParent
            ? formatFormParentSubtitle(conceptoParent.kind, conceptoParent.name)
            : undefined
        }
      >
        {sheet?.mode === "concepto" && conceptoParent ? (
          <>
            <FormParentBanner
              parentKind={conceptoParent.kind}
              parentName={conceptoParent.name}
              className="mb-4"
            />
            <ConceptoForm parent={sheet.parent} onSuccess={onChildCreated} />
          </>
        ) : null}
      </StudySheet>
    </>
  );
}
