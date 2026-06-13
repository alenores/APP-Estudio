"use client";

import { useAccionDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { desarrollosExplorerHref } from "@/app/hooks/useDesarrollosExplorer";
import {
  DesarrollosDetalleNav,
  desarrollosDesktopFormOverlay,
} from "@/components/desktop/desarrollos-detalle-nav";
import { DesktopModal } from "@/components/desktop/desktop-modal";
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
import { AlertText, LoadingText, TextLink } from "@/components/ui";
import { parseEntityId } from "@/lib/parse-entity-id";
import { Play, StickyNote } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type ModalState = null | { mode: "edit" } | { mode: "caracteristica" };

export function DesarrollosAccionDetalleView() {
  const router = useRouter();
  const params = useParams();
  const id = parseEntityId(typeof params.id === "string" ? params.id : undefined);
  const { accion, especifica, general, caracteristicas, pendientes, loading, error, reload } =
    useAccionDetalle(id);
  const [modal, setModal] = useState<ModalState>(null);

  if (loading) {
    return <LoadingText>Cargando acción…</LoadingText>;
  }

  if (error || !accion || !especifica || !general) {
    return <AlertText>{error ?? "No encontrado"}</AlertText>;
  }

  const explorerHref = desarrollosExplorerHref({
    generalId: general.id,
    especificaId: especifica.id,
    accionId: accion.id,
  });

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 pb-8">
        <DesarrollosDetalleNav explorerHref={explorerHref} />

        <DesarrollosDetailHero
          level="accion"
          levelLabel="Acción"
          icon={Play}
          title={accion.nombre}
          description={accion.descripcion}
          editLabel="Editar acción"
          onEdit={() => setModal({ mode: "edit" })}
          meta={
            <>
              <DesarrollosMetaLine>
                Específica:{" "}
                <TextLink href={`/definicion-especifica/${especifica.id}`}>
                  {especifica.nombre}
                </TextLink>
              </DesarrollosMetaLine>
              <DesarrollosMetaLine>
                General:{" "}
                <TextLink href={`/definicion-general/${general.id}`}>
                  {general.nombre}
                </TextLink>
              </DesarrollosMetaLine>
            </>
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
          parent={{ accion_id: accion.id }}
          onChanged={() => void reload()}
          renderFormOverlay={desarrollosDesktopFormOverlay}
        />
      </div>

      <DesktopModal
        open={modal?.mode === "edit"}
        onClose={() => setModal(null)}
        title="Editar acción"
      >
        <AccionForm
          especificaId={especifica.id}
          accion={accion}
          onSuccess={async () => {
            setModal(null);
            await reload();
          }}
          onDelete={() => {
            setModal(null);
            router.replace(`/definicion-especifica/${especifica.id}`);
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={modal?.mode === "caracteristica"}
        onClose={() => setModal(null)}
        title="Nueva característica"
      >
        <CaracteristicaForm
          parent={{ accion_id: accion.id }}
          onSuccess={() => {
            setModal(null);
            void reload();
          }}
        />
      </DesktopModal>
    </>
  );
}
