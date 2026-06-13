export type SectionHelpId =
  | "temas"
  | "nodos-objetivo"
  | "cursos"
  | "clases"
  | "definicion-general"
  | "definicion-especifica"
  | "acciones";

export type SectionHelpEntry = {
  title: string;
  body: string;
};

export const SECTION_HELP: Record<SectionHelpId, SectionHelpEntry> = {
  temas: {
    title: "Temas",
    body: "Ámbitos amplios de estudio (por ejemplo, una materia o área). Agrupan cursos y organizan tu formación académica en el explorador.",
  },
  "nodos-objetivo": {
    title: "Nodos objetivo",
    body: "Metas de formación o producción en el mapa de conocimiento. Desde el explorador ves qué cursos o logros dependen de cada nodo.",
  },
  cursos: {
    title: "Cursos",
    body: "Unidades de aprendizaje dentro de un tema o colgadas de un nodo objetivo. Contienen clases y registran seguimiento de avance.",
  },
  clases: {
    title: "Clases",
    body: "Lecciones o unidades mínimas dentro de un curso. Es el nivel donde registrás tiempo, estado, seguimientos y conceptos concretos.",
  },
  "definicion-general": {
    title: "Definiciones generales",
    body: "Nivel superior en desarrollos: un ámbito o proyecto amplio que agrupa definiciones específicas y acciones.",
  },
  "definicion-especifica": {
    title: "Definiciones específicas",
    body: "Descomponen una definición general en partes concretas. Cada específica contiene las acciones ejecutables del desarrollo.",
  },
  acciones: {
    title: "Acciones",
    body: "Pasos concretos o tareas dentro de una definición específica. Es el nivel más operativo de la tipología desarrollos.",
  },
};

export function getSectionHelp(id: SectionHelpId): SectionHelpEntry {
  return SECTION_HELP[id];
}
