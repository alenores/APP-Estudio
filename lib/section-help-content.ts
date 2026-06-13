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
    body: "Son las grandes secciones del esqueleto de decisiones para armar una app nueva (Autenticación, Conectividad, Persistencia de datos, PWA, Apariencia, etc.). Cada una representa un tema que hay que resolver antes o al arrancar un proyecto. No son excluyentes entre sí: un proyecto pasa por todas, eligiendo una o varias opciones dentro de cada una.",
  },
  "definicion-especifica": {
    title: "Definiciones específicas",
    body: "Son las opciones o ramas concretas dentro de una sección general (por ejemplo, dentro de \"Autenticación\": Pública sin login, Con login Google, Con login Email, etc.). Cada específica describe una decisión puntual: qué implica elegirla, y para qué tipo de proyecto aplica. Al elegir una para un proyecto nuevo, queda determinado qué hay que construir en esa sección.",
  },
  acciones: {
    title: "Acciones",
    body: "Son las implicancias técnicas concretas de haber elegido una definición específica: qué tablas crear, qué configurar, qué páginas armar, qué NO hacer. Es el nivel más operativo — la lista de tareas que resultan de esa decisión. Dentro de cada acción (o de la específica) también podés cargar Características (notas, prompts para Cursor) y Pendientes.",
  },
};

export function getSectionHelp(id: SectionHelpId): SectionHelpEntry {
  return SECTION_HELP[id];
}
