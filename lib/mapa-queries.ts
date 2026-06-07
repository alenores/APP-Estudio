import type { MapaEnlace, MapaEnlaceTipo, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import { sortNodosObjetivos } from "@/lib/mapa-objetivo";
import type { NodoObjetivoClasificacion } from "@/lib/mapa-nodo-tipo";
import { getSessionUserId } from "@/lib/estudio-queries";
import { posicionDesdeEtapaCarril } from "@/lib/mapa-layout";
import { createClient } from "@/lib/supabase/client";
import type {
  MapaLogroFormValues,
  MapaNodoFormValues,
  MapaNodoSimpleFormValues,
} from "@/lib/validations";

const ORDEN_ASC = { ascending: true } as const;

function emptyToNull(value: string | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

function normalizeNodoTipo(raw: unknown): NodoObjetivoClasificacion {
  return raw === "logro" ? "logro" : "nodo";
}

function mapNodoRow(row: Record<string, unknown>): MapaNodo {
  return {
    ...(row as MapaNodo),
    tipo: normalizeNodoTipo(row.tipo),
  };
}

function mapNodoRows(rows: Record<string, unknown>[] | null): MapaNodo[] | null {
  return rows ? rows.map(mapNodoRow) : null;
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
      data: retry.data
        ? sortNodosObjetivos(mapNodoRows(retry.data as Record<string, unknown>[]) ?? [])
        : null,
      error: retry.error?.message ?? null,
    };
  }

  return {
    data: data
      ? sortNodosObjetivos(mapNodoRows(data as Record<string, unknown>[]) ?? [])
      : null,
    error: error?.message ?? null,
  };
}

/** Solo nodos tipo `nodo` — elegibles como padre de cursos. */
export async function listMapaNodosParaCursos(): Promise<{
  data: MapaNodo[] | null;
  error: string | null;
}> {
  const { data, error } = await listMapaNodos();
  if (error) return { data: null, error };
  return {
    data: data?.filter((n) => n.tipo === "nodo") ?? [],
    error: null,
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

export async function insertMapaNodoClasificado(
  userId: string,
  clasificacion: NodoObjetivoClasificacion,
  values: MapaNodoSimpleFormValues | MapaLogroFormValues,
  extras?: Partial<
    Pick<MapaNodoFormValues, "etapa" | "carril" | "orden" | "objetivo_id" | "pos_x" | "pos_y">
  >,
): Promise<{ data: MapaNodo | null; error: string | null }> {
  const supabase = createClient();
  const etapa = extras?.etapa ?? 0;
  const carril = extras?.carril ?? 0;
  const pos =
    extras?.pos_x != null && extras?.pos_y != null
      ? { x: extras.pos_x, y: extras.pos_y }
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
      orden: extras?.orden ?? etapa,
      tipo: clasificacion,
      objetivo_id: extras?.objetivo_id ?? 1,
    })
    .select()
    .single();

  return {
    data: data ? mapNodoRow(data as Record<string, unknown>) : null,
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
      tipo: values.tipo,
      objetivo_id: values.objetivo_id,
    })
    .select()
    .single();

  return {
    data: data ? mapNodoRow(data as Record<string, unknown>) : null,
    error: error?.message ?? null,
  };
}

export async function updateMapaNodoSimple(
  id: number,
  values: MapaNodoSimpleFormValues | MapaLogroFormValues,
): Promise<{ data: MapaNodo | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nodos_objetivos")
    .update({
      titulo: values.titulo,
      descripcion: emptyToNull(values.descripcion),
    })
    .eq("id", id)
    .select()
    .single();

  return {
    data: data ? mapNodoRow(data as Record<string, unknown>) : null,
    error: error?.message ?? null,
  };
}

export async function updateMapaNodo(
  id: number,
  values: MapaNodoFormValues,
): Promise<{ data: MapaNodo | null; error: string | null }> {
  if (values.tipo === "logro") {
    const supabaseCheck = createClient();
    const { count, error: countErr } = await supabaseCheck
      .from("cursos")
      .select("id", { count: "exact", head: true })
      .eq("nodo_id", id);
    if (countErr) {
      return { data: null, error: countErr.message };
    }
    if ((count ?? 0) > 0) {
      return {
        data: null,
        error: "No se puede marcar como logro: tiene cursos asociados.",
      };
    }
  }

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
      tipo: values.tipo,
      objetivo_id: values.objetivo_id,
    })
    .eq("id", id)
    .select()
    .single();

  return {
    data: data ? mapNodoRow(data as Record<string, unknown>) : null,
    error: error?.message ?? null,
  };
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
