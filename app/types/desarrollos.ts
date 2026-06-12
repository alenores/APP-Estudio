/** Filas tipología desarrollos — ADR 002 § desarrollos / ADR 011. */

export type DefinicionGeneral = {
  id: number;
  user_id: string;
  nombre: string;
  descripcion: string | null;
  pos_x: number;
  pos_y: number;
  etapa: number;
  carril: number;
  created_at: string;
};

export type DefinicionEspecifica = {
  id: number;
  user_id: string;
  definicion_general_id: number;
  nombre: string;
  descripcion: string | null;
  created_at: string;
};

export type Accion = {
  id: number;
  user_id: string;
  definicion_especifica_id: number;
  nombre: string;
  descripcion: string | null;
  created_at: string;
};

export type CaracteristicaTipo = "nota" | "implicancia_tecnica" | "prompt_cursor";

export type Caracteristica = {
  id: number;
  user_id: string;
  definicion_general_id: number | null;
  definicion_especifica_id: number | null;
  accion_id: number | null;
  tipo: CaracteristicaTipo;
  titulo: string | null;
  descripcion: string | null;
  created_at: string;
};

export type PendienteEstado = "abierto" | "en_progreso" | "resuelto" | "descartado";

export type PendientePrioridad = "alta" | "media" | "baja";

export type Pendiente = {
  id: number;
  user_id: string;
  definicion_general_id: number | null;
  definicion_especifica_id: number | null;
  accion_id: number | null;
  titulo: string;
  descripcion: string | null;
  estado: PendienteEstado;
  prioridad: PendientePrioridad;
  created_at: string;
  resolved_at: string | null;
};

export type EnlaceDefinicionGeneralTipo =
  | "prerequisito"
  | "continuacion"
  | "refuerzo"
  | "paralelo";

export type EnlaceDefinicionGeneral = {
  id: number;
  user_id: string;
  origen_id: number;
  destino_id: number;
  tipo: EnlaceDefinicionGeneralTipo | null;
  created_at: string;
};

export type EnlaceDesarrolloAccion = {
  id: number;
  user_id: string;
  definicion_general_id: number;
  origen_id: number;
  destino_id: number;
  tipo: EnlaceDefinicionGeneralTipo | null;
  created_at: string;
};

export type LienzoDesarrolloAccionPosicion = {
  user_id: string;
  definicion_general_id: number;
  accion_id: number;
  pos_x: number;
  pos_y: number;
  created_at: string;
};
