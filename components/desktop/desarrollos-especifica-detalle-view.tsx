"use client";

import { useDefinicionEspecificaDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { desarrollosExplorerHref } from "@/app/hooks/useDesarrollosExplorer";
import {
  DesarrollosDetalleNav,
  desarrollosDesktopFormOverlay,
} from "@/components/desktop/desarrollos-detalle-nav";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { AccionListCard } from "@/components/mobile/desarrollos/accion-list-card";
import { CaracteristicaListCard } from "@/components/mobile/desarrollos/caracteristica-list-card";
import {
  DesarrollosDetailHero,
  DesarrollosEmptyState,
  DesarrollosMetaLine,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { AccionForm } from "@/components/shared/forms/accion-form";
import { CaracteristicaForm } from "@/components/shared/forms/caracteristica-form";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { parseEntityId } from "@/lib/parse-entity-id";
import { CornerDownRight, Play, StickyNote } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type ModalState =
  | null
  | { mode: "accion" }
  | { mode: "caracteristica" }
  | { mode: "edit-especifica" };

export function DesarrollosEspecificaDetalleView() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const {
    especifica,
    general,
    acciones,
    caracteristicas,
    pendientes,
    loading,
    error,
    reload,
  } = useDefinicionEspecificaDetalle(id);
  const [modal, setModal] = useState<ModalState>(null);

  if (loading) {
    return <LoadingText>Cargando definición específica…</LoadingText>;
  }

  if (error || !especifica || !general) {
    return <AlertText>{error ?? "No encontrado"}</AlertText>;
  }

  const explorerHref = desarrollosExplorerHref({
    generalId: general.id,
    especificaId: especifica.id,
    accionId: null,
  });

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 pb-8">
        <DesarrollosDetalleNav explorerHref={explorerHref} />

        <DesarrollosDetailHero
          level="especifica"
          levelLabel="Definición específica"
          icon={CornerDownRight}
          title={especifica.nombre}
          description={especifica.descripcion}
          editLabel="Editar específica"
          onEdit={() => setModal({ mode: "edit-especifica" })}
          meta={
            <DesarrollosMetaLine>
              General:{" "}
              <TextLink href={`/definicion-general/${general.id}`}>
                {general.nombre}
              </TextLink>
            </DesarrollosMetaLine>
          }
        />

        <DesarrollosSectionHeader
          title="Características"
          actionLabel="+ Nueva"
          onAction={() => setModal({ mode: "caracteristica" })}
        />
        {caracteristicas.length === 0 ? (
          <DesarrollosEmptyState
            icon={StickyNote}
            title="Sin características"
            hint="Agregá notas, implicancias técnicas o prompts con + Nueva."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {caracteristicas.map((c) => (
              <li key={c.id}>
                <CaracteristicaListCard
                  caracteristica={c}
                  onDeleted={() => void reload()}
                />
              </li>
            ))}
          </ul>
        )}

        <PendientesSection
          pendientes={pendientes}
          parent={{ definicion_especifica_id: especifica.id }}
          onChanged={() => void reload()}
          renderFormOverlay={desarrollosDesktopFormOverlay}
        />

        <DesarrollosSectionHeader
          title="Acciones"
          actionLabel="+ Acción"
          onAction={() => setModal({ mode: "accion" })}
        />
        {acciones.length === 0 ? (
          <DesarrollosEmptyState
            icon={Play}
            title="Sin acciones"
            hint="Definí pasos concretos con + Acción."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {acciones.map((a) => (
              <li key={a.id}>
                <AccionListCard accion={a} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <DesktopModal
        open={modal?.mode === "accion"}
        onClose={() => setModal(null)}
        title="Nueva acción"
      >
        <AccionForm
          especificaId={especifica.id}
          onSuccess={async (newId) => {
            setModal(null);
            await reload();
            router.push(`/acciones/${newId}`);
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={modal?.mode === "caracteristica"}
        onClose={() => setModal(null)}
        title="Nueva característica"
      >
        <CaracteristicaForm
          parent={{ definicion_especifica_id: especifica.id }}
          onSuccess={() => {
            setModal(null);
            void reload();
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={modal?.mode === "edit-especifica"}
        onClose={() => setModal(null)}
        title="Editar definición específica"
      >
        <DefinicionEspecificaForm
          generalId={general.id}
          especifica={especifica}
          onSuccess={async () => {
            setModal(null);
            await reload();
          }}
          onDelete={() => {
            setModal(null);
            router.replace(
              desarrollosExplorerHref({
                generalId: general.id,
                especificaId: null,
                accionId: null,
              }),
            );
          }}
        />
      </DesktopModal>
    </>
  );
}
