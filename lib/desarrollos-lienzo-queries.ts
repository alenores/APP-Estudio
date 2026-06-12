import type {
  DefinicionGeneral,
  EnlaceDefinicionGeneral,
  EnlaceDefinicionGeneralTipo,
  EnlaceDesarrolloAccion,
  LienzoDesarrolloAccionPosicion,
} from "@/app/types/desarrollos";
import { getSessionUserId } from "@/lib/desarrollos-queries";
import { createClient } from "@/lib/supabase/client";

const ORDEN_ASC = { ascending: true } as const;

export async function listDefinicionesGeneralesLienzoMapa(): Promise<{
  data: DefinicionGeneral[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("definicion_general")
    .select("*")
    .order("etapa", ORDEN_ASC)
    .order("carril", ORDEN_ASC)
    .order("nombre", ORDEN_ASC);

  return {
    data: data as DefinicionGeneral[] | null,
    error: error?.message ?? null,
  };
}

export async function listEnlacesDefinicionGeneral(): Promise<{
  data: EnlaceDefinicionGeneral[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_definicion_general")
    .select("*")
    .order("id", ORDEN_ASC);

  return {
    data: data as EnlaceDefinicionGeneral[] | null,
    error: error?.message ?? null,
  };
}

export async function insertEnlaceDefinicionGeneral(
  userId: string,
  origen_id: number,
  destino_id: number,
  tipo: EnlaceDefinicionGeneralTipo | null = "prerequisito",
): Promise<{ data: EnlaceDefinicionGeneral | null; error: string | null }> {
  if (origen_id === destino_id) {
    return { data: null, error: "Un ítem no puede enlazarse consigo mismo." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_definicion_general")
    .insert({ user_id: userId, origen_id, destino_id, tipo })
    .select()
    .single();

  return {
    data: data as EnlaceDefinicionGeneral | null,
    error: error?.message ?? null,
  };
}

export async function deleteEnlaceDefinicionGeneral(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("enlaces_definicion_general")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateDefinicionGeneralPosition(
  id: number,
  pos_x: number,
  pos_y: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("definicion_general")
    .update({ pos_x, pos_y })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function listEnlacesDesarrolloAcciones(
  definicionGeneralId: number,
): Promise<{ data: EnlaceDesarrolloAccion[] | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_desarrollo_acciones")
    .select("*")
    .eq("definicion_general_id", definicionGeneralId)
    .order("id", ORDEN_ASC);

  return {
    data: data as EnlaceDesarrolloAccion[] | null,
    error: error?.message ?? null,
  };
}

export async function insertEnlaceDesarrolloAccion(
  userId: string,
  definicionGeneralId: number,
  origen_id: number,
  destino_id: number,
  tipo: EnlaceDefinicionGeneralTipo | null = "prerequisito",
): Promise<{ data: EnlaceDesarrolloAccion | null; error: string | null }> {
  if (origen_id === destino_id) {
    return { data: null, error: "Una acción no puede enlazarse consigo misma." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_desarrollo_acciones")
    .insert({
      user_id: userId,
      definicion_general_id: definicionGeneralId,
      origen_id,
      destino_id,
      tipo,
    })
    .select()
    .single();

  return {
    data: data as EnlaceDesarrolloAccion | null,
    error: error?.message ?? null,
  };
}

export async function deleteEnlaceDesarrolloAccion(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("enlaces_desarrollo_acciones")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function listLienzoDesarrolloAccionesPosiciones(
  definicionGeneralId: number,
): Promise<{ data: LienzoDesarrolloAccionPosicion[] | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lienzo_desarrollo_acciones_posiciones")
    .select("*")
    .eq("definicion_general_id", definicionGeneralId);

  return {
    data: data as LienzoDesarrolloAccionPosicion[] | null,
    error: error?.message ?? null,
  };
}

export async function upsertLienzoDesarrolloAccionPosicion(
  userId: string,
  definicionGeneralId: number,
  accionId: number,
  pos_x: number,
  pos_y: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("lienzo_desarrollo_acciones_posiciones").upsert(
    {
      user_id: userId,
      definicion_general_id: definicionGeneralId,
      accion_id: accionId,
      pos_x,
      pos_y,
    },
    { onConflict: "user_id,definicion_general_id,accion_id" },
  );

  return { error: error?.message ?? null };
}

export { getSessionUserId };
