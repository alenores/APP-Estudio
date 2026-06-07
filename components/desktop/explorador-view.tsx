"use client";

import {
  explorerHref,
  useEstudioExplorer,
  type ExplorerRootMode,
} from "@/app/hooks/useEstudioExplorer";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { useExploradorKeyboard } from "@/app/hooks/useExploradorKeyboard";
import {
  ExploradorCreateModal,
  type ExploradorCreateKind,
} from "@/components/desktop/explorador-create-modal";
import { ExploradorNodoCreateModal } from "@/components/desktop/explorador-nodo-create-modal";
import type { ExploradorColumnAction } from "@/components/desktop/explorador-columns";
import { ExploradorEditModal } from "@/components/desktop/explorador-edit-modal";
import { ExploradorPanelModal } from "@/components/desktop/explorador-panel-modal";
import {
  ExploradorSearchModal,
  type ExploradorSearchKind,
} from "@/components/desktop/explorador-search-modal";
import {
  ExploradorColumn,
  ExploradorColumnCard,
} from "@/components/desktop/explorador-columns";
import { EstudioSyncBanner } from "@/components/shared/sync/estudio-sync-banner";
import { AlertText, LoadingText } from "@/components/ui";
import { fechaParentesisCurso } from "@/lib/curso-card-fecha";
import { fechaParentesisTema } from "@/lib/tema-card-fecha";
import type {
  ClaseConDerivados,
  CursoConDerivados,
} from "@/app/types/estudio";
import type {
  ExplorerEntityRef,
  ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import { objetivoIdForCurso } from "@/lib/curso-nodo-objetivo";
import { parseObjetivoId } from "@/lib/objetivo-ui";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { getExplorerEntityRecords } from "@/lib/explorer-entity-panel";
import {
  EMPTY_EXPLORER_SELECTION,
  initExplorerSelectionFromLocation,
  parseExplorerHref,
  selectionsEqual,
  writeExplorerHref,
} from "@/lib/explorador-selection-state";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PanelModalState = {
  entity: ExplorerEntityRef;
  panel: ExplorerPanelKind;
};

function editColumnAction(
  entity: ExplorerEntityRef | null,
  onEdit: (entity: ExplorerEntityRef) => void,
): ExploradorColumnAction {
  return {
    label: "Editar",
    title: entity == null ? "Seleccioná un ítem" : `Editar ${entity.nombre}`,
    variant: "edit",
    disabled: entity == null,
    onClick: () => entity && onEdit(entity),
  };
}

export function ExploradorView() {
  const router = useRouter();
  const [activeSelection, setActiveSelection] = useState(
    EMPTY_EXPLORER_SELECTION,
  );
  const bootstrappedRef = useRef(false);
  const {
    temas,
    nodos,
    nodosById,
    cursos,
    clases,
    clasesStatsPorCurso,
    cursosStatsPorTema,
    cursosStatsPorNodo,
    selection,
    loading,
    error,
    packReady,
    reloadNodos,
  } = useEstudioExplorer(activeSelection);
  const { cacheData } = useEstudioData();
  const [panelModal, setPanelModal] = useState<PanelModalState | null>(null);
  const [createKind, setCreateKind] = useState<ExploradorCreateKind | null>(
    null,
  );
  const [creatingNodo, setCreatingNodo] = useState(false);
  const [editEntity, setEditEntity] = useState<ExplorerEntityRef | null>(null);
  const [searchKind, setSearchKind] = useState<ExploradorSearchKind | null>(
    null,
  );

  const modalsOpen =
    panelModal != null ||
    createKind != null ||
    creatingNodo ||
    editEntity != null ||
    searchKind != null;

  /** Montaje cliente: F5 limpia URL; entrada con ?tema= restaura selección. */
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    setActiveSelection(initExplorerSelectionFromLocation());
  }, []);

  /** Tras cargar cache, alinear estado si la URL tenía ids inválidos. */
  useEffect(() => {
    if (!packReady) return;
    if (selectionsEqual(activeSelection, selection)) return;
    setActiveSelection(selection);
    const href = explorerHref(selection);
    writeExplorerHref(href);
    router.replace(href, { scroll: false });
  }, [packReady, activeSelection, selection, router]);

  function go(href: string) {
    const next = parseExplorerHref(href);
    setActiveSelection(next);
    writeExplorerHref(href);
    router.replace(href, { scroll: false });
  }

  function switchRootMode(mode: ExplorerRootMode) {
    if (mode === selection.rootMode) return;
    go(
      explorerHref({
        rootMode: mode,
        temaId: mode === "temas" ? selection.temaId : null,
        nodoId: mode === "nodos" ? selection.nodoId : null,
        cursoId: null,
        claseId: null,
      }),
    );
  }

  function selectionHref(
    partial: Partial<typeof selection>,
  ): string {
    return explorerHref({ ...selection, ...partial });
  }

  function openPanel(entity: ExplorerEntityRef, panel: ExplorerPanelKind) {
    setPanelModal({ entity, panel });
  }

  function onCreated(partial: {
    temaId?: number;
    nodoId?: number;
    cursoId?: number;
    claseId?: number;
  }) {
    go(
      explorerHref({
        rootMode: selection.rootMode,
        temaId: partial.temaId ?? selection.temaId,
        nodoId: partial.nodoId ?? selection.nodoId,
        cursoId: partial.cursoId ?? null,
        claseId: partial.claseId ?? null,
      }),
    );
  }

  function onDeleted(cleared: {
    temaId?: null;
    nodoId?: null;
    cursoId?: null;
    claseId?: null;
  }) {
    go(
      explorerHref({
        rootMode: selection.rootMode,
        temaId: cleared.temaId !== undefined ? null : selection.temaId,
        nodoId: cleared.nodoId !== undefined ? null : selection.nodoId,
        cursoId: cleared.cursoId !== undefined ? null : selection.cursoId,
        claseId: cleared.claseId !== undefined ? null : selection.claseId,
      }),
    );
  }

  function openSearch(kind: ExploradorSearchKind) {
    setSearchKind(kind);
  }

  function onSearchCurso(curso: CursoConDerivados) {
    setSearchKind(null);
    go(
      explorerHref({
        rootMode: "temas",
        temaId: curso.tema_id,
        nodoId: null,
        cursoId: curso.id,
        claseId: null,
      }),
    );
  }

  function onSearchClase(clase: ClaseConDerivados) {
    const curso = cacheData?.cursos.find((c) => c.id === clase.curso_id);
    setSearchKind(null);
    go(
      explorerHref({
        rootMode: selection.rootMode,
        temaId: selection.rootMode === "temas" ? (curso?.tema_id ?? selection.temaId) : null,
        nodoId:
          selection.rootMode === "nodos"
            ? (curso?.nodo_id ?? selection.nodoId)
            : null,
        cursoId: clase.curso_id,
        claseId: clase.id,
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

  const rootParentSelected =
    selection.rootMode === "nodos"
      ? selection.nodoId != null
      : selection.temaId != null;

  const nodoDerivados = derivarDesdeSeguimientos([]);

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

  const selectedNodo =
    selection.nodoId != null
      ? (nodos.find((n) => n.id === selection.nodoId) ?? null)
      : null;

  const selectedTemaRef: ExplorerEntityRef | null = selectedTema
    ? { kind: "tema", id: selectedTema.id, nombre: selectedTema.nombre }
    : null;
  const selectedNodoRef: ExplorerEntityRef | null = selectedNodo
    ? { kind: "nodo", id: selectedNodo.id, nombre: selectedNodo.titulo }
    : null;
  const selectedCursoRef: ExplorerEntityRef | null = selectedCurso
    ? { kind: "curso", id: selectedCurso.id, nombre: selectedCurso.nombre }
    : null;
  const selectedClaseRef: ExplorerEntityRef | null = selectedClase
    ? { kind: "clase", id: selectedClase.id, nombre: selectedClase.nombre }
    : null;

  const actionHandlers = {
    onEdit: setEditEntity,
  };

  const editNodo =
    editEntity?.kind === "nodo"
      ? (nodos.find((n) => n.id === editEntity.id) ?? null)
      : null;

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
    rootMode: selection.rootMode,
    temas,
    nodos,
    cursos,
    clases,
    selection,
    onNavigate: go,
    onEdit: setEditEntity,
    onOpenPanel: openPanel,
  });

  return (
    <div className="desktop-explorador flex min-h-0 flex-1 flex-col overflow-hidden">
      <EstudioSyncBanner />
      {loading ? (
        <LoadingText>Cargando datos del estudio…</LoadingText>
      ) : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && packReady ? (
        <div className="explorer-columns-grid flex min-h-0 flex-1 gap-2 overflow-hidden bg-transparent">
          <ExploradorColumn
            columnKind="tema"
            label={selection.rootMode === "nodos" ? "Nodos objetivo" : "Temas"}
            count={
              selection.rootMode === "nodos" ? nodos.length : temas.length
            }
            emptyMessage={
              selection.rootMode === "nodos"
                ? "No hay nodos objetivo."
                : "No hay temas. Usá el botón + en la cabecera."
            }
            rootSwitch={{
              value: selection.rootMode === "nodos" ? "nodos" : "temas",
              onChange: (v) => switchRootMode(v === "nodos" ? "nodos" : "temas"),
            }}
            actions={
              selection.rootMode === "nodos"
                ? [
                    {
                      label: "Nuevo nodo o logro",
                      title: "Nuevo nodo o logro",
                      variant: "create",
                      onClick: () => setCreatingNodo(true),
                    },
                    editColumnAction(selectedNodoRef, actionHandlers.onEdit),
                  ]
                : [
                    {
                      label: "Nuevo tema",
                      title: "Nuevo tema",
                      variant: "create",
                      onClick: () => setCreateKind("tema"),
                    },
                    editColumnAction(selectedTemaRef, actionHandlers.onEdit),
                  ]
            }
          >
            {selection.rootMode === "nodos"
              ? nodos.map((n) => (
                  <ExploradorColumnCard
                    key={n.id}
                    kind="nodo"
                    explorerId={n.id}
                    nombre={n.titulo}
                    derivados={nodoDerivados}
                    descripcion={n.descripcion}
                    hijosStats={
                      n.tipo === "nodo"
                        ? cursosStatsPorNodo.get(n.id)
                        : undefined
                    }
                    hijosLabel="cursos"
                    nodoClasificacion={n.tipo}
                    objetivoId={parseObjetivoId(n.objetivo_id)}
                    selected={selection.nodoId === n.id}
                    expanded={
                      selection.nodoId === n.id &&
                      selection.cursoId == null &&
                      selection.claseId == null
                    }
                    onSelect={() =>
                      go(
                        explorerHref({
                          rootMode: "nodos",
                          nodoId: n.id,
                          cursoId: null,
                          claseId: null,
                        }),
                      )
                    }
                  />
                ))
              : temas.map((t) => {
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
                      fechaInicio={t.fecha_estimada_inicio}
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
                        go(
                          explorerHref({
                            rootMode: "temas",
                            temaId: t.id,
                            cursoId: null,
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
            columnKind="curso"
            label="Cursos"
            count={cursos.length}
            emptyMessage={
              !rootParentSelected
                ? selection.rootMode === "nodos"
                  ? "Elegí un nodo para ver sus cursos."
                  : "Elegí un tema para ver sus cursos."
                : selection.rootMode === "nodos"
                  ? selectedNodo?.tipo === "logro"
                    ? "Los logros no tienen cursos asociados."
                    : "Este nodo no tiene cursos."
                  : "Este tema no tiene cursos. Usá el botón + en la cabecera."
            }
            actions={[
              {
                label: "Buscar cursos",
                title: "Buscar en todos los cursos",
                variant: "search",
                onClick: () => openSearch("curso"),
              },
              {
                label: "Nuevo curso",
                title:
                  selection.rootMode !== "temas" || selection.temaId == null
                    ? "Elegí un tema (vista Temas) para crear un curso"
                    : "Nuevo curso en el tema seleccionado",
                variant: "create",
                disabled:
                  selection.rootMode !== "temas" || selection.temaId == null,
                onClick: () => setCreateKind("curso"),
              },
              editColumnAction(selectedCursoRef, actionHandlers.onEdit),
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
                fechaInicio={c.fecha_estimada_inicio}
                fechaFin={c.fecha_estimada_fin}
                fechaParen={fechaParentesisCurso(c)}
                hijosStats={clasesStatsPorCurso.get(c.id)}
                hijosLabel="clases"
                link={c.link}
                seguimientosCount={counts.seguimientos}
                conceptosCount={counts.conceptos}
                objetivoId={objetivoIdForCurso(c.nodo_id, nodosById)}
                selected={selection.cursoId === c.id}
                expanded={
                  selection.cursoId === c.id && selection.claseId == null
                }
                onSelect={() =>
                  go(
                    selectionHref({
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
            columnKind="clase"
            label="Clases"
            count={clases.length}
            emptyMessage={
              selection.cursoId == null
                ? "Elegí un curso para ver sus clases."
                : "Este curso no tiene clases. Usá el botón + en la cabecera."
            }
            actions={[
              {
                label: "Buscar clases",
                title: "Buscar en todas las clases",
                variant: "search",
                onClick: () => openSearch("clase"),
              },
              {
                label: "Nueva clase",
                title:
                  selection.cursoId == null
                    ? "Elegí un curso para crear una clase"
                    : "Nueva clase en el curso seleccionado",
                variant: "create",
                disabled: selection.cursoId == null,
                onClick: () => setCreateKind("clase"),
              },
              editColumnAction(selectedClaseRef, actionHandlers.onEdit),
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
                    selectionHref({
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
          nodoId={selection.nodoId}
          cursoId={selection.cursoId}
          temaNombre={selectedTema?.nombre ?? null}
          cursoNombre={selectedCurso?.nombre ?? null}
          onClose={() => setCreateKind(null)}
          onCreated={onCreated}
        />
      ) : null}

      {creatingNodo ? (
        <ExploradorNodoCreateModal
          onClose={() => setCreatingNodo(false)}
          onCreated={(nodoId) => {
            void reloadNodos();
            if (nodoId != null) {
              onCreated({ nodoId });
            }
          }}
        />
      ) : null}

      {editEntity ? (
        <ExploradorEditModal
          kind={editEntity.kind}
          tema={editTema}
          curso={editCurso}
          clase={editClase}
          nodo={editNodo}
          onClose={() => setEditEntity(null)}
          onSaved={() => void reloadNodos()}
          onDeleted={onDeleted}
        />
      ) : null}

      {searchKind && cacheData ? (
        <ExploradorSearchModal
          kind={searchKind}
          cacheData={cacheData}
          nodosById={nodosById}
          onClose={() => setSearchKind(null)}
          onSelectCurso={onSearchCurso}
          onSelectClase={onSearchClase}
        />
      ) : null}
    </div>
  );
}
