"use client";

import { useCursoDetalleMetrics } from "@/app/hooks/useCursoDetalleMetrics";
import { AppShell } from "@/components/study/app-shell";
import { AlertText, LoadingText } from "@/components/study/form-field";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import type { ChildQuickAction } from "@/components/study/child-context-menu";
import { ClaseForm } from "@/components/study/forms/clase-form";
import { ConceptoForm } from "@/components/study/forms/concepto-form";
import type { ConceptoParent } from "@/components/study/forms/concepto-form";
import { SeguimientoForm } from "@/components/study/forms/seguimiento-form";
import type { SeguimientoParent } from "@/components/study/forms/seguimiento-form";
import { StudySheet } from "@/components/study/study-sheet";
import { CursoDetalleView } from "@/components/estudio-detalle/curso-detalle-view";
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
      <AppShell title="Curso" backHref="/temas">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !curso || !metrics) {
    return (
      <AppShell title="Curso" backHref="/temas">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  const seguimientoSubtitle =
    sheet?.mode === "seguimiento"
      ? (sheet.contextLabel ?? curso.nombre)
      : undefined;
  const conceptoSubtitle =
    sheet?.mode === "concepto"
      ? (sheet.contextLabel ?? curso.nombre)
      : undefined;

  return (
    <>
      <AppShell
        breadcrumb={`Curso · ${curso.nombre}`}
        backHref={`/temas/${curso.tema_id}`}
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
        subtitle={curso.nombre}
      >
        <ClaseForm cursoId={curso.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
        subtitle={seguimientoSubtitle}
      >
        {sheet?.mode === "seguimiento" ? (
          <SeguimientoForm
            parent={sheet.parent}
            onSuccess={onChildCreated}
          />
        ) : null}
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "concepto"}
        onClose={closeSheet}
        title="Nuevo concepto"
        subtitle={conceptoSubtitle}
      >
        {sheet?.mode === "concepto" ? (
          <ConceptoForm parent={sheet.parent} onSuccess={onChildCreated} />
        ) : null}
      </StudySheet>
    </>
  );
}
