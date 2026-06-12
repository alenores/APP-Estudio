import { createClient } from "@/lib/supabase/client";
import type {
  Accion,
  Caracteristica,
  DefinicionEspecifica,
  DefinicionGeneral,
  Pendiente,
} from "@/app/types/desarrollos";
import type {
  AccionFormValues,
  CaracteristicaFormValues,
  DefinicionEspecificaFormValues,
  DefinicionGeneralFormValues,
  PendienteFormValues,
} from "@/lib/validations";

const NOMBRE_ASC = { ascending: true } as const;

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getSessionUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function insertDefinicionGeneral(
  userId: string,
  values: DefinicionGeneralFormValues,
): Promise<{ data: DefinicionGeneral | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_general")
    .insert({
      user_id: userId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .select()
    .single();

  return { data: data as DefinicionGeneral | null, error: error?.message ?? null };
}

export async function updateDefinicionGeneral(
  id: number,
  values: DefinicionGeneralFormValues,
): Promise<{ data: DefinicionGeneral | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_general")
    .update({
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as DefinicionGeneral | null, error: error?.message ?? null };
}

export async function deleteDefinicionGeneral(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("definicion_general").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function insertDefinicionEspecifica(
  userId: string,
  generalId: number,
  values: DefinicionEspecificaFormValues,
): Promise<{ data: DefinicionEspecifica | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_especifica")
    .insert({
      user_id: userId,
      definicion_general_id: generalId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .select()
    .single();

  return {
    data: data as DefinicionEspecifica | null,
    error: error?.message ?? null,
  };
}

export async function updateDefinicionEspecifica(
  id: number,
  values: DefinicionEspecificaFormValues,
): Promise<{ data: DefinicionEspecifica | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_especifica")
    .update({
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .eq("id", id)
    .select()
    .single();

  return {
    data: data as DefinicionEspecifica | null,
    error: error?.message ?? null,
  };
}

export async function deleteDefinicionEspecifica(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("definicion_especifica")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function insertAccion(
  userId: string,
  especificaId: number,
  values: AccionFormValues,
): Promise<{ data: Accion | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("acciones")
    .insert({
      user_id: userId,
      definicion_especifica_id: especificaId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .select()
    .single();

  return { data: data as Accion | null, error: error?.message ?? null };
}

export async function updateAccion(
  id: number,
  values: AccionFormValues,
): Promise<{ data: Accion | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("acciones")
    .update({
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Accion | null, error: error?.message ?? null };
}

export async function deleteAccion(id: number): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("acciones").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export type CaracteristicaParent =
  | { definicion_especifica_id: number }
  | { accion_id: number };

export async function insertCaracteristica(
  userId: string,
  parent: CaracteristicaParent,
  values: CaracteristicaFormValues,
): Promise<{ data: Caracteristica | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("caracteristicas")
    .insert({
      user_id: userId,
      definicion_general_id: null,
      definicion_especifica_id:
        "definicion_especifica_id" in parent ? parent.definicion_especifica_id : null,
      accion_id: "accion_id" in parent ? parent.accion_id : null,
      tipo: values.tipo,
      titulo: emptyToNull(values.titulo),
    })
    .select()
    .single();

  return { data: data as Caracteristica | null, error: error?.message ?? null };
}

export async function deleteCaracteristica(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("caracteristicas").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export type PendienteParent =
  | { definicion_general_id: number }
  | { definicion_especifica_id: number }
  | { accion_id: number };

export async function insertPendiente(
  userId: string,
  parent: PendienteParent,
  values: PendienteFormValues,
): Promise<{ data: Pendiente | null; error: string | null }> {
  const supabase = createClient();
  const resolvedAt = values.estado === "resuelto" ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("pendientes")
    .insert({
      user_id: userId,
      definicion_general_id:
        "definicion_general_id" in parent ? parent.definicion_general_id : null,
      definicion_especifica_id:
        "definicion_especifica_id" in parent ? parent.definicion_especifica_id : null,
      accion_id: "accion_id" in parent ? parent.accion_id : null,
      titulo: values.titulo,
      descripcion: emptyToNull(values.descripcion),
      estado: values.estado,
      prioridad: values.prioridad,
      resolved_at: resolvedAt,
    })
    .select()
    .single();

  return { data: data as Pendiente | null, error: error?.message ?? null };
}

export async function updatePendiente(
  id: number,
  values: PendienteFormValues,
): Promise<{ data: Pendiente | null; error: string | null }> {
  const supabase = createClient();
  const resolvedAt = values.estado === "resuelto" ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("pendientes")
    .update({
      titulo: values.titulo,
      descripcion: emptyToNull(values.descripcion),
      estado: values.estado,
      prioridad: values.prioridad,
      resolved_at: resolvedAt,
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Pendiente | null, error: error?.message ?? null };
}

export async function patchPendienteEstado(
  id: number,
  estado: PendienteFormValues["estado"],
): Promise<{ data: Pendiente | null; error: string | null }> {
  const supabase = createClient();
  const resolvedAt = estado === "resuelto" ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("pendientes")
    .update({ estado, resolved_at: resolvedAt })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Pendiente | null, error: error?.message ?? null };
}

export async function deletePendiente(id: number): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("pendientes").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function listDefinicionesGeneralesLienzo(): Promise<{
  data: DefinicionGeneral[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_general")
    .select("*")
    .order("nombre", NOMBRE_ASC);

  return {
    data: data as DefinicionGeneral[] | null,
    error: error?.message ?? null,
  };
}

export async function patchDefinicionGeneralPosicion(
  id: number,
  pos_x: number,
  pos_y: number,
  etapa: number,
  carril: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("definicion_general")
    .update({ pos_x, pos_y, etapa, carril })
    .eq("id", id);

  return { error: error?.message ?? null };
}
