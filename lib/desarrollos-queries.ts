import { createClient } from "@/lib/supabase/client";
import type {
  Accion,
  DefinicionEspecifica,
  DefinicionGeneral,
} from "@/app/types/desarrollos";
import type {
  AccionFormValues,
  DefinicionEspecificaFormValues,
  DefinicionGeneralFormValues,
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
