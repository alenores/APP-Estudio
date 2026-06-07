import type { Logro } from "@/app/types/estudio";
import { getSessionUserId } from "@/lib/estudio-queries";
import { createClient } from "@/lib/supabase/client";
import type { LogroRegistroFormValues } from "@/lib/validations";

const ORDEN_ASC = { ascending: true } as const;

function emptyToNull(value: string | undefined): string | null {
  const t = value?.trim();
  return t ? t : null;
}

export async function listLogrosPorNodo(nodoId: number): Promise<{
  data: Logro[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logros")
    .select("*")
    .eq("nodo_id", nodoId)
    .order("nombre", ORDEN_ASC);

  return {
    data: data as Logro[] | null,
    error: error?.message ?? null,
  };
}

export async function listLogrosPorNodos(nodoIds: number[]): Promise<{
  data: Logro[] | null;
  error: string | null;
}> {
  if (nodoIds.length === 0) return { data: [], error: null };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("logros")
    .select("*")
    .in("nodo_id", nodoIds)
    .order("nodo_id", ORDEN_ASC)
    .order("nombre", ORDEN_ASC);

  return {
    data: data as Logro[] | null,
    error: error?.message ?? null,
  };
}

export async function insertLogroRegistro(
  userId: string,
  nodoId: number,
  values: LogroRegistroFormValues,
): Promise<{ data: Logro | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logros")
    .insert({
      user_id: userId,
      nodo_id: nodoId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .select()
    .single();

  return { data: data as Logro | null, error: error?.message ?? null };
}

export async function updateLogroRegistro(
  id: number,
  values: LogroRegistroFormValues,
): Promise<{ data: Logro | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("logros")
    .update({
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data as Logro | null, error: error?.message ?? null };
}

export async function deleteLogroRegistro(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("logros").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export { getSessionUserId };
