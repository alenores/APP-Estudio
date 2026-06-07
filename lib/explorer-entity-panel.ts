import type { Concepto, Seguimiento } from "@/app/types/estudio";
import type { EstudioOfflineCacheData } from "@/lib/estudio-offline-cache";
import {
  getClaseDetalleFromCache,
  getCursoDetalleFromCache,
  getTemaDetalleFromCache,
} from "@/lib/estudio-offline-read";
import type { ConceptoParent, SeguimientoParent } from "@/lib/form-parent-types";

export type ExplorerEntityKind = "tema" | "curso" | "clase" | "nodo";

export type ExplorerEntityRef = {
  kind: ExplorerEntityKind;
  id: number;
  nombre: string;
};

export type ExplorerPanelKind = "seguimientos" | "conceptos";

export function explorerEntityLabel(kind: ExplorerEntityKind): string {
  switch (kind) {
    case "tema":
      return "Tema";
    case "curso":
      return "Curso";
    case "clase":
      return "Clase";
    case "nodo":
      return "Nodo";
  }
}

export function seguimientoParentFromEntity(
  ref: ExplorerEntityRef,
): SeguimientoParent {
  switch (ref.kind) {
    case "tema":
      return { temaId: ref.id };
    case "curso":
      return { cursoId: ref.id };
    case "clase":
      return { claseId: ref.id };
    case "nodo":
      throw new Error("Seguimiento no aplica a nodos objetivo");
  }
}

export function conceptoParentFromEntity(
  ref: ExplorerEntityRef,
): ConceptoParent {
  switch (ref.kind) {
    case "tema":
      return { temaId: ref.id };
    case "curso":
      return { cursoId: ref.id };
    case "clase":
      return { claseId: ref.id };
    case "nodo":
      throw new Error("Concepto no aplica a nodos objetivo");
  }
}

export function getExplorerEntityRecords(
  cache: EstudioOfflineCacheData,
  ref: ExplorerEntityRef,
): { seguimientos: Seguimiento[]; conceptos: Concepto[] } {
  switch (ref.kind) {
    case "tema": {
      const d = getTemaDetalleFromCache(cache, ref.id);
      return { seguimientos: d.seguimientos, conceptos: d.conceptos };
    }
    case "curso": {
      const d = getCursoDetalleFromCache(cache, ref.id);
      return { seguimientos: d.seguimientos, conceptos: d.conceptos };
    }
    case "clase": {
      const d = getClaseDetalleFromCache(cache, ref.id);
      return { seguimientos: d.seguimientos, conceptos: d.conceptos };
    }
    case "nodo":
      return { seguimientos: [], conceptos: [] };
  }
}
