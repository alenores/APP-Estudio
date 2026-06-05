"use client";

import { useTemaDetalleMetrics } from "@/app/hooks/useTemaDetalleMetrics";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AlertText, LoadingText } from "@/components/ui";
import { FabExpandMenu } from "@/components/mobile/fab/fab-expand-menu";
import type { ChildQuickAction } from "@/components/mobile/cards/child-context-menu";
import { CursoForm } from "@/components/shared/forms/curso-form";
import type { ConceptoParent, SeguimientoParent } from "@/lib/form-parent-types";
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

  const seguimientoSubtitle =
    sheet?.mode === "seguimiento"
      ? (sheet.contextLabel ?? tema.nombre)
      : undefined;
  const conceptoSubtitle =
    sheet?.mode === "concepto"
      ? (sheet.contextLabel ?? tema.nombre)
      : undefined;

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
        subtitle={tema.nombre}
        tone="curso"
      >
        <CursoForm temaId={tema.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
        subtitle={seguimientoSubtitle}
        tone="seguimiento"
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
