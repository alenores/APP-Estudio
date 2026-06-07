import type {
  LienzoHijoPosicion,
  MapaDetalleHijoKind,
  MapaDetalleScope,
} from "@/lib/mapa-detalle-types";
import { mapaDetalleScopeKey } from "@/lib/mapa-detalle-types";
import { createClient } from "@/lib/supabase/client";

export async function listLienzoHijosPosiciones(
  scope: MapaDetalleScope,
): Promise<{ data: LienzoHijoPosicion[] | null; error: string | null }> {
  const { scope_kind, scope_id } = mapaDetalleScopeKey(scope);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lienzo_hijos_posiciones")
    .select("hijo_kind, hijo_id, pos_x, pos_y")
    .eq("scope_kind", scope_kind)
    .eq("scope_id", scope_id);

  return {
    data: data as LienzoHijoPosicion[] | null,
    error: error?.message ?? null,
  };
}

export async function upsertLienzoHijoPosicion(
  userId: string,
  scope: MapaDetalleScope,
  hijo: { kind: MapaDetalleHijoKind; id: number },
  pos_x: number,
  pos_y: number,
): Promise<{ error: string | null }> {
  const { scope_kind, scope_id } = mapaDetalleScopeKey(scope);
  const supabase = createClient();
  const { error } = await supabase.from("lienzo_hijos_posiciones").upsert(
    {
      user_id: userId,
      scope_kind,
      scope_id,
      hijo_kind: hijo.kind,
      hijo_id: hijo.id,
      pos_x,
      pos_y,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,scope_kind,scope_id,hijo_kind,hijo_id",
    },
  );

  return { error: error?.message ?? null };
}
