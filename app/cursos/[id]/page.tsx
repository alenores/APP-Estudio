"use client";

import { useCursoDetalle } from "@/app/hooks/useCursoDetalle";
import { AppShell } from "@/components/study/app-shell";
import { AddEntityLink, AlertText, LoadingText, TextLink } from "@/components/study/form-field";
import { DualPanelTabs } from "@/components/study/dual-panel-tabs";
import { EntityCard } from "@/components/study/entity-card";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { FabLink } from "@/components/study/fab-link";
import { PlatformLinkIcon } from "@/components/study/platform-link-icon";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";

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
  const { curso, clases, seguimientos, loading, error } = useCursoDetalle(id);

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

        <DualPanelTabs
          panelA={{
            label: `Clases (${clases.length})`,
            content: (
              <div className="space-y-3">
                <AddEntityLink
                  href={`/cursos/${curso.id}/clases/nuevo`}
                  label="Agregar clase"
                />
                {clases.length === 0 ? (
                  <p className="text-center text-sm text-ink-muted">
                    Sin clases todavía.
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
            content: <SeguimientoList items={seguimientos} />,
          }}
        />

        <p className="text-center text-xs text-ink-muted">
          <TextLink href={`/temas/${curso.tema_id}`}>Volver al tema</TextLink>
        </p>
      </AppShell>
      <FabLink
        href={`/seguimientos/nuevo?curso_id=${curso.id}`}
        label="Seguimiento"
      />
    </>
  );
}
