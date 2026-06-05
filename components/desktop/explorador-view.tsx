"use client";

import {
  explorerHref,
  parseExplorerSelection,
  useEstudioExplorer,
} from "@/app/hooks/useEstudioExplorer";
import { ExploradorPanelModal } from "@/components/desktop/explorador-panel-modal";
import { EstudioSyncBanner } from "@/components/study/estudio-sync-banner";
import { AlertText, LoadingText } from "@/components/study/form-field";
import {
  ExploradorColumn,
  ExploradorColumnCard,
} from "@/components/desktop/explorador-columns";
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
  const { temas, cursos, clases, selection, loading, error, packReady } =
    useEstudioExplorer(rawSelection);
  const [panelModal, setPanelModal] = useState<PanelModalState | null>(null);

  function go(href: string) {
    router.replace(href);
  }

  function openPanel(entity: ExplorerEntityRef, panel: ExplorerPanelKind) {
    setPanelModal({ entity, panel });
  }

  return (
    <div className="desktop-explorador flex min-h-0 flex-1 flex-col">
      <EstudioSyncBanner />
      {loading ? (
        <LoadingText>Cargando datos del estudio…</LoadingText>
      ) : null}
      {error ? <AlertText>{error}</AlertText> : null}
      {!loading && packReady ? (
        <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--td-line)] bg-[var(--td-zone)] shadow-[var(--td-shadow)]">
          <ExploradorColumn
            label="Temas"
            count={temas.length}
            emptyMessage="No hay temas. Creá el primero desde la app en el celular."
          >
            {temas.map((t) => (
              <ExploradorColumnCard
                key={t.id}
                title={t.nombre}
                subtitle={t.descripcion}
                estado={t.derivados.etiqueta_estado}
                selected={selection.temaId === t.id}
                onSelect={() =>
                  go(explorerHref({ temaId: t.id, cursoId: null, claseId: null }))
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
                : "Este tema no tiene cursos."
            }
          >
            {cursos.map((c) => (
              <ExploradorColumnCard
                key={c.id}
                title={c.nombre}
                subtitle={c.descripcion}
                estado={c.derivados.etiqueta_estado}
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
                : "Este curso no tiene clases."
            }
          >
            {clases.map((cl) => (
              <ExploradorColumnCard
                key={cl.id}
                title={cl.nombre}
                subtitle={cl.descripcion}
                estado={cl.derivados.etiqueta_estado}
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
    </div>
  );
}
