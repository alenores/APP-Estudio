"use client";

import {
  explorerHref,
  type ExplorerRootMode,
  type ExplorerSelection,
} from "@/app/hooks/useEstudioExplorer";
import type {
  ClaseConDerivados,
  CursoConDerivados,
  TemaConDerivados,
} from "@/app/types/estudio";
import type { MapaNodo } from "@/app/types/mapa";
import type {
  ExplorerEntityRef,
  ExplorerPanelKind,
} from "@/lib/explorer-entity-panel";
import { useCallback, useEffect, useRef } from "react";

export type ExplorerColumnKind = "temas" | "cursos" | "clases";

type ColumnItem = {
  id: number;
  nombre: string;
  kind: ExplorerEntityRef["kind"] | "nodo";
};

type UseExploradorKeyboardArgs = {
  enabled: boolean;
  rootMode: ExplorerRootMode;
  temas: TemaConDerivados[];
  nodos: MapaNodo[];
  cursos: CursoConDerivados[];
  clases: ClaseConDerivados[];
  selection: ExplorerSelection;
  onNavigate: (href: string) => void;
  onEdit: (entity: ExplorerEntityRef) => void;
  onOpenPanel: (entity: ExplorerEntityRef, panel: ExplorerPanelKind) => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function columnItems(
  column: ExplorerColumnKind,
  rootMode: ExplorerRootMode,
  temas: TemaConDerivados[],
  nodos: MapaNodo[],
  cursos: CursoConDerivados[],
  clases: ClaseConDerivados[],
): ColumnItem[] {
  switch (column) {
    case "temas":
      if (rootMode === "nodos") {
        return nodos.map((n) => ({
          id: n.id,
          nombre: n.titulo,
          kind: "nodo",
        }));
      }
      return temas.map((t) => ({ id: t.id, nombre: t.nombre, kind: "tema" }));
    case "cursos":
      return cursos.map((c) => ({ id: c.id, nombre: c.nombre, kind: "curso" }));
    case "clases":
      return clases.map((cl) => ({
        id: cl.id,
        nombre: cl.nombre,
        kind: "clase",
      }));
  }
}

function selectedIdInColumn(
  column: ExplorerColumnKind,
  rootMode: ExplorerRootMode,
  selection: ExplorerSelection,
): number | null {
  switch (column) {
    case "temas":
      return rootMode === "nodos" ? selection.nodoId : selection.temaId;
    case "cursos":
      return selection.cursoId;
    case "clases":
      return selection.claseId;
  }
}

function columnFromSelection(selection: ExplorerSelection): ExplorerColumnKind {
  if (selection.claseId != null) return "clases";
  if (selection.cursoId != null) return "cursos";
  return "temas";
}

function hrefForItem(
  item: ColumnItem,
  selection: ExplorerSelection,
): string {
  switch (item.kind) {
    case "tema":
      return explorerHref({
        rootMode: "temas",
        temaId: item.id,
        cursoId: null,
        claseId: null,
      });
    case "nodo":
      return explorerHref({
        rootMode: "nodos",
        nodoId: item.id,
        cursoId: null,
        claseId: null,
      });
    case "curso":
      return explorerHref({
        rootMode: selection.rootMode,
        temaId: selection.rootMode === "temas" ? selection.temaId : null,
        nodoId: selection.rootMode === "nodos" ? selection.nodoId : null,
        cursoId: item.id,
        claseId: null,
      });
    case "clase":
      return explorerHref({
        rootMode: selection.rootMode,
        temaId: selection.rootMode === "temas" ? selection.temaId : null,
        nodoId: selection.rootMode === "nodos" ? selection.nodoId : null,
        cursoId: selection.cursoId,
        claseId: item.id,
      });
  }
}

function scrollCardIntoView(id: number) {
  const el = document.querySelector(`[data-explorer-id="${id}"]`);
  el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

export function useExploradorKeyboard({
  enabled,
  rootMode,
  temas,
  nodos,
  cursos,
  clases,
  selection,
  onNavigate,
  onEdit,
  onOpenPanel,
}: UseExploradorKeyboardArgs) {
  const focusColumnRef = useRef<ExplorerColumnKind>(
    columnFromSelection(selection),
  );

  useEffect(() => {
    focusColumnRef.current = columnFromSelection(selection);
  }, [selection]);

  const navigateToItem = useCallback(
    (item: ColumnItem) => {
      onNavigate(hrefForItem(item, selection));
      scrollCardIntoView(item.id);
    },
    [onNavigate, selection],
  );

  const currentEntity = useCallback((): ExplorerEntityRef | null => {
    const column = focusColumnRef.current;
    const items = columnItems(
      column,
      rootMode,
      temas,
      nodos,
      cursos,
      clases,
    );
    if (items.length === 0) return null;
    const selectedId = selectedIdInColumn(column, rootMode, selection);
    const idx =
      selectedId != null
        ? items.findIndex((i) => i.id === selectedId)
        : -1;
    const item = idx >= 0 ? items[idx] : items[0];
    if (!item || item.kind === "nodo") return null;
    return item
      ? { kind: item.kind, id: item.id, nombre: item.nombre }
      : null;
  }, [rootMode, temas, nodos, cursos, clases, selection]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const column = focusColumnRef.current;
      const items = columnItems(
        column,
        rootMode,
        temas,
        nodos,
        cursos,
        clases,
      );

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (items.length === 0) return;
        e.preventDefault();
        const selectedId = selectedIdInColumn(column, rootMode, selection);
        let idx =
          selectedId != null
            ? items.findIndex((i) => i.id === selectedId)
            : -1;
        if (idx < 0) idx = 0;
        else if (e.key === "ArrowUp") idx = Math.max(0, idx - 1);
        else idx = Math.min(items.length - 1, idx + 1);
        navigateToItem(items[idx]!);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const order: ExplorerColumnKind[] = ["temas", "cursos", "clases"];
        let colIdx = order.indexOf(column);
        if (e.key === "ArrowLeft") colIdx = Math.max(0, colIdx - 1);
        else colIdx = Math.min(order.length - 1, colIdx + 1);
        const nextColumn = order[colIdx]!;
        focusColumnRef.current = nextColumn;
        const nextItems = columnItems(
          nextColumn,
          rootMode,
          temas,
          nodos,
          cursos,
          clases,
        );
        if (nextItems.length === 0) return;
        const selectedId = selectedIdInColumn(nextColumn, rootMode, selection);
        const item =
          selectedId != null
            ? (nextItems.find((i) => i.id === selectedId) ?? nextItems[0]!)
            : nextItems[0]!;
        navigateToItem(item);
        return;
      }

      const entity = currentEntity();
      if (!entity) return;

      if (e.key === "Enter") {
        e.preventDefault();
        navigateToItem({
          id: entity.id,
          nombre: entity.nombre,
          kind: entity.kind,
        });
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "e") {
        e.preventDefault();
        onEdit(entity);
        return;
      }
      if (key === "s") {
        e.preventDefault();
        onOpenPanel(entity, "seguimientos");
        return;
      }
      if (key === "c") {
        e.preventDefault();
        onOpenPanel(entity, "conceptos");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    enabled,
    rootMode,
    temas,
    nodos,
    cursos,
    clases,
    selection,
    navigateToItem,
    currentEntity,
    onEdit,
    onOpenPanel,
  ]);
}
