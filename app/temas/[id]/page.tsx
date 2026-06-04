"use client";

import { useTemaDetalle } from "@/app/hooks/useTemaDetalle";
import { AppShell } from "@/components/study/app-shell";
import { DualPanelTabs } from "@/components/study/dual-panel-tabs";
import { EntityCard } from "@/components/study/entity-card";
import { TemaInfoSection } from "@/components/study/tema-info-section";
import { AlertText, LoadingText } from "@/components/study/form-field";
import { FabExpandMenu } from "@/components/study/fab-expand-menu";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";

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

  return (
    <>
      <AppShell title={tema.nombre} backHref="/temas">
        <TemaInfoSection tema={tema} />

        <DualPanelTabs
          panelA={{
            label: `Cursos (${cursos.length})`,
            content: (
              <div className="space-y-3 pb-20">
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
        />
      </AppShell>
      <FabExpandMenu
        mainLabel="Acciones del tema"
        actions={[
          {
            href: `/seguimientos/nuevo?tema_id=${tema.id}`,
            label: "Seguimiento",
            variant: "solid",
          },
          {
            href: `/temas/${tema.id}/cursos/nuevo`,
            label: "Agregar curso",
            variant: "dashed",
          },
        ]}
      />
    </>
  );
}
