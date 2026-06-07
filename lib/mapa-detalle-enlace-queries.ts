import type {
  EnlaceHijoNodo,
  MapaDetalleHijoKind,
  MapaDetalleScope,
} from "@/lib/mapa-detalle-types";
import { mapaDetalleScopeKey } from "@/lib/mapa-detalle-types";
import type { MapaEnlaceTipo } from "@/app/types/mapa";
import { createClient } from "@/lib/supabase/client";

const ORDEN_ASC = { ascending: true } as const;

export async function listEnlacesHijosNodos(
  scope: MapaDetalleScope,
): Promise<{ data: EnlaceHijoNodo[] | null; error: string | null }> {
  const { scope_kind, scope_id } = mapaDetalleScopeKey(scope);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_hijos_nodos")
    .select("*")
    .eq("scope_kind", scope_kind)
    .eq("scope_id", scope_id)
    .order("id", ORDEN_ASC);

  return {
    data: data as EnlaceHijoNodo[] | null,
    error: error?.message ?? null,
  };
}

export async function insertEnlaceHijoNodo(
  userId: string,
  scope: MapaDetalleScope,
  origen: { kind: MapaDetalleHijoKind; id: number },
  destino: { kind: MapaDetalleHijoKind; id: number },
  tipo: MapaEnlaceTipo | null = "prerequisito",
): Promise<{ data: EnlaceHijoNodo | null; error: string | null }> {
  if (origen.kind === destino.kind && origen.id === destino.id) {
    return { data: null, error: "Un ítem no puede enlazarse consigo mismo." };
  }

  const { scope_kind, scope_id } = mapaDetalleScopeKey(scope);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enlaces_hijos_nodos")
    .insert({
      user_id: userId,
      scope_kind,
      scope_id,
      origen_kind: origen.kind,
      origen_id: origen.id,
      destino_kind: destino.kind,
      destino_id: destino.id,
      tipo,
    })
    .select()
    .single();

  return {
    data: data as EnlaceHijoNodo | null,
    error: error?.message ?? null,
  };
}

export async function deleteEnlaceHijoNodo(
  id: number,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("enlaces_hijos_nodos")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}
