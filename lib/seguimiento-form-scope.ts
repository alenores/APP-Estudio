/** Dimensión del padre al que cuelga el seguimiento (define campos del formulario). */
export type SeguimientoFormScope = "tema" | "curso" | "clase";

export type SeguimientoParentRef =
  | { temaId: number }
  | { cursoId: number }
  | { claseId: number };

export function seguimientoFormScopeFromParent(
  parent: SeguimientoParentRef,
): SeguimientoFormScope {
  if ("temaId" in parent) return "tema";
  if ("cursoId" in parent) return "curso";
  return "clase";
}

/** Curso y clase comparten los mismos campos de avance. */
export function seguimientoMuestraAvanceCurso(scope: SeguimientoFormScope): boolean {
  return scope === "curso" || scope === "clase";
}
