"use client";

import { useClaseDetalle } from "@/app/hooks/useClaseDetalle";
import { AppShell } from "@/components/study/app-shell";
import { EntityDetailHeader } from "@/components/study/entity-detail-header";
import { FabLink } from "@/components/study/fab-link";
import { SeguimientoList } from "@/components/study/seguimiento-list";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ClaseDetallePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { clase, seguimientos, loading, error } = useClaseDetalle(id);

  if (loading) {
    return (
      <AppShell title="Clase" backHref="/temas">
        <p className="text-sm text-slate-400">Cargando…</p>
      </AppShell>
    );
  }

  if (error || !clase) {
    return (
      <AppShell title="Clase" backHref="/temas">
        <p className="text-sm text-rose-300" role="alert">
          {error ?? "No encontrada"}
        </p>
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Seguimiento ({seguimientos.length})
          </h3>
          <SeguimientoList items={seguimientos} />
        </section>

        <p className="text-center text-xs text-slate-600">
          <Link
            href={`/cursos/${clase.curso_id}`}
            className="text-indigo-400 hover:underline"
          >
            Volver al curso
          </Link>
        </p>
      </AppShell>
      <FabLink
        href={`/seguimientos/nuevo?clase_id=${clase.id}`}
        label="Seguimiento"
      />
    </>
  );
}
