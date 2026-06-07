"use client";

import {
  useEstudioExplorer,
  type ExplorerSelection,
} from "@/app/hooks/useEstudioExplorer";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import { ExploradorEditModal } from "@/components/desktop/explorador-edit-modal";
import { ExploradorPanelModal } from "@/components/desktop/explorador-panel-modal";
import { ExploradorColumnCard } from "@/components/desktop/explorador-columns";
import { AlertText, LoadingText } from "@/components/ui";
import { combinarHijosStats } from "@/lib/combinar-hijos-stats";
import {
  getExplorerEntityRecords,
  type ExplorerEntityRef,
  type ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import type { MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { parseObjetivoId } from "@/lib/objetivo-ui";
import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { fechaParentesisTema } from "@/lib/tema-card-fecha";
import { useMemo, useState } from "react";

type MapaDetalleParentPanelProps = {
  scope: MapaDetalleScope;
  onCreateHijo: () => void;
  /** Si se elimina el registro padre desde Editar. */
  onParentDeleted?: () => void;
};

function nuevoHijoButtonLabel(scope: MapaDetalleScope): string {
  if (scope.kind === "tema") return "Nuevo curso";
  if (scope.childKind === "logro") return "Nuevo logro";
  if (scope.childKind === "mixto") return "Nuevo curso o logro";
  return "Nuevo curso";
}

/** Panel izquierdo del overlay detalle — card expandida sin contenedor de columna. */
export function MapaDetalleParentPanel({
  scope,
  onCreateHijo,
  onParentDeleted,
}: MapaDetalleParentPanelProps) {
  const selection = useMemo((): ExplorerSelection => {
    if (scope.kind === "tema") {
      return {
        rootMode: "temas",
        temaId: scope.temaId,
        nodoId: null,
        cursoId: null,
        logroId: null,
        claseId: null,
      };
    }
    return {
      rootMode: "nodos",
      temaId: null,
      nodoId: scope.nodoId,
      cursoId: null,
      logroId: null,
      claseId: null,
    };
  }, [scope]);

  const {
    temas,
    nodos,
    cursosStatsPorTema,
    cursosStatsPorNodo,
    logrosStatsPorNodo,
    loading,
    error,
    reloadNodos,
    reloadLogros,
    reloadLogrosCatalog,
  } = useEstudioExplorer(selection);

  const { cacheData, refreshSnapshot } = useEstudioData();
  const [panelModal, setPanelModal] = useState<{
    entity: ExplorerEntityRef;
    panel: ExplorerPanelKind;
  } | null>(null);
  const [editing, setEditing] = useState(false);

  const nodoDerivados = derivarDesdeSeguimientos([]);

  const tema =
    scope.kind === "tema"
      ? (temas.find((t) => t.id === scope.temaId) ?? null)
      : null;
  const nodo =
    scope.kind === "nodo"
      ? (nodos.find((n) => n.id === scope.nodoId) ?? null)
      : null;

  const entityRef: ExplorerEntityRef | null = tema
    ? { kind: "tema", id: tema.id, nombre: tema.nombre }
    : nodo
      ? { kind: "nodo", id: nodo.id, nombre: nodo.titulo }
      : null;

  const counts = useMemo(() => {
    if (!cacheData || !entityRef || entityRef.kind !== "tema") {
      return { seguimientos: 0, conceptos: 0 };
    }
    const records = getExplorerEntityRecords(cacheData, entityRef);
    return {
      seguimientos: records.seguimientos.length,
      conceptos: records.conceptos.length,
    };
  }, [cacheData, entityRef]);

  function openPanel(panel: ExplorerPanelKind) {
    if (!entityRef || entityRef.kind !== "tema") return;
    setPanelModal({ entity: entityRef, panel });
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <LoadingText>Cargando detalle…</LoadingText>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <AlertText>{error}</AlertText>
      </div>
    );
  }

  if (scope.kind === "tema" && !tema) {
    return (
      <div className="p-3">
        <AlertText>No se encontró el tema.</AlertText>
      </div>
    );
  }

  if (scope.kind === "nodo" && !nodo) {
    return (
      <div className="p-3">
        <AlertText>No se encontró el nodo.</AlertText>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mapa-detalle-parent-scroll min-h-0 flex-1 overflow-y-auto px-1 pb-2 pt-1">
        {tema ? (
          <ExploradorColumnCard
            kind="tema"
            explorerId={tema.id}
            nombre={tema.nombre}
            derivados={tema.derivados}
            descripcion={tema.descripcion}
            fechaInicio={tema.fecha_estimada_inicio}
            fechaFin={tema.fecha_estimada_fin}
            fechaParen={fechaParentesisTema(tema)}
            hijosStats={cursosStatsPorTema.get(tema.id)}
            hijosLabel="cursos"
            seguimientosCount={counts.seguimientos}
            conceptosCount={counts.conceptos}
            selected
            expanded
            expandedLayout="comfortable"
            onSelect={() => {}}
            onOpenSeguimientos={() => openPanel("seguimientos")}
            onOpenConceptos={() => openPanel("conceptos")}
          />
        ) : null}
        {nodo ? (
          <ExploradorColumnCard
            kind="nodo"
            explorerId={nodo.id}
            nombre={nodo.titulo}
            derivados={nodoDerivados}
            descripcion={nodo.descripcion}
            hijosStats={
              nodo.tipo === "formacion"
                ? combinarHijosStats(
                    cursosStatsPorNodo.get(nodo.id),
                    logrosStatsPorNodo.get(nodo.id),
                  )
                : logrosStatsPorNodo.get(nodo.id)
            }
            hijosLabel={
              nodo.tipo === "formacion"
                ? "hijos"
                : nodo.tipo === "produccion"
                  ? "logros"
                  : "cursos"
            }
            nodoClasificacion={nodo.tipo}
            objetivoId={parseObjetivoId(nodo.objetivo_id)}
            selected
            expanded
            expandedLayout="comfortable"
            onSelect={() => {}}
          />
        ) : null}
      </div>

      <footer className="mapa-detalle-parent-footer shrink-0 border-t border-[var(--td-line)] bg-[var(--td-line-soft)]/35 px-2 py-2.5">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onCreateHijo}
            className="w-full rounded-xl bg-[var(--td-navy)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-[transform,background-color] duration-150 hover:bg-[var(--td-navy-2)] active:scale-[0.98]"
          >
            {nuevoHijoButtonLabel(scope)}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={entityRef == null}
            className="w-full rounded-xl border border-[var(--td-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--td-navy)] transition-[transform,background-color] duration-150 hover:bg-[var(--td-line-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Editar {scope.kind === "tema" ? "tema" : "nodo"}
          </button>
        </div>
      </footer>

      {panelModal ? (
        <ExploradorPanelModal
          entity={panelModal.entity}
          panel={panelModal.panel}
          onClose={() => setPanelModal(null)}
        />
      ) : null}

      {editing && entityRef ? (
        <ExploradorEditModal
          kind={entityRef.kind}
          tema={tema}
          curso={null}
          clase={null}
          nodo={nodo}
          logro={null}
          onClose={() => setEditing(false)}
          onSaved={() => {
            void refreshSnapshot();
            void reloadNodos();
            void reloadLogros();
            void reloadLogrosCatalog();
            setEditing(false);
          }}
          onDeleted={(cleared) => {
            setEditing(false);
            if (
              (cleared.temaId != null && scope.kind === "tema") ||
              (cleared.nodoId != null && scope.kind === "nodo")
            ) {
              onParentDeleted?.();
            }
          }}
        />
      ) : null}
    </div>
  );
}
