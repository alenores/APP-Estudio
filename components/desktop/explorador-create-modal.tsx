"use client";

import { useEstudioData } from "@/app/hooks/useEstudioData";
import { DesktopModal } from "@/components/desktop/desktop-modal";
import { ClaseForm } from "@/components/shared/forms/clase-form";
import { CursoForm } from "@/components/shared/forms/curso-form";
import { FormParentBanner } from "@/components/shared/forms/form-parent-banner";
import { LogroRegistroForm } from "@/components/shared/forms/logro-registro-form";
import { TemaForm } from "@/components/shared/forms/tema-form";
import { formatFormParentSubtitle } from "@/lib/form-parent-context";
import { estudioFormWellClass } from "@/lib/estudio-shell-tone";
import type { FormLienzoColocacionConfig } from "@/lib/form-lienzo-colocacion-types";

export type ExploradorCreateKind = "tema" | "curso" | "clase" | "logro";

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
    logroId?: number;
    claseId?: number;
  }) => void;
};

function exploradorLienzoConfig(
  kind: ExploradorCreateKind,
  temaId: number | null,
  nodoId: number | null,
  temaNombre: string | null,
  nodoNombre: string | null,
): FormLienzoColocacionConfig | null {
  if (kind === "tema") return { mode: "macro-temas" };
  if (kind === "curso" && temaId != null && temaNombre) {
    return {
      mode: "detalle",
      scope: {
        kind: "tema",
        temaId,
        parentLabel: temaNombre,
        childKind: "curso",
      },
      hijos: [],
    };
  }
  if (kind === "curso" && nodoId != null && nodoNombre) {
    return {
      mode: "detalle",
      scope: {
        kind: "nodo",
        nodoId,
        parentLabel: nodoNombre,
        childKind: "mixto",
      },
      hijos: [],
    };
  }
  if (kind === "logro" && nodoId != null && nodoNombre) {
    return {
      mode: "detalle",
      scope: {
        kind: "nodo",
        nodoId,
        parentLabel: nodoNombre,
        childKind: "logro",
      },
      hijos: [],
    };
  }
  return null;
}

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
    logroId?: number;
    claseId?: number;
  }) {
    if (partial.cursoId != null || partial.claseId != null) {
      await refreshSnapshot();
    }
    onCreated(partial);
    onClose();
  }

  const titles: Record<ExploradorCreateKind, string> = {
    tema: "Nuevo tema",
    curso: "Nuevo curso",
    clase: "Nueva clase",
    logro: "Nuevo logro",
  };

  const subtitle =
    kind === "curso" && temaNombre
      ? formatFormParentSubtitle("tema", temaNombre)
      : kind === "curso" && nodoNombre
        ? formatFormParentSubtitle("nodo", nodoNombre)
        : kind === "logro" && nodoNombre
          ? formatFormParentSubtitle("nodo", nodoNombre)
          : kind === "clase" && cursoNombre
            ? formatFormParentSubtitle("curso", cursoNombre)
            : undefined;

  const createCursoFromTema = kind === "curso" && temaId != null && temaNombre;
  const createCursoFromNodo =
    kind === "curso" && nodoId != null && nodoNombre && !createCursoFromTema;
  const createLogroFromNodo =
    kind === "logro" && nodoId != null && nodoNombre;

  const modalTone =
    kind === "tema" ? "tema" : kind === "clase" ? "clase" : "curso";

  const lienzoConfig = exploradorLienzoConfig(
    kind,
    temaId,
    nodoId,
    temaNombre,
    nodoNombre,
  );

  return (
    <DesktopModal
      open
      onClose={onClose}
      title={titles[kind]}
      subtitle={subtitle}
      tone={modalTone}
    >
      <div className={estudioFormWellClass(modalTone)}>
      {kind === "tema" ? (
        <TemaForm
          lienzoConfig={lienzoConfig}
          onSuccess={(id) => void afterCreate({ temaId: id })}
        />
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
            lienzoConfig={lienzoConfig}
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
            lienzoConfig={lienzoConfig}
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
      {createLogroFromNodo ? (
        <>
          <FormParentBanner
            parentKind="nodo"
            parentName={nodoNombre}
            className="mb-4"
          />
          <LogroRegistroForm
            nodoId={nodoId}
            lienzoConfig={lienzoConfig}
            onSuccess={(id) =>
              void afterCreate({ nodoId, logroId: id })
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
