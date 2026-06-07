"use client";

import { useTemaDetalleMetrics } from "@/app/hooks/useTemaDetalleMetrics";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AlertText, LoadingText } from "@/components/ui";
import { FabExpandMenu } from "@/components/mobile/fab/fab-expand-menu";
import type { ChildQuickAction } from "@/components/mobile/cards/child-context-menu";
import { CursoForm } from "@/components/shared/forms/curso-form";
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
import { TemaDetalleView } from "@/components/mobile/detalle/tema-detalle-view";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type SheetState =
  | null
  | { mode: "curso" }
  | { mode: "seguimiento"; parent: SeguimientoParent; contextLabel?: string }
  | { mode: "concepto"; parent: ConceptoParent; contextLabel?: string };

export default function TemaDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { tema, cursos, seguimientos, conceptos, loading, error, reload, metrics } =
    useTemaDetalleMetrics(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
  }

  function openCursoQuickAction(
    cursoId: number,
    nombre: string,
    action: ChildQuickAction,
  ) {
    if (action === "seguimiento") {
      setSheet({
        mode: "seguimiento",
        parent: { cursoId },
        contextLabel: nombre,
      });
    } else {
      setSheet({
        mode: "concepto",
        parent: { cursoId },
        contextLabel: nombre,
      });
    }
  }

  if (loading) {
    return (
      <AppShell title="Tema" backHref="/temas" shellTone="tema">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !tema || !metrics) {
    return (
      <AppShell title="Tema" backHref="/temas" shellTone="tema">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  const seguimientoParent =
    sheet?.mode === "seguimiento"
      ? {
          kind: seguimientoParentKind(sheet.parent),
          name: sheet.contextLabel ?? tema.nombre,
        }
      : null;
  const conceptoParent =
    sheet?.mode === "concepto"
      ? {
          kind: conceptoParentKind(sheet.parent),
          name: sheet.contextLabel ?? tema.nombre,
        }
      : null;

  return (
    <>
      <AppShell
        breadcrumb={`Tema · ${tema.nombre}`}
        backHref="/temas"
        shellTone="tema"
        contentClassName="estudio-detalle-shell tema-detalle-shell flex min-h-0 flex-1 flex-col gap-0 px-2 pt-4 pb-0"
      >
        <TemaDetalleView
          tema={tema}
          cursos={cursos}
          seguimientos={seguimientos}
          conceptos={conceptos}
          metrics={metrics}
          onCursoQuickAction={openCursoQuickAction}
        />
      </AppShell>

      <FabExpandMenu
        mainLabel="Acciones del tema"
        onSelect={(actionId) => {
          if (actionId === "curso") setSheet({ mode: "curso" });
          if (actionId === "seguimiento") {
            setSheet({ mode: "seguimiento", parent: { temaId: tema.id } });
          }
          if (actionId === "concepto") {
            setSheet({ mode: "concepto", parent: { temaId: tema.id } });
          }
        }}
        actions={[
          { id: "seguimiento", label: "Seguimiento", variant: "solid" },
          { id: "concepto", label: "Concepto", variant: "solid" },
          { id: "curso", label: "Agregar curso", variant: "dashed" },
        ]}
      />

      <StudySheet
        open={sheet?.mode === "curso"}
        onClose={closeSheet}
        title="Nuevo curso"
        subtitle={formatFormParentSubtitle("tema", tema.nombre)}
        tone="curso"
      >
        <FormParentBanner parentKind="tema" parentName={tema.nombre} className="mb-4" />
        <CursoForm
          temaId={tema.id}
          onSuccess={(_id, _meta) => void onChildCreated()}
        />
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
