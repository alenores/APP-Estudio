/** Padre al que cuelga un concepto (tema, curso o clase). */
export type ConceptoParent =
  | { temaId: number }
  | { cursoId: number }
  | { claseId: number };

/** Padre al que cuelga un seguimiento (tema, curso o clase). */
export type SeguimientoParent =
  | { temaId: number }
  | { cursoId: number }
  | { claseId: number };
