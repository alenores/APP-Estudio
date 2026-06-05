"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ClaseForm } from "@/components/study/forms/clase-form";
import { CursoForm } from "@/components/study/forms/curso-form";
import { TemaForm } from "@/components/study/forms/tema-form";

export type ExploradorCreateKind = "tema" | "curso" | "clase";

type ExploradorCreateModalProps = {
  kind: ExploradorCreateKind;
  temaId: number | null;
  cursoId: number | null;
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

  return (
    <DesktopModal open onClose={onClose} title={titles[kind]}>
      {kind === "tema" ? (
        <TemaForm onSuccess={(id) => void afterCreate({ temaId: id })} />
      ) : null}
      {kind === "curso" && temaId != null ? (
        <CursoForm
          temaId={temaId}
          onSuccess={(id) => void afterCreate({ temaId, cursoId: id })}
        />
      ) : null}
      {kind === "clase" && cursoId != null && temaId != null ? (
        <ClaseForm
          cursoId={cursoId}
          onSuccess={(id) =>
            void afterCreate({ temaId, cursoId, claseId: id })
          }
        />
      ) : null}
    </DesktopModal>
  );
}
