"use client";

import {
  explorerHref,
  parseExplorerSelection,
  useEstudioExplorer,
} from "@/app/hooks/useEstudioExplorer";
import { useExploradorKeyboard } from "@/app/hooks/useExploradorKeyboard";
import {
  ExploradorCreateModal,
  type ExploradorCreateKind,
} from "@/components/desktop/explorador-create-modal";
import { ExploradorEditModal } from "@/components/desktop/explorador-edit-modal";
import { ExploradorPanelModal } from "@/components/desktop/explorador-panel-modal";
import { ExploradorToolbar } from "@/components/desktop/explorador-toolbar";
import { EstudioSyncBanner } from "@/components/study/estudio-sync-banner";
import { AlertText, LoadingText } from "@/components/study/form-field";
import {
  ExploradorColumn,
  ExploradorColumnCard,
} from "@/components/desktop/explorador-columns";
import { explorerCardMetaLines } from "@/lib/explorer-card-meta";
import type {
  ExplorerEntityRef,
  ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PanelModalState = {
  entity: ExplorerEntityRef;
  panel: ExplorerPanelKind;
};

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
    selection,
    loading,
    error,
    packReady,
  } = useEstudioExplorer(rawSelection);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--td-faint)]">
            ↑↓ navegar · ←→ columnas · Enter seleccionar · E editar · S seguimientos · C conceptos
          </p>
          <ExploradorToolbar
            temaId={selection.temaId}
            cursoId={selection.cursoId}
            onCreate={setCreateKind}
          />
        </div>
        <EstudioSyncBanner />
      </div>
      {loading ? (
        <LoadingText>Cargando datos del estudio…</LoadingText>
      ) : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && packReady ? (
        <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]">
          <ExploradorColumn
            label="Temas"
            count={temas.length}
            emptyMessage="No hay temas. Usá + Tema arriba a la derecha."
          >
            {temas.map((t) => (
              <ExploradorColumnCard
                key={t.id}
                explorerId={t.id}
                title={t.nombre}
                subtitle={t.descripcion}
                estado={t.derivados.etiqueta_estado}
                metaLines={explorerCardMetaLines({ derivados: t.derivados })}
                selected={selection.temaId === t.id}
                onSelect={() =>
                  go(explorerHref({ temaId: t.id, cursoId: null, claseId: null }))
                }
                onEdit={() =>
                  setEditEntity({
                    kind: "tema",
                    id: t.id,
                    nombre: t.nombre,
                  })
                }
                onOpenSeguimientos={() =>
                  openPanel(
                    { kind: "tema", id: t.id, nombre: t.nombre },
                    "seguimientos",
                  )
                }
                onOpenConceptos={() =>
                  openPanel(
                    { kind: "tema", id: t.id, nombre: t.nombre },
                    "conceptos",
                  )
                }
              />
            ))}
          </ExploradorColumn>

          <ExploradorColumn
            label="Cursos"
            count={cursos.length}
            emptyMessage={
              selection.temaId == null
                ? "Elegí un tema para ver sus cursos."
                : "Este tema no tiene cursos. Usá + Curso."
            }
          >
            {cursos.map((c) => (
              <ExploradorColumnCard
                key={c.id}
                explorerId={c.id}
                title={c.nombre}
                subtitle={c.descripcion}
                estado={c.derivados.etiqueta_estado}
                metaLines={explorerCardMetaLines({
                  derivados: c.derivados,
                  clasesStats: clasesStatsPorCurso.get(c.id),
                })}
                selected={selection.cursoId === c.id}
                onSelect={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: c.id,
                      claseId: null,
                    }),
                  )
                }
                onEdit={() =>
                  setEditEntity({
                    kind: "curso",
                    id: c.id,
                    nombre: c.nombre,
                  })
                }
                onOpenSeguimientos={() =>
                  openPanel(
                    { kind: "curso", id: c.id, nombre: c.nombre },
                    "seguimientos",
                  )
                }
                onOpenConceptos={() =>
                  openPanel(
                    { kind: "curso", id: c.id, nombre: c.nombre },
                    "conceptos",
                  )
                }
              />
            ))}
          </ExploradorColumn>

          <ExploradorColumn
            label="Clases"
            count={clases.length}
            emptyMessage={
              selection.cursoId == null
                ? "Elegí un curso para ver sus clases."
                : "Este curso no tiene clases. Usá + Clase."
            }
          >
            {clases.map((cl) => (
              <ExploradorColumnCard
                key={cl.id}
                explorerId={cl.id}
                title={cl.nombre}
                subtitle={cl.descripcion}
                estado={cl.derivados.etiqueta_estado}
                metaLines={explorerCardMetaLines({ derivados: cl.derivados })}
                selected={selection.claseId === cl.id}
                onSelect={() =>
                  go(
                    explorerHref({
                      temaId: selection.temaId,
                      cursoId: selection.cursoId,
                      claseId: cl.id,
                    }),
                  )
                }
                onEdit={() =>
                  setEditEntity({
                    kind: "clase",
                    id: cl.id,
                    nombre: cl.nombre,
                  })
                }
                onOpenSeguimientos={() =>
                  openPanel(
                    { kind: "clase", id: cl.id, nombre: cl.nombre },
                    "seguimientos",
                  )
                }
                onOpenConceptos={() =>
                  openPanel(
                    { kind: "clase", id: cl.id, nombre: cl.nombre },
                    "conceptos",
                  )
                }
                footer={
                  cl.dificultad ? `Dificultad: ${cl.dificultad}` : undefined
                }
              />
            ))}
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
