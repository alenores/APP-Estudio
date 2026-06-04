"use client";

import { useCursoDetalle } from "@/app/hooks/useCursoDetalle";
import { AppShell } from "@/components/study/app-shell";
import { AlertText, LoadingText, TextLink } from "@/components/study/form-field";
import { TriplePanelTabs } from "@/components/study/triple-panel-tabs";
import { EntityCard } from "@/components/study/entity-card";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import { ConceptoList } from "@/components/study/concepto-list";
import { ClaseForm } from "@/components/study/forms/clase-form";
import { ConceptoForm } from "@/components/study/forms/concepto-form";
import { SeguimientoForm } from "@/components/study/forms/seguimiento-form";
import { PlatformLinkIcon } from "@/components/study/platform-link-icon";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { StudySheet } from "@/components/study/study-sheet";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

type CursoSheet = null | "clase" | "seguimiento" | "concepto";

function formatFecha(value: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function CursoDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { curso, clases, seguimientos, conceptos, loading, error, reload } =
    useCursoDetalle(id);
  const [sheet, setSheet] = useState<CursoSheet>(null);

  function closeSheet() {
    setSheet(null);
  }

  async function onChildCreated() {
    closeSheet();
    await reload({ silent: true });
  }

  if (loading) {
    return (
      <AppShell title="Curso" backHref="/temas">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !curso) {
    return (
      <AppShell title="Curso" backHref="/temas">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  const meta = [
    curso.fecha_estimada_inicio
      ? {
          label: "Estimado inicio",
          value: formatFecha(curso.fecha_estimada_inicio) ?? "",
        }
      : null,
    curso.fecha_estimada_fin
      ? {
          label: "Estimado fin",
          value: formatFecha(curso.fecha_estimada_fin) ?? "",
        }
      : null,
  ].filter((m): m is { label: string; value: string } => m != null);

  return (
    <>
      <AppShell
        title={curso.nombre}
        backHref={`/temas/${curso.tema_id}`}
      >
        <EntityDetailHeader
          nombre={curso.nombre}
          descripcion={curso.descripcion}
          derivados={curso.derivados}
          meta={meta}
        />

        {curso.link ? (
          <div className="flex justify-center">
            <PlatformLinkIcon link={curso.link} size="lg" />
          </div>
        ) : null}

        <TriplePanelTabs
          panelA={{
            label: `Clases (${clases.length})`,
            content: (
              <div className="space-y-3 pb-20">
                {clases.length === 0 ? (
                  <p className="text-center text-sm text-ink-muted">
                    Sin clases todavía. Usá + para agregar una.
                  </p>
                ) : (
                  clases.map((cl) => (
                    <EntityCard
                      key={cl.id}
                      href={`/clases/${cl.id}`}
                      nombre={cl.nombre}
                      subtitulo={cl.dificultad ?? cl.descripcion}
                      derivados={cl.derivados}
                      badge={`#${cl.orden}`}
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

        <p className="text-center text-xs text-ink-muted">
          <TextLink href={`/temas/${curso.tema_id}`}>Volver al tema</TextLink>
        </p>
      </AppShell>

      <FabExpandMenu
        mainLabel="Acciones del curso"
        onSelect={(actionId) => setSheet(actionId as CursoSheet)}
        actions={[
          { id: "seguimiento", label: "Seguimiento", variant: "solid" },
          { id: "concepto", label: "Concepto", variant: "solid" },
          { id: "clase", label: "Agregar clase", variant: "dashed" },
        ]}
      />

      <StudySheet
        open={sheet === "clase"}
        onClose={closeSheet}
        title="Nueva clase"
      >
        <ClaseForm cursoId={curso.id} onSuccess={onChildCreated} />
      </StudySheet>

      <StudySheet
        open={sheet === "seguimiento"}
        onClose={closeSheet}
        title="Nuevo seguimiento"
      >
        <SeguimientoForm
          parent={{ cursoId: curso.id }}
          onSuccess={onChildCreated}
        />
      </StudySheet>

      <StudySheet
        open={sheet === "concepto"}
        onClose={closeSheet}
        title="Nuevo concepto"
      >
        <ConceptoForm parent={{ cursoId: curso.id }} onSuccess={onChildCreated} />
      </StudySheet>
    </>
  );
}
