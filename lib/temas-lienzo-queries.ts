import type { EnlaceTema, EnlaceTemaTipo, Tema } from "@/app/types/estudio";
import { getSessionUserId } from "@/lib/estudio-queries";
import { createClient } from "@/lib/supabase/client";

const ORDEN_ASC = { ascending: true } as const;

/** Temas con columnas de lienzo (007). Orden para lista y mapa. */
export async function listTemasLienzo(): Promise<{
  data: Tema[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("temas")
    .select("*")
    .order("etapa", ORDEN_ASC)
    .order("carril", ORDEN_ASC)
    .order("orden", ORDEN_ASC)
    .order("nombre", ORDEN_ASC);

  if (error?.message?.includes("etapa") || error?.message?.includes("pos_x")) {
    const retry = await supabase
      .from("temas")
      .select("*")
      .order("orden", ORDEN_ASC)
      .order("nombre", ORDEN_ASC);
    return {
      data: retry.data as Tema[] | null,
      error: retry.error?.message ?? null,
    };
  }

  return {
    data: data as Tema[] | null,
    error: error?.message ?? null,
  };
}

export async function listEnlacesTemas(): Promise<{
  data: EnlaceTema[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_temas")
    .select("*")
    .order("id", ORDEN_ASC);

  return {
    data: data as EnlaceTema[] | null,
    error: error?.message ?? null,
  };
}

export async function insertEnlaceTema(
  userId: string,
  origen_id: number,
  destino_id: number,
  tipo: EnlaceTemaTipo | null = "prerequisito",
): Promise<{ data: EnlaceTema | null; error: string | null }> {
  if (origen_id === destino_id) {
    return { data: null, error: "Un tema no puede enlazarse consigo mismo." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_temas")
    .insert({
      user_id: userId,
      origen_id,
      destino_id,
      tipo,
    })
    .select()
    .single();

  return { data: data as EnlaceTema | null, error: error?.message ?? null };
}

export async function deleteEnlaceTema(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("enlaces_temas").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateTemaPosition(
  id: number,
  pos_x: number,
  pos_y: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("temas")
    .update({ pos_x, pos_y })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateTemaLienzoLayout(
  id: number,
  layout: {
    etapa: number;
    carril: number;
    pos_x: number;
    pos_y: number;
  },
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("temas")
    .update({
      etapa: layout.etapa,
      carril: layout.carril,
      pos_x: layout.pos_x,
      pos_y: layout.pos_y,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export { getSessionUserId };
