"use client";

import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import { AppShell } from "@/components/study/app-shell";
import { DualPanelTabs } from "@/components/study/dual-panel-tabs";
import { EntityCard } from "@/components/study/entity-card";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { AddEntityLink, AlertText, LoadingText } from "@/components/study/form-field";
import { FabLink } from "@/components/study/fab-link";
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

export default function TemaDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { tema, cursos, seguimientos, loading, error } = useTemaDetalle(id);

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

  const meta = [
    tema.fecha_estimada_inicio
      ? {
          label: "Estimado inicio",
          value: formatFecha(tema.fecha_estimada_inicio) ?? "",
        }
      : null,
    tema.fecha_estimada_fin
      ? {
          label: "Estimado fin",
          value: formatFecha(tema.fecha_estimada_fin) ?? "",
        }
      : null,
  ].filter((m): m is { label: string; value: string } => m != null);

  return (
    <>
      <AppShell title={tema.nombre} backHref="/temas">
        <EntityDetailHeader
          nombre={tema.nombre}
          descripcion={tema.descripcion}
          derivados={tema.derivados}
          meta={meta}
        />

        <DualPanelTabs
          panelA={{
            label: `Cursos (${cursos.length})`,
            content: (
              <div className="space-y-3">
                <AddEntityLink
                  href={`/temas/${tema.id}/cursos/nuevo`}
                  label="Agregar curso"
                />
                {cursos.length === 0 ? (
                  <p className="text-center text-sm text-ink-muted">
                    Sin cursos todavía.
                  </p>
                ) : (
                  cursos.map((c) => (
                    <EntityCard
                      key={c.id}
                      href={`/cursos/${c.id}`}
                      nombre={c.nombre}
                      subtitulo={c.plataforma ?? c.descripcion}
                      derivados={c.derivados}
                      badge={`#${c.orden}`}
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
      </AppShell>
      <FabLink
        href={`/seguimientos/nuevo?tema_id=${tema.id}`}
        label="Seguimiento"
      />
    </>
  );
}
