"use client";

import { useClaseDetalle } from "@/app/hooks/useClaseDetalle";
import { AppShell } from "@/components/study/app-shell";
import { AlertText, LoadingText, TextLink } from "@/components/study/form-field";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { FabLink } from "@/components/study/fab-link";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import { useParams } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";

export default function ClaseDetallePage() {
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { clase, seguimientos, loading, error } = useClaseDetalle(id);

  if (loading) {
    return (
      <AppShell title="Clase" backHref="/temas">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !clase) {
    return (
      <AppShell title="Clase" backHref="/temas">
        <AlertText>{error ?? "No encontrada"}</AlertText>
      </AppShell>
    );
  }

  const meta = [
    clase.dificultad ? { label: "Dificultad", value: clase.dificultad } : null,
  ].filter((m): m is { label: string; value: string } => m != null);

  return (
    <>
      <AppShell title={clase.nombre} backHref={`/cursos/${clase.curso_id}`}>
        <EntityDetailHeader
          nombre={clase.nombre}
          descripcion={clase.descripcion}
          derivados={clase.derivados}
          meta={meta}
        />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Seguimiento ({seguimientos.length})
          </h3>
          <SeguimientoList items={seguimientos} />
        </section>

        <p className="text-center text-xs text-ink-muted">
          <TextLink href={`/cursos/${clase.curso_id}`}>Volver al curso</TextLink>
        </p>
      </AppShell>
      <FabLink
        href={`/seguimientos/nuevo?clase_id=${clase.id}`}
        label="Seguimiento"
      />
    </>
  );
}
