"use client";

import { useDefinicionGeneralDetalle } from "@/app/hooks/useDefinicionesGeneralesList";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { desarrollosDesktopFormOverlay } from "@/components/desktop/desarrollos-detalle-nav";
import { EspecificaListCard } from "@/components/mobile/desarrollos/especifica-list-card";
import {
  DesarrollosDetailHero,
  DesarrollosEmptyState,
  DesarrollosSectionHeader,
} from "@/components/mobile/desarrollos/desarrollos-chrome";
import { PendientesSection } from "@/components/mobile/desarrollos/pendientes-section";
import { DefinicionEspecificaForm } from "@/components/shared/forms/definicion-especifica-form";
import { DefinicionGeneralForm } from "@/components/shared/forms/definicion-general-form";
import { AlertText, LoadingText } from "@/components/ui";
import { GitBranch, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ModalState = null | { mode: "especifica" } | { mode: "edit-general" };

type DesarrollosGeneralDetalleBlockProps = {
  generalId: number;
  /** Resalta la específica activa en el listado (ficha combinada PC). */
  activeEspecificaId?: number | null;
  onChanged?: () => void;
};

/** Bloque detalle definición general — reutilizable en ficha general y específica PC. */
export function DesarrollosGeneralDetalleBlock({
  generalId,
  activeEspecificaId,
  onChanged,
}: DesarrollosGeneralDetalleBlockProps) {
  const router = useRouter();
  const {
    general,
    especificas,
    accionesCountByEspecifica,
    pendientes,
    loading,
    error,
    reload,
  } = useDefinicionGeneralDetalle(generalId);
  const [modal, setModal] = useState<ModalState>(null);

  async function refresh() {
    await reload();
    onChanged?.();
  }

  if (loading) {
    return <LoadingText>Cargando definición general…</LoadingText>;
  }

  if (error || !general) {
    return <AlertText>{error ?? "Definición general no encontrada"}</AlertText>;
  }

  return (
    <>
      <DesarrollosDetailHero
        level="general"
        levelLabel="Definición general"
        icon={Layers}
        title={general.nombre}
        description={general.descripcion}
        editLabel="Editar general"
        onEdit={() => setModal({ mode: "edit-general" })}
      />

      <PendientesSection
        pendientes={pendientes}
        parent={{ definicion_general_id: general.id }}
        onChanged={() => void refresh()}
        renderFormOverlay={desarrollosDesktopFormOverlay}
      />

      <DesarrollosSectionHeader
        title="Definiciones específicas"
        count={especificas.length > 0 ? especificas.length : undefined}
        actionLabel="+ Específica"
        onAction={() => setModal({ mode: "especifica" })}
      />
      {especificas.length === 0 ? (
        <DesarrollosEmptyState
          icon={GitBranch}
          title="Sin definiciones específicas"
          hint="Creá la primera con + Específica."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {especificas.map((e) => (
            <li
              key={e.id}
              className={
                activeEspecificaId === e.id
                  ? "rounded-xl ring-2 ring-[#EA580C]/35 ring-offset-2 ring-offset-[var(--td-paper)] dark:ring-offset-stone-950"
                  : undefined
              }
            >
              <EspecificaListCard
                especifica={e}
                accionesCount={accionesCountByEspecifica.get(e.id) ?? 0}
              />
            </li>
          ))}
        </ul>
      )}

      <DesktopModal
        open={modal?.mode === "especifica"}
        onClose={() => setModal(null)}
        title="Nueva definición específica"
      >
        <DefinicionEspecificaForm
          generalId={general.id}
          onSuccess={async (newId) => {
            setModal(null);
            await refresh();
            router.push(`/definicion-especifica/${newId}`);
          }}
        />
      </DesktopModal>

      <DesktopModal
        open={modal?.mode === "edit-general"}
        onClose={() => setModal(null)}
        title="Editar definición general"
      >
        <DefinicionGeneralForm
          general={general}
          onSuccess={async () => {
            setModal(null);
            await refresh();
          }}
          onDelete={() => {
            setModal(null);
            router.replace("/explorador-desarrollos");
          }}
        />
      </DesktopModal>
    </>
  );
}
