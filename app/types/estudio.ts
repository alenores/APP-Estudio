/** Filas alineadas con ADR 002 — nombres exactos de columnas Supabase. */

export type Tema = {
  id: number;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  /** Lienzo `/mapa` vista Temas — SQL 007. */
  pos_x: number;
  pos_y: number;
  etapa: number;
  carril: number;
  fecha_estimada_inicio: string | null;
  fecha_estimada_fin: string | null;
  created_at: string;
};

/** Flecha entre temas (`enlaces_temas`) — lienzo PC futuro. */
export type EnlaceTemaTipo =
  | "prerequisito"
  | "continuacion"
  | "refuerzo"
  | "paralelo";

export type EnlaceTema = {
  id: number;
  user_id: string;
  origen_id: number;
  destino_id: number;
  tipo: EnlaceTemaTipo | null;
  created_at: string;
};

export type Curso = {
  id: number;
  user_id: string;
  tema_id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  fecha_estimada_inicio: string | null;
  fecha_estimada_fin: string | null;
  plataforma: string | null;
  link: string | null;
  nodo_id: number;
  created_at: string;
};

export type Clase = {
  id: number;
  user_id: string;
  curso_id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  dificultad: string | null;
  link: string | null;
  created_at: string;
};

export type Concepto = {
  id: number;
  user_id: string;
  tema_id: number | null;
  curso_id: number | null;
  clase_id: number | null;
  titulo: string;
  descripcion: string;
  jerarquia: number;
  fecha_registro: string;
  created_at: string;
};

export type Seguimiento = {
  id: number;
  user_id: string;
  tema_id: number | null;
  curso_id: number | null;
  clase_id: number | null;
  fecha_registro: string;
  etiqueta_estado: string | null;
  porcentaje_avance: number | null;
  tiempo_consumido: number | null;
  tiempo_faltante_estimado: number | null;
  comentario: string | null;
  fecha_alerta: string | null;
  fecha_comienzo: string | null;
  nivel_entendimiento: string | null;
  created_at: string;
};

export type SeguimientoDerivados = {
  etiqueta_estado: string | null;
  porcentaje_avance: number | null;
  tiempo_consumido: number | null;
  tiempo_faltante_estimado: number | null;
  nivel_entendimiento: string | null;
  fecha_comienzo: string | null;
};

export type TemaConDerivados = Tema & { derivados: SeguimientoDerivados };

export type CursoConDerivados = Curso & { derivados: SeguimientoDerivados };

export type ClaseConDerivados = Clase & { derivados: SeguimientoDerivados };
