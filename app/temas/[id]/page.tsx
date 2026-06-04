"use client";

import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import { AppShell } from "@/components/study/app-shell";
import { TriplePanelTabs } from "@/components/study/triple-panel-tabs";
import { EntityCardWithQuickActions } from "@/components/study/entity-card-with-quick-actions";
import { TemaInfoSection } from "@/components/study/tema-info-section";
import { AlertText, LoadingText } from "@/components/study/form-field";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import type { ChildQuickAction } from "@/components/study/child-context-menu";
import { ConceptoList } from "@/components/study/concepto-list";
import { CursoForm } from "@/components/study/forms/curso-form";
import { ConceptoForm } from "@/components/study/forms/concepto-form";
import type { ConceptoParent } from "@/components/study/forms/concepto-form";
import { SeguimientoForm } from "@/components/study/forms/seguimiento-form";
import type { SeguimientoParent } from "@/components/study/forms/seguimiento-form";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { StudySheet } from "@/components/study/study-sheet";
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
  const { tema, cursos, seguimientos, conceptos, loading, error, reload } =
    useTemaDetalle(id);
  const [sheet, setSheet] = useState<SheetState>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
  }

  function openCursoQuickAction(cursoId: number, nombre: string, action: ChildQuickAction) {
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
      <AppShell title="Tema" backHref="/temas">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !tema) {
    return (
      <AppShell title="Tema" backHref="/temas">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  const seguimientoTitle =
    sheet?.mode === "seguimiento" && sheet.contextLabel
      ? `Nuevo seguimiento · ${sheet.contextLabel}`
      : "Nuevo seguimiento";
  const conceptoTitle =
    sheet?.mode === "concepto" && sheet.contextLabel
      ? `Nuevo concepto · ${sheet.contextLabel}`
      : "Nuevo concepto";

  return (
    <>
      <AppShell title={tema.nombre} backHref="/temas">
        <TemaInfoSection tema={tema} />

        <TriplePanelTabs
          panelA={{
            label: `Cursos (${cursos.length})`,
            content: (
              <div className="space-y-3 pb-20">
                {cursos.length === 0 ? (
                  <p className="text-center text-sm text-ink-muted">
                    Sin cursos todavía. Usá + para agregar uno.
                  </p>
                ) : (
                  cursos.map((c) => (
                    <EntityCardWithQuickActions
                      key={c.id}
                      href={`/cursos/${c.id}`}
                      nombre={c.nombre}
                      subtitulo={c.descripcion}
                      externalLink={c.link}
                      derivados={c.derivados}
                      onQuickAction={(action: ChildQuickAction) =>
                        openCursoQuickAction(c.id, c.nombre, action)
                      }
                    />
                  ))
                )}
              </div>
            ),
          }}
          panelB={{
            label: `Seguimiento (${seguimientos.length})`,
            content: (
              <div className="pb-20">
                <SeguimientoList items={seguimientos} />
              </div>
            ),
          }}
          panelC={{
            label: `Conceptos (${conceptos.length})`,
            content: (
              <div className="pb-20">
                <ConceptoList items={conceptos} />
              </div>
            ),
          }}
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
      >
        <CursoForm temaId={tema.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet?.mode === "seguimiento"}
        onClose={closeSheet}
        title={seguimientoTitle}
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
        title={conceptoTitle}
      >
        {sheet?.mode === "concepto" ? (
          <ConceptoForm parent={sheet.parent} onSuccess={onChildCreated} />
        ) : null}
      </StudySheet>
    </>
  );
}
