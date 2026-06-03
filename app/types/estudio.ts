/** Filas alineadas con ADR 002 — nombres exactos de columnas Supabase. */

export type Tema = {
  id: string;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  fecha_estimada_inicio: string | null;
  fecha_estimada_fin: string | null;
  created_at: string;
};

export type Curso = {
  id: string;
  user_id: string;
  tema_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  fecha_estimada_inicio: string | null;
  fecha_estimada_fin: string | null;
  plataforma: string | null;
  link: string | null;
  created_at: string;
};

export type Clase = {
  id: string;
  user_id: string;
  curso_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  jerarquia: number;
  dificultad: string | null;
  created_at: string;
};

export type Seguimiento = {
  id: string;
  user_id: string;
  tema_id: string | null;
  curso_id: string | null;
  clase_id: string | null;
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
