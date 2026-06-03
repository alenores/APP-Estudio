import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { createClient } from "@/lib/supabase/client";
import type {
  Curso,
  CursoConDerivados,
  Seguimiento,
  Tema,
  TemaConDerivados,
} from "@/app/types/estudio";

const ORDEN = { ascending: true };

export async function getSessionUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function listTemas(): Promise<{
  data: Tema[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("temas")
    .select("*")
    .order("orden", ORDEN)
    .order("jerarquia", ORDEN)
    .order("nombre", ORDEN);

  return {
    data: data as Tema[] | null,
    error: error?.message ?? null,
  };
}

export async function listTemasConDerivados(): Promise<{
  data: TemaConDerivados[] | null;
  error: string | null;
}> {
  const { data: temas, error } = await listTemas();
  if (error) return { data: null, error };
  if (!temas?.length) return { data: [], error: null };

  const supabase = createClient();
  const ids = temas.map((t) => t.id);
  const { data: segs, error: segErr } = await supabase
    .from("seguimientos")
    .select("*")
    .in("tema_id", ids);

  if (segErr) return { data: null, error: segErr.message };

  const porTema = new Map<string, Seguimiento[]>();
  for (const s of (segs ?? []) as Seguimiento[]) {
    if (!s.tema_id) continue;
    const list = porTema.get(s.tema_id) ?? [];
    list.push(s);
    porTema.set(s.tema_id, list);
  }

  return {
    data: temas.map((t) => temaConDerivados(t, porTema.get(t.id) ?? [])),
    error: null,
  };
}

export async function getTemaById(id: string): Promise<{
  data: Tema | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("temas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: data as Tema | null, error: error?.message ?? null };
}

export async function listCursosByTema(temaId: string): Promise<{
  data: Curso[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("tema_id", temaId)
    .order("orden", ORDEN)
    .order("jerarquia", ORDEN)
    .order("nombre", ORDEN);

  return { data: data as Curso[] | null, error: error?.message ?? null };
}

export async function listSeguimientosByTema(temaId: string): Promise<{
  data: Seguimiento[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seguimientos")
    .select("*")
    .eq("tema_id", temaId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Seguimiento[] | null, error: error?.message ?? null };
}

export async function attachDerivadosToCursos(
  cursos: Curso[],
): Promise<{ data: CursoConDerivados[]; error: string | null }> {
  const supabase = createClient();
  const ids = cursos.map((c) => c.id);
  if (ids.length === 0) return { data: [], error: null };

  const { data: segs, error } = await supabase
    .from("seguimientos")
    .select("*")
    .in("curso_id", ids);

  if (error) return { data: [], error: error.message };

  const porCurso = new Map<string, Seguimiento[]>();
  for (const s of (segs ?? []) as Seguimiento[]) {
    if (!s.curso_id) continue;
    const list = porCurso.get(s.curso_id) ?? [];
    list.push(s);
    porCurso.set(s.curso_id, list);
  }

  return {
    data: cursos.map((c) => ({
      ...c,
      derivados: derivarDesdeSeguimientos(porCurso.get(c.id) ?? []),
    })),
    error: null,
  };
}

export function temaConDerivados(
  tema: Tema,
  seguimientos: Seguimiento[],
): TemaConDerivados {
  return { ...tema, derivados: derivarDesdeSeguimientos(seguimientos) };
}

export type InsertSeguimientoTemaInput = {
  tema_id: string;
  etiqueta_estado?: string | null;
  porcentaje_avance?: number | null;
  comentario?: string | null;
  fecha_comienzo?: string | null;
  fecha_alerta?: string | null;
  tiempo_consumido?: number | null;
  tiempo_faltante_estimado?: number | null;
  nivel_entendimiento?: string | null;
};

export async function insertSeguimientoTema(
  userId: string,
  input: InsertSeguimientoTemaInput,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("seguimientos").insert({
    user_id: userId,
    tema_id: input.tema_id,
    curso_id: null,
    clase_id: null,
    etiqueta_estado: input.etiqueta_estado ?? null,
    porcentaje_avance: input.porcentaje_avance ?? null,
    comentario: input.comentario ?? null,
    fecha_comienzo: input.fecha_comienzo ?? null,
    fecha_alerta: input.fecha_alerta ?? null,
    tiempo_consumido: input.tiempo_consumido ?? null,
    tiempo_faltante_estimado: input.tiempo_faltante_estimado ?? null,
    nivel_entendimiento: input.nivel_entendimiento ?? null,
  });

  return { error: error?.message ?? null };
}
