"use client";

import { useAccionDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { AppShell } from "@/components/mobile/shell/app-shell";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { StudySheet } from "@/components/mobile/sheets/study-sheet";
import { AlertText, LoadingText, SurfaceCard, TextLink } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { parseEntityId } from "@/lib/parse-entity-id";
import { useState } from "react";

export default function AccionDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { accion, especifica, general, loading, error, reload } =
    useAccionDetalle(id);
  const [editOpen, setEditOpen] = useState(false);

  if (loading) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="clase">
        <LoadingText />
      </AppShell>
    );
  }

  if (error || !accion || !especifica || !general) {
    return (
      <AppShell title="Desarrollos" backHref="/desarrollos" shellTone="clase">
        <AlertText>{error ?? "No encontrado"}</AlertText>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        breadcrumb={`Acción · ${accion.nombre}`}
        backHref={`/definicion-especifica/${especifica.id}`}
        shellTone="clase"
      >
        <SurfaceCard className="border-fuchsia-200 bg-fuchsia-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-700">
            Acción
          </p>
          <h1 className="mt-1 text-lg font-semibold">{accion.nombre}</h1>
          {accion.descripcion ? (
            <p className="mt-2 text-sm text-ink-muted">{accion.descripcion}</p>
          ) : null}
          <p className="mt-3 text-xs text-ink-muted">
            Específica:{" "}
            <TextLink href={`/definicion-especifica/${especifica.id}`}>
              {especifica.nombre}
            </TextLink>
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            General:{" "}
            <TextLink href={`/definicion-general/${general.id}`}>
              {general.nombre}
            </TextLink>
          </p>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-3 text-xs font-semibold text-fuchsia-800"
          >
            Editar acción
          </button>
        </SurfaceCard>
      </AppShell>

      <StudySheet open={editOpen} onClose={() => setEditOpen(false)} title="Editar acción">
        <AccionForm
          especificaId={especifica.id}
          accion={accion}
          onSuccess={async () => {
            setEditOpen(false);
            await reload();
          }}
          onDelete={() => {
            setEditOpen(false);
            router.replace(`/definicion-especifica/${especifica.id}`);
          }}
        />
      </StudySheet>
    </>
  );
}
