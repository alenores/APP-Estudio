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
import {
  ExploradorColumnStatChip,
  ExploradorColumnStatChips,
} from "@/components/desktop/explorador-column-stat-chips";
import { ExploradorTemaConceptosModal } from "@/components/desktop/explorador-tema-conceptos-modal";
import { ExploradorTemaSeguimientosModal } from "@/components/desktop/explorador-tema-seguimientos-modal";
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
import { combinarHijosStats } from "@/lib/combinar-hijos-stats";
import {
  nodoAceptaCursos,
  nodoAceptaLogrosRegistro,
} from "@/lib/mapa-nodo-tipo";
import { getExplorerEntityRecords } from "@/lib/explorer-entity-panel";
import {
  EMPTY_RECORDS_SCOPE_FILTERS,
  filterConceptosInScope,
  filterSeguimientosInScope,
  listConceptosInTemaScope,
  listSeguimientosInTemaScope,
  recordsFiltersFromExplorerSelection,
  type RecordsScopeFilters,
} from "@/lib/explorador-tema-records";
import {
  EMPTY_EXPLORER_SELECTION,
  initExplorerSelectionFromLocation,
  parseExplorerHref,
  selectionsEqual,
  writeExplorerHref,
} from "@/lib/explorador-selection-state";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type PanelModalState = {
  entity: ExplorerEntityRef;
  panel: ExplorerPanelKind;
};

type TemaRecordsModalKind = "conceptos" | "seguimientos";

type TemaRecordsModalState = {
  kind: TemaRecordsModalKind;
  initialFilters: Partial<RecordsScopeFilters>;
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
    logros,
    clases,
    clasesStatsPorCurso,
    cursosStatsPorTema,
    cursosStatsPorNodo,
    logrosStatsPorNodo,
    middleColumnMode,
    selection,
    loading,
    error,
    logrosError,
    loadingLogros,
    packReady,
    reloadNodos,
    reloadLogros,
    reloadLogrosCatalog,
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
  const [temaRecordsModal, setTemaRecordsModal] =
    useState<TemaRecordsModalState | null>(null);

  function openRecordsModal(kind: TemaRecordsModalKind) {
    setTemaRecordsModal({
      kind,
      initialFilters: recordsFiltersFromExplorerSelection(selection),
    });
  }

  const modalsOpen =
    panelModal != null ||
    createKind != null ||
    creatingNodo ||
    editEntity != null ||
    searchKind != null ||
    temaRecordsModal != null;

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
        logroId: null,
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
    logroId?: number;
    claseId?: number;
  }) {
    go(
      explorerHref({
        rootMode: selection.rootMode,
        temaId: partial.temaId ?? selection.temaId,
        nodoId: partial.nodoId ?? selection.nodoId,
        cursoId:
          partial.logroId != null
            ? null
            : partial.cursoId !== undefined
              ? partial.cursoId
              : selection.cursoId,
        logroId:
          partial.cursoId != null
            ? null
            : partial.logroId !== undefined
              ? partial.logroId
              : selection.logroId,
        claseId: partial.claseId ?? null,
      }),
    );
    if (partial.logroId != null) {
      void reloadLogros();
      void reloadLogrosCatalog();
    }
  }

  function onDeleted(cleared: {
    temaId?: null;
    nodoId?: null;
    cursoId?: null;
    logroId?: null;
    claseId?: null;
  }) {
    go(
      explorerHref({
        rootMode: selection.rootMode,
        temaId: cleared.temaId !== undefined ? null : selection.temaId,
        nodoId: cleared.nodoId !== undefined ? null : selection.nodoId,
        cursoId: cleared.cursoId !== undefined ? null : selection.cursoId,
        logroId: cleared.logroId !== undefined ? null : selection.logroId,
        claseId: cleared.claseId !== undefined ? null : selection.claseId,
      }),
    );
    if (cleared.logroId !== undefined) {
      void reloadLogros();
      void reloadLogrosCatalog();
    }
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
        logroId: null,
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

  const selectedNodo =
    selection.nodoId != null
      ? (nodos.find((n) => n.id === selection.nodoId) ?? null)
      : null;

  const selectedLogro =
    selection.logroId != null
      ? (logros.find((l) => l.id === selection.logroId) ?? null)
      : null;

  const rootParentSelected =
    selection.rootMode === "nodos"
      ? selection.nodoId != null
      : selection.temaId != null;

  const canCreateCurso =
    (selection.rootMode === "temas" && selection.temaId != null) ||
    (selection.rootMode === "nodos" &&
      selection.nodoId != null &&
      selectedNodo != null &&
      nodoAceptaCursos(selectedNodo.tipo));

  const canCreateLogro =
    selection.rootMode === "nodos" &&
    selection.nodoId != null &&
    selectedNodo != null &&
    nodoAceptaLogrosRegistro(selectedNodo.tipo);

  const noClasesColumn =
    middleColumnMode === "logros" || selection.logroId != null;

  const middleColumnLabel =
    middleColumnMode === "mixto"
      ? "Cursos y logros"
      : middleColumnMode === "logros"
        ? "Logros"
        : "Cursos";

  const middleColumnCount =
    middleColumnMode === "mixto"
      ? cursos.length + logros.length
      : middleColumnMode === "logros"
        ? logros.length
        : cursos.length;

  const showTemaRecordChips =
    selection.rootMode === "temas" &&
    selection.temaId != null &&
    middleColumnMode === "cursos";

  const showCursoRecordChips =
    selection.rootMode === "temas" &&
    selection.cursoId != null &&
    !noClasesColumn;

  const temaScopeCounts = useMemo(() => {
    if (!cacheData || selection.temaId == null) {
      return { conceptos: 0, seguimientos: 0 };
    }
    return {
      conceptos: listConceptosInTemaScope(cacheData, selection.temaId).length,
      seguimientos: listSeguimientosInTemaScope(cacheData, selection.temaId)
        .length,
    };
  }, [cacheData, selection.temaId]);

  const cursoScopeCounts = useMemo(() => {
    if (!cacheData || selection.cursoId == null) {
      return { conceptos: 0, seguimientos: 0 };
    }
    const filters = {
      ...EMPTY_RECORDS_SCOPE_FILTERS,
      cursoId: selection.cursoId,
    };
    return {
      conceptos: filterConceptosInScope(cacheData, filters).length,
      seguimientos: filterSeguimientosInScope(cacheData, filters).length,
    };
  }, [cacheData, selection.cursoId]);

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

  const selectedLogroRef: ExplorerEntityRef | null = selectedLogro
    ? { kind: "logro", id: selectedLogro.id, nombre: selectedLogro.nombre }
    : null;

  const editLogro =
    editEntity?.kind === "logro"
      ? (logros.find((l) => l.id === editEntity.id) ?? null)
      : null;

  useExploradorKeyboard({
    enabled: packReady && !modalsOpen,
    rootMode: selection.rootMode,
    middleColumnMode,
    temas,
    nodos,
    cursos,
    logros,
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
      {logrosError ? <AlertText>{logrosError}</AlertText> : null}
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
            helpSectionId={
              selection.rootMode === "nodos" ? "nodos-objetivo" : "temas"
            }
            actions={
              selection.rootMode === "nodos"
                ? [
                    {
                      label: "Nuevo nodo objetivo",
                      title: "Nuevo nodo de formación o producción",
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
                      n.tipo === "formacion"
                        ? combinarHijosStats(
                            cursosStatsPorNodo.get(n.id),
                            logrosStatsPorNodo.get(n.id),
                          )
                        : logrosStatsPorNodo.get(n.id)
                    }
                    hijosLabel={
                      n.tipo === "formacion"
                        ? "hijos"
                        : n.tipo === "produccion"
                          ? "logros"
                          : "cursos"
                    }
                    nodoClasificacion={n.tipo}
                    linkChat={n.link_chat}
                    objetivoId={parseObjetivoId(n.objetivo_id)}
                    selected={selection.nodoId === n.id}
                    expanded={
                      selection.nodoId === n.id &&
                      selection.cursoId == null &&
                      selection.logroId == null &&
                      selection.claseId == null
                    }
                    onSelect={() =>
                      go(
                        explorerHref({
                          rootMode: "nodos",
                          nodoId: n.id,
                          cursoId: null,
                          logroId: null,
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
                      linkChat={t.link_chat}
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
            label={middleColumnLabel}
            count={middleColumnCount}
            helpSectionId={
              middleColumnMode !== "logros" ? "cursos" : undefined
            }
            headerExtra={
              showTemaRecordChips ? (
                <ExploradorColumnStatChips>
                  <ExploradorColumnStatChip
                    label="Conceptos"
                    count={temaScopeCounts.conceptos}
                    title="Ver conceptos (listado general)"
                    onOpen={() => openRecordsModal("conceptos")}
                  />
                  <ExploradorColumnStatChip
                    label="Seguimientos"
                    count={temaScopeCounts.seguimientos}
                    title="Ver seguimientos (listado general)"
                    tone="seguimiento"
                    onOpen={() => openRecordsModal("seguimientos")}
                  />
                </ExploradorColumnStatChips>
              ) : undefined
            }
            emptyMessage={
              !rootParentSelected
                ? selection.rootMode === "nodos"
                  ? middleColumnMode === "logros"
                    ? "Elegí un nodo de producción para ver sus logros."
                    : "Elegí un nodo para ver sus hijos."
                  : "Elegí un tema para ver sus cursos."
                : middleColumnMode === "mixto"
                  ? "Este nodo no tiene cursos ni logros. Usá + en la cabecera."
                  : middleColumnMode === "logros"
                    ? "Este nodo no tiene logros. Usá el botón + en la cabecera."
                    : selection.rootMode === "nodos"
                      ? "Este nodo no tiene cursos. Usá el botón + en la cabecera."
                      : "Este tema no tiene cursos. Usá el botón + en la cabecera."
            }
            actions={[
              ...(middleColumnMode === "cursos"
                ? [
                    {
                      label: "Buscar cursos",
                      title: "Buscar en todos los cursos",
                      variant: "search" as const,
                      onClick: () => openSearch("curso"),
                    },
                  ]
                : []),
              ...(canCreateCurso
                ? [
                    {
                      label: "Nuevo curso",
                      title:
                        selection.nodoId == null && selection.temaId == null
                          ? "Elegí un tema o nodo de formación"
                          : "Nuevo curso",
                      variant: "create" as const,
                      onClick: () => setCreateKind("curso"),
                    },
                  ]
                : []),
              ...(canCreateLogro
                ? [
                    {
                      label: "Nuevo logro",
                      title:
                        selection.nodoId == null
                          ? "Elegí un nodo objetivo"
                          : "Nuevo registro logro",
                      variant: "create" as const,
                      onClick: () => setCreateKind("logro"),
                    },
                  ]
                : []),
              editColumnAction(
                selection.logroId != null
                  ? selectedLogroRef
                  : selectedCursoRef,
                actionHandlers.onEdit,
              ),
            ]}
          >
            {middleColumnMode === "logros" ? (
              loadingLogros ? (
                <LoadingText>Cargando logros…</LoadingText>
              ) : (
                logros.map((l) => (
                  <ExploradorColumnCard
                    key={`logro-${l.id}`}
                    kind="logro"
                    explorerId={l.id}
                    nombre={l.nombre}
                    derivados={nodoDerivados}
                    descripcion={l.descripcion}
                    selected={selection.logroId === l.id}
                    expanded={selection.logroId === l.id}
                    onSelect={() =>
                      go(
                        selectionHref({
                          cursoId: null,
                          logroId: l.id,
                          claseId: null,
                        }),
                      )
                    }
                  />
                ))
              )
            ) : middleColumnMode === "mixto" ? (
              loadingLogros ? (
                <LoadingText>Cargando hijos…</LoadingText>
              ) : (
                <>
                  {cursos.map((c) => {
                    const ref: ExplorerEntityRef = {
                      kind: "curso",
                      id: c.id,
                      nombre: c.nombre,
                    };
                    const counts = entityCounts(ref);
                    return (
                      <ExploradorColumnCard
                        key={`curso-${c.id}`}
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
                        linkChat={c.link_chat}
                        tipoEstudio={c.tipo_estudio}
                        seguimientosCount={counts.seguimientos}
                        conceptosCount={counts.conceptos}
                        objetivoId={objetivoIdForCurso(c.nodo_id, nodosById)}
                        selected={selection.cursoId === c.id}
                        expanded={
                          selection.cursoId === c.id &&
                          selection.claseId == null
                        }
                        onSelect={() =>
                          go(
                            selectionHref({
                              cursoId: c.id,
                              logroId: null,
                              claseId: null,
                            }),
                          )
                        }
                        onDoubleClick={() => openPanel(ref, "seguimientos")}
                        {...cardHandlers(ref)}
                      />
                    );
                  })}
                  {logros.map((l) => (
                    <ExploradorColumnCard
                      key={`logro-${l.id}`}
                      kind="logro"
                      explorerId={l.id}
                      nombre={l.nombre}
                      derivados={nodoDerivados}
                      descripcion={l.descripcion}
                      selected={selection.logroId === l.id}
                      expanded={selection.logroId === l.id}
                      onSelect={() =>
                        go(
                          selectionHref({
                            cursoId: null,
                            logroId: l.id,
                            claseId: null,
                          }),
                        )
                      }
                    />
                  ))}
                </>
              )
            ) : (
              cursos.map((c) => {
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
                linkChat={c.link_chat}
                tipoEstudio={c.tipo_estudio}
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
              })
            )}
          </ExploradorColumn>

          <ExploradorColumn
            columnKind="clase"
            label="Clases"
            count={noClasesColumn ? 0 : clases.length}
            helpSectionId="clases"
            headerExtra={
              showCursoRecordChips ? (
                <ExploradorColumnStatChips>
                  <ExploradorColumnStatChip
                    label="Conceptos"
                    count={cursoScopeCounts.conceptos}
                    title="Ver conceptos (listado general)"
                    onOpen={() => openRecordsModal("conceptos")}
                  />
                  <ExploradorColumnStatChip
                    label="Seguimientos"
                    count={cursoScopeCounts.seguimientos}
                    title="Ver seguimientos (listado general)"
                    tone="seguimiento"
                    onOpen={() => openRecordsModal("seguimientos")}
                  />
                </ExploradorColumnStatChips>
              ) : undefined
            }
            emptyMessage={
              noClasesColumn
                ? "Los registros logro no tienen clases."
                : selection.cursoId == null
                  ? "Elegí un curso para ver sus clases."
                  : "Este curso no tiene clases. Usá el botón + en la cabecera."
            }
            actions={[
              ...(noClasesColumn
                ? []
                : [
                    {
                      label: "Buscar clases",
                      title: "Buscar en todas las clases",
                      variant: "search" as const,
                      onClick: () => openSearch("clase"),
                    },
                  ]),
              {
                label: "Nueva clase",
                title: noClasesColumn
                  ? "Elegí un curso para crear una clase"
                  : selection.cursoId == null
                    ? "Elegí un curso para crear una clase"
                    : "Nueva clase en el curso seleccionado",
                variant: "create",
                disabled: noClasesColumn || selection.cursoId == null,
                onClick: () => setCreateKind("clase"),
              },
              editColumnAction(
                noClasesColumn ? null : selectedClaseRef,
                actionHandlers.onEdit,
              ),
            ]}
          >
            {noClasesColumn
              ? null
              : clases.map((cl) => {
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
                linkChat={cl.link_chat}
                tipoEstudio={cl.tipo_estudio}
                dificultad={cl.dificultad}
                hideClaseOrdenLine
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
          nodoNombre={selectedNodo?.titulo ?? null}
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
          logro={editLogro}
          onClose={() => setEditEntity(null)}
          onSaved={() => {
            void reloadNodos();
            void reloadLogros();
            void reloadLogrosCatalog();
          }}
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

      {temaRecordsModal && cacheData ? (
        temaRecordsModal.kind === "conceptos" ? (
          <ExploradorTemaConceptosModal
            cacheData={cacheData}
            initialFilters={temaRecordsModal.initialFilters}
            onClose={() => setTemaRecordsModal(null)}
          />
        ) : (
          <ExploradorTemaSeguimientosModal
            cacheData={cacheData}
            initialFilters={temaRecordsModal.initialFilters}
            onClose={() => setTemaRecordsModal(null)}
          />
        )
      ) : null}
    </div>
  );
}
