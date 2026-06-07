import type { MapaEnlace, MapaEnlaceTipo, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import { sortNodosObjetivos } from "@/lib/mapa-objetivo";
import { getSessionUserId } from "@/lib/estudio-queries";
import { posicionDesdeEtapaCarril } from "@/lib/mapa-layout";
import { createClient } from "@/lib/supabase/client";
import type { MapaNodoFormValues } from "@/lib/validations";

const ORDEN_ASC = { ascending: true } as const;

function emptyToNull(value: string | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

export async function listMapaNodos(): Promise<{
  data: MapaNodo[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nodos_objetivos")
    .select("*")
    .order("orden", ORDEN_ASC)
    .order("etapa", ORDEN_ASC)
    .order("carril", ORDEN_ASC)
    .order("titulo", ORDEN_ASC);

  if (error?.message?.includes("orden")) {
    const retry = await supabase
      .from("nodos_objetivos")
      .select("*")
      .order("etapa", ORDEN_ASC)
      .order("carril", ORDEN_ASC)
      .order("titulo", ORDEN_ASC);
    return {
      data: retry.data ? sortNodosObjetivos(retry.data as MapaNodo[]) : null,
      error: retry.error?.message ?? null,
    };
  }

  return {
    data: data ? sortNodosObjetivos(data as MapaNodo[]) : null,
    error: error?.message ?? null,
  };
}

export async function listMapaObjetivos(): Promise<{
  data: MapaObjetivo[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("objetivos")
    .select("*")
    .order("orden", ORDEN_ASC)
    .order("id", ORDEN_ASC);

  return {
    data: data as MapaObjetivo[] | null,
    error: error?.message ?? null,
  };
}

export async function insertMapaNodo(
  userId: string,
  values: MapaNodoFormValues,
): Promise<{ data: MapaNodo | null; error: string | null }> {
  const supabase = createClient();
  const etapa = values.etapa ?? 0;
  const carril = values.carril ?? 0;
  const pos =
    values.pos_x != null && values.pos_y != null
      ? { x: values.pos_x, y: values.pos_y }
      : posicionDesdeEtapaCarril(etapa, carril);

  const { data, error } = await supabase
    .from("nodos_objetivos")
    .insert({
      user_id: userId,
      titulo: values.titulo,
      descripcion: emptyToNull(values.descripcion),
      pos_x: pos.x,
      pos_y: pos.y,
      carril,
      etapa,
      orden: values.orden ?? etapa,
      tipo: emptyToNull(values.tipo) ?? "dominio",
      objetivo_id: values.objetivo_id,
    })
    .select()
    .single();

  return { data: data as MapaNodo | null, error: error?.message ?? null };
}

export async function updateMapaNodo(
  id: number,
  values: MapaNodoFormValues,
): Promise<{ data: MapaNodo | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nodos_objetivos")
    .update({
      titulo: values.titulo,
      descripcion: emptyToNull(values.descripcion),
      pos_x: values.pos_x ?? 0,
      pos_y: values.pos_y ?? 0,
      carril: values.carril ?? 0,
      etapa: values.etapa ?? 0,
      orden: values.orden ?? values.etapa ?? 0,
      tipo: emptyToNull(values.tipo) ?? "dominio",
      objetivo_id: values.objetivo_id,
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as MapaNodo | null, error: error?.message ?? null };
}

export async function deleteMapaNodo(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("nodos_objetivos").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function listMapaEnlaces(): Promise<{
  data: MapaEnlace[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_nodos")
    .select("*")
    .order("id", ORDEN_ASC);

  return {
    data: data as MapaEnlace[] | null,
    error: error?.message ?? null,
  };
}

export async function insertMapaEnlace(
  userId: string,
  origen_id: number,
  destino_id: number,
  tipo: MapaEnlaceTipo | null = "prerequisito",
): Promise<{ data: MapaEnlace | null; error: string | null }> {
  if (origen_id === destino_id) {
    return { data: null, error: "Un nodo no puede enlazarse consigo mismo." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_nodos")
    .insert({
      user_id: userId,
      origen_id,
      destino_id,
      tipo,
    })
    .select()
    .single();

  return { data: data as MapaEnlace | null, error: error?.message ?? null };
}

export async function deleteMapaEnlace(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("enlaces_nodos").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateMapaNodoPosition(
  id: number,
  pos_x: number,
  pos_y: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("nodos_objetivos")
    .update({ pos_x, pos_y })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export { getSessionUserId };
