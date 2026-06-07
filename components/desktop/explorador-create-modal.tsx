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
  nodoId: number | null;
  cursoId: number | null;
  temaNombre: string | null;
  nodoNombre: string | null;
  cursoNombre: string | null;
  onClose: () => void;
  onCreated: (partial: {
    temaId?: number;
    nodoId?: number;
    cursoId?: number;
    claseId?: number;
  }) => void;
};

export function ExploradorCreateModal({
  kind,
  temaId,
  nodoId,
  cursoId,
  temaNombre,
  nodoNombre,
  cursoNombre,
  onClose,
  onCreated,
}: ExploradorCreateModalProps) {
  const { refreshSnapshot } = useEstudioData();

  async function afterCreate(partial: {
    temaId?: number;
    nodoId?: number;
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
      : kind === "curso" && nodoNombre
        ? formatFormParentSubtitle("nodo", nodoNombre)
        : kind === "clase" && cursoNombre
          ? formatFormParentSubtitle("curso", cursoNombre)
          : undefined;

  const createCursoFromTema = kind === "curso" && temaId != null && temaNombre;
  const createCursoFromNodo =
    kind === "curso" && nodoId != null && nodoNombre && !createCursoFromTema;

  return (
    <DesktopModal open onClose={onClose} title={titles[kind]} subtitle={subtitle} tone={kind}>
      <div className={estudioFormWellClass(kind)}>
      {kind === "tema" ? (
        <TemaForm onSuccess={(id) => void afterCreate({ temaId: id })} />
      ) : null}
      {createCursoFromTema ? (
        <>
          <FormParentBanner
            parentKind="tema"
            parentName={temaNombre}
            className="mb-4"
          />
          <CursoForm
            temaId={temaId}
            defaultNodoId={nodoId}
            onSuccess={(id, meta) =>
              void afterCreate({
                temaId: meta.temaId,
                nodoId: meta.nodoId,
                cursoId: id,
              })
            }
          />
        </>
      ) : null}
      {createCursoFromNodo ? (
        <>
          <FormParentBanner
            parentKind="nodo"
            parentName={nodoNombre}
            className="mb-4"
          />
          <CursoForm
            defaultNodoId={nodoId}
            lockNodoId
            onSuccess={(id, meta) =>
              void afterCreate({
                temaId: meta.temaId,
                nodoId: meta.nodoId,
                cursoId: id,
              })
            }
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
