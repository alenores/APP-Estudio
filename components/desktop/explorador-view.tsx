"use client";

import {
  explorerHref,
  parseExplorerSelection,
  useEstudioExplorer,
} from "@/app/hooks/useEstudioExplorer";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useExploradorKeyboard } from "@/app/hooks/useExploradorKeyboard";
import {
  ExploradorCreateModal,
  type ExploradorCreateKind,
} from "@/components/desktop/explorador-create-modal";
import type { ExploradorColumnAction } from "@/components/desktop/explorador-columns";
import { ExploradorEditModal } from "@/components/desktop/explorador-edit-modal";
import { ExploradorPanelModal } from "@/components/desktop/explorador-panel-modal";
import {
  ExploradorColumn,
  ExploradorColumnCard,
} from "@/components/desktop/explorador-columns";
import { EstudioSyncBanner } from "@/components/shared/sync/estudio-sync-banner";
import { AlertText, LoadingText } from "@/components/ui";
import { fechaParentesisCurso } from "@/lib/curso-card-fecha";
import { fechaParentesisTema } from "@/lib/tema-card-fecha";
import type {
  ExplorerEntityRef,
  ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import { getExplorerEntityRecords } from "@/lib/explorer-entity-panel";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PanelModalState = {
  entity: ExplorerEntityRef;
  panel: ExplorerPanelKind;
};

function entityActions(
  entity: ExplorerEntityRef | null,
  handlers: {
    onEdit: (entity: ExplorerEntityRef) => void;
    onOpenPanel: (entity: ExplorerEntityRef, panel: ExplorerPanelKind) => void;
  },
): ExploradorColumnAction[] {
  const disabled = entity == null;
  return [
    {
      label: "Editar",
      title: disabled ? "Seleccioná un ítem" : `Editar ${entity.nombre}`,
      disabled,
      onClick: () => entity && handlers.onEdit(entity),
    },
    {
      label: "Seg.",
      title: disabled ? "Seleccioná un ítem" : `Seguimientos de ${entity.nombre}`,
      disabled,
      onClick: () =>
        entity && handlers.onOpenPanel(entity, "seguimientos"),
    },
    {
      label: "Conc.",
      title: disabled ? "Seleccioná un ítem" : `Conceptos de ${entity.nombre}`,
      disabled,
      onClick: () => entity && handlers.onOpenPanel(entity, "conceptos"),
    },
  ];
}

export function ExploradorView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSelection = useMemo(
    () => parseExplorerSelection(searchParams),
    [searchParams],
  );
  const {
    temas,
    cursos,
    clases,
    clasesStatsPorCurso,
    cursosStatsPorTema,
    selection,
    loading,
    error,
    packReady,
  } = useEstudioExplorer(rawSelection);
  const { cacheData } = useEstudioData();
  const [panelModal, setPanelModal] = useState<PanelModalState | null>(null);
  const [createKind, setCreateKind] = useState<ExploradorCreateKind | null>(
    null,
  );
  const [editEntity, setEditEntity] = useState<ExplorerEntityRef | null>(null);

  const modalsOpen = panelModal != null || createKind != null || editEntity != null;

  function go(href: string) {
    router.replace(href);
  }

  function openPanel(entity: ExplorerEntityRef, panel: ExplorerPanelKind) {
    setPanelModal({ entity, panel });
  }

  function onCreated(partial: {
    temaId?: number;
    cursoId?: number;
    claseId?: number;
  }) {
    go(
      explorerHref({
        temaId: partial.temaId ?? selection.temaId,
        cursoId: partial.cursoId ?? null,
        claseId: partial.claseId ?? null,
      }),
    );
  }

  function onDeleted(cleared: {
    temaId?: null;
    cursoId?: null;
    claseId?: null;
  }) {
    go(
      explorerHref({
        temaId: cleared.temaId !== undefined ? null : selection.temaId,
        cursoId: cleared.cursoId !== undefined ? null : selection.cursoId,
        claseId: cleared.claseId !== undefined ? null : selection.claseId,
      }),
    );
  }

  const selectedTema =
    selection.temaId != null
      ? (temas.find((t) => t.id === selection.temaId) ?? null)
      : null;
  const selectedCurso =
    selection.cursoId != null
      ? (cursos.find((c) => c.id === selection.cursoId) ?? null)
      : null;
  const selectedClase =
    selection.claseId != null
      ? (clases.find((cl) => cl.id === selection.claseId) ?? null)
      : null;

  function entityCounts(ref: ExplorerEntityRef | null) {
    if (!ref || !cacheData) return { seguimientos: 0, conceptos: 0 };
    const records = getExplorerEntityRecords(cacheData, ref);
    return {
      seguimientos: records.seguimientos.length,
      conceptos: records.conceptos.length,
    };
  }

  function cardHandlers(ref: ExplorerEntityRef) {
    return {
      onOpenSeguimientos: () => openPanel(ref, "seguimientos"),
      onOpenConceptos: () => openPanel(ref, "conceptos"),
    };
  }

  const selectedTemaRef: ExplorerEntityRef | null = selectedTema
    ? { kind: "tema", id: selectedTema.id, nombre: selectedTema.nombre }
    : null;
  const selectedCursoRef: ExplorerEntityRef | null = selectedCurso
    ? { kind: "curso", id: selectedCurso.id, nombre: selectedCurso.nombre }
    : null;
  const selectedClaseRef: ExplorerEntityRef | null = selectedClase
    ? { kind: "clase", id: selectedClase.id, nombre: selectedClase.nombre }
    : null;

  const actionHandlers = {
    onEdit: setEditEntity,
    onOpenPanel: openPanel,
  };

  const editTema =
    editEntity?.kind === "tema"
      ? (temas.find((t) => t.id === editEntity.id) ?? null)
      : null;
  const editCurso =
    editEntity?.kind === "curso"
      ? (cursos.find((c) => c.id === editEntity.id) ?? null)
      : null;
  const editClase =
    editEntity?.kind === "clase"
      ? (clases.find((cl) => cl.id === editEntity.id) ?? null)
      : null;

  useExploradorKeyboard({
    enabled: packReady && !modalsOpen,
    temas,
    cursos,
    clases,
    selection,
    onNavigate: go,
    onEdit: setEditEntity,
    onOpenPanel: openPanel,
  });

  return (
    <div className="desktop-explorador flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-[var(--td-faint)]">
          Seleccioná una card · acciones en la cabecera de cada columna · ↑↓
          navegar · ←→ columnas · E editar · S seguimientos · C conceptos
        </p>
        <EstudioSyncBanner />
      </div>
      {loading ? (
        <LoadingText>Cargando datos del estudio…</LoadingText>
      ) : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && packReady ? (
        <div className="mt-3 flex min-h-0 flex-1 gap-3 overflow-hidden bg-transparent p-0.5">
          <ExploradorColumn
            label="Temas"
            count={temas.length}
            emptyMessage="No hay temas. Usá + Tema en la cabecera."
            actions={[
              {
                label: "+ Tema",
                primary: true,
                onClick: () => setCreateKind("tema"),
              },
              ...entityActions(selectedTemaRef, actionHandlers),
            ]}
          >
            {temas.map((t) => {
              const ref: ExplorerEntityRef = {
                kind: "tema",
                id: t.id,
                nombre: t.nombre,
              };
              const counts = entityCounts(ref);
              return (
              <ExploradorColumnCard
                key={t.id}
                kind="tema"
                explorerId={t.id}
                nombre={t.nombre}
                derivados={t.derivados}
                descripcion={t.descripcion}
                fechaFin={t.fecha_estimada_fin}
                fechaParen={fechaParentesisTema(t)}
                hijosStats={cursosStatsPorTema.get(t.id)}
                hijosLabel="cursos"
                seguimientosCount={counts.seguimientos}
                conceptosCount={counts.conceptos}
                selected={selection.temaId === t.id}
                expanded={
                  selection.temaId === t.id &&
                  selection.cursoId == null &&
                  selection.claseId == null
                }
                onSelect={() =>
                  go(explorerHref({ temaId: t.id, cursoId: null, claseId: null }))
                }
                onDoubleClick={() => openPanel(ref, "seguimientos")}
                {...cardHandlers(ref)}
              />
            );
            })}
          </ExploradorColumn>

          <ExploradorColumn
            label="Cursos"
            count={cursos.length}
            emptyMessage={
              selection.temaId == null
                ? "Elegí un tema para ver sus cursos."
                : "Este tema no tiene cursos. Usá + Curso en la cabecera."
            }
            actions={[
              {
                label: "+ Curso",
                primary: true,
                disabled: selection.temaId == null,
                title:
                  selection.temaId == null
                    ? "Elegí un tema para crear un curso"
                    : "Nuevo curso en el tema seleccionado",
                onClick: () => setCreateKind("curso"),
              },
              ...entityActions(selectedCursoRef, actionHandlers),
            ]}
          >
            {cursos.map((c) => {
              const ref: ExplorerEntityRef = {
                kind: "curso",
                id: c.id,
                nombre: c.nombre,
              };
              const counts = entityCounts(ref);
              return (
              <ExploradorColumnCard
                key={c.id}
                kind="curso"
                explorerId={c.id}
                nombre={c.nombre}
                derivados={c.derivados}
                descripcion={c.descripcion}
                fechaFin={c.fecha_estimada_fin}
                fechaParen={fechaParentesisCurso(c)}
                hijosStats={clasesStatsPorCurso.get(c.id)}
                hijosLabel="clases"
                link={c.link}
                seguimientosCount={counts.seguimientos}
                conceptosCount={counts.conceptos}
                selected={selection.cursoId === c.id}
                expanded={
                  selection.cursoId === c.id && selection.claseId == null
                }
                onSelect={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: c.id,
                      claseId: null,
                    }),
                  )
                }
                onDoubleClick={() => openPanel(ref, "seguimientos")}
                {...cardHandlers(ref)}
              />
            );
            })}
          </ExploradorColumn>

          <ExploradorColumn
            label="Clases"
            count={clases.length}
            emptyMessage={
              selection.cursoId == null
                ? "Elegí un curso para ver sus clases."
                : "Este curso no tiene clases. Usá + Clase en la cabecera."
            }
            actions={[
              {
                label: "+ Clase",
                primary: true,
                disabled: selection.cursoId == null,
                title:
                  selection.cursoId == null
                    ? "Elegí un curso para crear una clase"
                    : "Nueva clase en el curso seleccionado",
                onClick: () => setCreateKind("clase"),
              },
              ...entityActions(selectedClaseRef, actionHandlers),
            ]}
          >
            {clases.map((cl) => {
              const ref: ExplorerEntityRef = {
                kind: "clase",
                id: cl.id,
                nombre: cl.nombre,
              };
              const counts = entityCounts(ref);
              return (
              <ExploradorColumnCard
                key={cl.id}
                kind="clase"
                explorerId={cl.id}
                nombre={cl.nombre}
                derivados={cl.derivados}
                descripcion={cl.descripcion}
                fechaFin={null}
                link={cl.link}
                dificultad={cl.dificultad}
                orden={cl.orden}
                seguimientosCount={counts.seguimientos}
                conceptosCount={counts.conceptos}
                selected={selection.claseId === cl.id}
                expanded={selection.claseId === cl.id}
                onSelect={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: selection.cursoId,
                      claseId: cl.id,
                    }),
                  )
                }
                onDoubleClick={() => openPanel(ref, "seguimientos")}
                {...cardHandlers(ref)}
              />
            );
            })}
          </ExploradorColumn>
        </div>
      ) : null}

      {panelModal ? (
        <ExploradorPanelModal
          entity={panelModal.entity}
          panel={panelModal.panel}
          onClose={() => setPanelModal(null)}
        />
      ) : null}

      {createKind ? (
        <ExploradorCreateModal
          kind={createKind}
          temaId={selection.temaId}
          cursoId={selection.cursoId}
          onClose={() => setCreateKind(null)}
          onCreated={onCreated}
        />
      ) : null}

      {editEntity ? (
        <ExploradorEditModal
          kind={editEntity.kind}
          tema={editTema}
          curso={editCurso}
          clase={editClase}
          onClose={() => setEditEntity(null)}
          onSaved={() => {}}
          onDeleted={onDeleted}
        />
      ) : null}
    </div>
  );
}
