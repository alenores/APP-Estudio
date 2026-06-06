"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ClaseForm } from "@/components/shared/forms/clase-form";
import { CursoForm } from "@/components/shared/forms/curso-form";
import { FormParentBanner } from "@/components/shared/forms/form-parent-banner";
import { TemaForm } from "@/components/shared/forms/tema-form";
import { formatFormParentSubtitle } from "@/lib/form-parent-context";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";

export type ExploradorCreateKind = "tema" | "curso" | "clase";

type ExploradorCreateModalProps = {
  kind: ExploradorCreateKind;
  temaId: number | null;
  cursoId: number | null;
  temaNombre: string | null;
  cursoNombre: string | null;
  onClose: () => void;
  onCreated: (partial: {
    temaId?: number;
    cursoId?: number;
    claseId?: number;
  }) => void;
};

export function ExploradorCreateModal({
  kind,
  temaId,
  cursoId,
  temaNombre,
  cursoNombre,
  onClose,
  onCreated,
}: ExploradorCreateModalProps) {
  const { refreshSnapshot } = useEstudioData();

  async function afterCreate(partial: {
    temaId?: number;
    cursoId?: number;
    claseId?: number;
  }) {
    await refreshSnapshot();
    onCreated(partial);
    onClose();
  }

  const titles: Record<ExploradorCreateKind, string> = {
    tema: "Nuevo tema",
    curso: "Nuevo curso",
    clase: "Nueva clase",
  };

  const subtitle =
    kind === "curso" && temaNombre
      ? formatFormParentSubtitle("tema", temaNombre)
      : kind === "clase" && cursoNombre
        ? formatFormParentSubtitle("curso", cursoNombre)
        : undefined;

  return (
    <DesktopModal open onClose={onClose} title={titles[kind]} subtitle={subtitle} tone={kind}>
      <div className={estudioFormWellClass(kind)}>
      {kind === "tema" ? (
        <TemaForm onSuccess={(id) => void afterCreate({ temaId: id })} />
      ) : null}
      {kind === "curso" && temaId != null && temaNombre ? (
        <>
          <FormParentBanner
            parentKind="tema"
            parentName={temaNombre}
            className="mb-4"
          />
          <CursoForm
            temaId={temaId}
            onSuccess={(id) => void afterCreate({ temaId, cursoId: id })}
          />
        </>
      ) : null}
      {kind === "clase" && cursoId != null && temaId != null && cursoNombre ? (
        <>
          <FormParentBanner
            parentKind="curso"
            parentName={cursoNombre}
            className="mb-4"
          />
          <ClaseForm
            cursoId={cursoId}
            onSuccess={(id) =>
              void afterCreate({ temaId, cursoId, claseId: id })
            }
          />
        </>
      ) : null}
      </div>
    </DesktopModal>
  );
}
