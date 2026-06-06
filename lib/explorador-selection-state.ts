import {
  parseExplorerSelection,
  type ExplorerSelection,
} from "@/app/hooks/useEstudioExplorer";

export const EMPTY_EXPLORER_SELECTION: ExplorerSelection = {
  temaId: null,
  cursoId: null,
  claseId: null,
};

export function isBrowserReload(): boolean {
  if (typeof window === "undefined") return false;
  const entry = performance.getEntriesByType("navigation")[0];
  return (
    entry != null &&
    "type" in entry &&
    (entry as PerformanceNavigationTiming).type === "reload"
  );
}

/** Selección inicial en cliente: F5 → vacía y URL limpia; navegación normal → query actual. */
export function initExplorerSelectionFromLocation(): ExplorerSelection {
  if (typeof window === "undefined") return EMPTY_EXPLORER_SELECTION;

  if (isBrowserReload()) {
    if (window.location.search) {
      window.history.replaceState(window.history.state, "", "/explorador");
    }
    return EMPTY_EXPLORER_SELECTION;
  }

  return parseExplorerSelection(new URLSearchParams(window.location.search));
}

export function parseExplorerHref(href: string): ExplorerSelection {
  const url = new URL(href, window.location.origin);
  return parseExplorerSelection(url.searchParams);
}

export function writeExplorerHref(href: string): void {
  window.history.replaceState(window.history.state, "", href);
}

export function selectionsEqual(
  a: ExplorerSelection,
  b: ExplorerSelection,
): boolean {
  return (
    a.temaId === b.temaId &&
    a.cursoId === b.cursoId &&
    a.claseId === b.claseId
  );
}
