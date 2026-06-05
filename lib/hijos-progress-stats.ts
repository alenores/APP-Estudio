/** Conteo hijos terminados vs total (clases en curso, cursos en tema). */
export type HijosProgressStats = {
  terminadas: number;
  total: number;
};

/** @deprecated Usar `HijosProgressStats`. */
export type ClasesCursoStats = HijosProgressStats;
