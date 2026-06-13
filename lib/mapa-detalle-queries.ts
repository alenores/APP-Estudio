import type { MapaDetalleHijo, MapaDetalleScope } from "@/lib/mapa-detalle-types";
import { listLogrosPorNodo } from "@/lib/logros-queries";
import { createClient } from "@/lib/supabase/client";

const ORDEN_ASC = { ascending: true } as const;

type CursoDetalleRow = {
  id: number;
  nombre: string;
  descripcion: string | null;
  link: string | null;
  link_chat: string | null;
};

async function listCursosDetalle(
  filter: { temaId: number } | { nodoId: number },
): Promise<{ data: CursoDetalleRow[] | null; error: string | null }> {
  const supabase = createClient();
  let query = supabase
    .from("cursos")
    .select("id, nombre, descripcion, link, link_chat")
    .order("orden", ORDEN_ASC)
    .order("nombre", ORDEN_ASC);

  if ("temaId" in filter) {
    query = query.eq("tema_id", filter.temaId);
  } else {
    query = query.eq("nodo_id", filter.nodoId);
  }

  const { data, error } = await query;
  return {
    data: data as CursoDetalleRow[] | null,
    error: error?.message ?? null,
  };
}

export async function listMapaDetalleHijos(
  scope: MapaDetalleScope,
): Promise<{
  data: MapaDetalleHijo[] | null;
  error: string | null;
}> {
  if (scope.kind === "tema") {
    const { data, error } = await listCursosDetalle({ temaId: scope.temaId });
    if (error) return { data: null, error };
    return {
      data: (data ?? []).map((c) => ({ ...c, kind: "curso" as const })),
      error: null,
    };
  }

  if (scope.childKind === "mixto") {
    const [cursosRes, logrosRes] = await Promise.all([
      listCursosDetalle({ nodoId: scope.nodoId }),
      listLogrosPorNodo(scope.nodoId),
    ]);
    if (cursosRes.error) return { data: null, error: cursosRes.error };
    if (logrosRes.error) return { data: null, error: logrosRes.error };
    const hijos: MapaDetalleHijo[] = [
      ...(cursosRes.data ?? []).map((c) => ({ ...c, kind: "curso" as const })),
      ...(logrosRes.data ?? []).map((l) => ({
        id: l.id,
        nombre: l.nombre,
        descripcion: l.descripcion,
        kind: "logro" as const,
      })),
    ];
    return { data: hijos, error: null };
  }

  if (scope.childKind === "logro") {
    const { data, error } = await listLogrosPorNodo(scope.nodoId);
    if (error) return { data: null, error };
    return {
      data: (data ?? []).map((l) => ({
        id: l.id,
        nombre: l.nombre,
        descripcion: l.descripcion,
        kind: "logro" as const,
      })),
      error: null,
    };
  }

  const { data, error } = await listCursosDetalle({ nodoId: scope.nodoId });
  if (error) return { data: null, error };
  return {
    data: (data ?? []).map((c) => ({ ...c, kind: "curso" as const })),
    error: null,
  };
}
