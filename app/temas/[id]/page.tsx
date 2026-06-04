"use client";

import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import { AppShell } from "@/components/study/app-shell";
import { TriplePanelTabs } from "@/components/study/triple-panel-tabs";
import { EntityCard } from "@/components/study/entity-card";
import { TemaInfoSection } from "@/components/study/tema-info-section";
import { AlertText, LoadingText } from "@/components/study/form-field";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import { ConceptoList } from "@/components/study/concepto-list";
import { CursoForm } from "@/components/study/forms/curso-form";
import { ConceptoForm } from "@/components/study/forms/concepto-form";
import { SeguimientoForm } from "@/components/study/forms/seguimiento-form";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { StudySheet } from "@/components/study/study-sheet";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type TemaSheet = null | "curso" | "seguimiento" | "concepto";

export default function TemaDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { tema, cursos, seguimientos, conceptos, loading, error, reload } =
    useTemaDetalle(id);
  const [sheet, setSheet] = useState<TemaSheet>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
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
                    <EntityCard
                      key={c.id}
                      href={`/cursos/${c.id}`}
                      nombre={c.nombre}
                      subtitulo={c.descripcion}
                      externalLink={c.link}
                      derivados={c.derivados}
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
        onSelect={(actionId) => setSheet(actionId as TemaSheet)}
        actions={[
          { id: "seguimiento", label: "Seguimiento", variant: "solid" },
          { id: "concepto", label: "Concepto", variant: "solid" },
          { id: "curso", label: "Agregar curso", variant: "dashed" },
        ]}
      />

      <StudySheet
        open={sheet === "curso"}
        onClose={closeSheet}
        title="Nuevo curso"
      >
        <CursoForm temaId={tema.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
      >
        <SeguimientoForm
          parent={{ temaId: tema.id }}
          onSuccess={onChildCreated}
        />
      </StudySheet>

      <StudySheet
        open={sheet === "concepto"}
        onClose={closeSheet}
        title="Nuevo concepto"
      >
        <ConceptoForm parent={{ temaId: tema.id }} onSuccess={onChildCreated} />
      </StudySheet>
    </>
  );
}
