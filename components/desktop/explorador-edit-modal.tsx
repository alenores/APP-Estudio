"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import type { Clase, Curso, Tema } from "@/app/types/estudio";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ClaseForm } from "@/components/shared/forms/clase-form";
import { CursoForm } from "@/components/shared/forms/curso-form";
import { TemaForm } from "@/components/shared/forms/tema-form";
import {
  explorerEntityLabel,
  type ExplorerEntityKind,
} from "@/lib/explorer-entity-panel";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";

type ExploradorEditModalProps = {
  kind: ExplorerEntityKind;
  tema: Tema | null;
  curso: Curso | null;
  clase: Clase | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (cleared: {
    temaId?: null;
    cursoId?: null;
    claseId?: null;
  }) => void;
};

export function ExploradorEditModal({
  kind,
  tema,
  curso,
  clase,
  onClose,
  onSaved,
  onDeleted,
}: ExploradorEditModalProps) {
  const { refreshSnapshot } = useEstudioData();

  async function afterSave() {
    await refreshSnapshot();
    onSaved();
    onClose();
  }

  async function afterDelete() {
    await refreshSnapshot();
    if (kind === "tema") {
      onDeleted({ temaId: null, cursoId: null, claseId: null });
    } else if (kind === "curso") {
      onDeleted({ cursoId: null, claseId: null });
    } else {
      onDeleted({ claseId: null });
    }
    onClose();
  }

  const title = `Editar ${explorerEntityLabel(kind).toLowerCase()}`;

  return (
    <DesktopModal open onClose={onClose} title={title} tone={kind}>
      <div className={estudioFormWellClass(kind)}>
      {kind === "tema" && tema ? (
        <TemaForm
          tema={tema}
          onSuccess={() => void afterSave()}
          onDelete={() => void afterDelete()}
        />
      ) : null}
      {kind === "curso" && curso ? (
        <CursoForm
          temaId={curso.tema_id}
          curso={curso}
          onSuccess={() => void afterSave()}
          onDelete={() => void afterDelete()}
        />
      ) : null}
      {kind === "clase" && clase ? (
        <ClaseForm
          cursoId={clase.curso_id}
          clase={clase}
          onSuccess={() => void afterSave()}
          onDelete={() => void afterDelete()}
        />
      ) : null}
      </div>
    </DesktopModal>
  );
}
