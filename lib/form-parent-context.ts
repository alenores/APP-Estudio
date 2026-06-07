import type { ConceptoParent, SeguimientoParent } from "@/lib/form-parent-types";
import type { ExplorerEntityKind } from "@/lib/explorer-entity-panel";

export type FormParentKind = ExplorerEntityKind;

const KIND_LABEL: Record<FormParentKind, string> = {
  tema: "Tema",
  curso: "Curso",
  clase: "Clase",
  nodo: "Nodo",
  logro: "Logro",
};

export function formParentKindLabel(kind: FormParentKind): string {
  return KIND_LABEL[kind];
}

/** Subtítulo de sheet/modal: «Tema padre · Nombre del tema». */
export function formatFormParentSubtitle(
  parentKind: FormParentKind,
  parentName: string,
): string {
  const name = parentName.trim();
  return `${formParentKindLabel(parentKind)} padre · ${name || "—"}`;
}

export function seguimientoParentKind(
  parent: SeguimientoParent,
): FormParentKind {
  if ("temaId" in parent) return "tema";
  if ("cursoId" in parent) return "curso";
  return "clase";
}

export function conceptoParentKind(parent: ConceptoParent): FormParentKind {
  if ("temaId" in parent) return "tema";
  if ("cursoId" in parent) return "curso";
  return "clase";
}
