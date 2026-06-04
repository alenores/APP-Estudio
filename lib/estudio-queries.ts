import { derivarDesdeSeguimientos } from "@/lib/seguimiento-derivados";
import { createClient } from "@/lib/supabase/client";
import type {
  Clase,
  ClaseConDerivados,
  Concepto,
  Curso,
  CursoConDerivados,
  Seguimiento,
  Tema,
  TemaConDerivados,
} from "@/app/types/estudio";
import type {
  ClaseFormValues,
  ConceptoFormValues,
  CursoFormValues,
  SeguimientoInsertValues,
  TemaFormValues,
} from "@/lib/validations";

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

  const porTema = new Map<number, Seguimiento[]>();
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

export async function getTemaById(id: number): Promise<{
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

export async function listCursosByTema(temaId: number): Promise<{
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

export async function listSeguimientosByTema(temaId: number): Promise<{
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

  const porCurso = new Map<number, Seguimiento[]>();
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
  tema_id: number;
  etiqueta_estado?: string | null;
  porcentaje_avance?: number | null;
  comentario?: string | null;
  fecha_comienzo?: string | null;
  fecha_alerta?: string | null;
  tiempo_consumido?: number | null;
  tiempo_faltante_estimado?: number | null;
  nivel_entendimiento?: string | null;
};

function emptyToNull(value: string | undefined) {
  return value === undefined || value === "" ? null : value;
}

export async function getNextOrdenTema(userId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("temas")
    .select("orden")
    .eq("user_id", userId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.orden ?? -1) + 1;
}

export async function getNextOrdenCurso(temaId: number): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("cursos")
    .select("orden")
    .eq("tema_id", temaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.orden ?? -1) + 1;
}

export async function getNextOrdenClase(cursoId: number): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("clases")
    .select("orden")
    .eq("curso_id", cursoId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.orden ?? -1) + 1;
}

export async function insertTema(
  userId: string,
  values: TemaFormValues,
): Promise<{ data: Tema | null; error: string | null }> {
  const supabase = createClient();
  const orden =
    values.orden ?? (await getNextOrdenTema(userId));
  const { data, error } = await supabase
    .from("temas")
    .insert({
      user_id: userId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
      orden,
      jerarquia: values.jerarquia ?? 0,
      fecha_estimada_inicio: emptyToNull(values.fecha_estimada_inicio),
      fecha_estimada_fin: emptyToNull(values.fecha_estimada_fin),
    })
    .select()
    .single();

  return { data: data as Tema | null, error: error?.message ?? null };
}

export async function insertCurso(
  userId: string,
  temaId: number,
  values: CursoFormValues,
): Promise<{ data: Curso | null; error: string | null }> {
  const supabase = createClient();
  const orden =
    values.orden ?? (await getNextOrdenCurso(temaId));
  const { data, error } = await supabase
    .from("cursos")
    .insert({
      user_id: userId,
      tema_id: temaId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
      orden,
      jerarquia: values.jerarquia ?? 0,
      fecha_estimada_inicio: emptyToNull(values.fecha_estimada_inicio),
      fecha_estimada_fin: emptyToNull(values.fecha_estimada_fin),
      plataforma: emptyToNull(values.plataforma),
      link: emptyToNull(values.link),
    })
    .select()
    .single();

  return { data: data as Curso | null, error: error?.message ?? null };
}

export async function insertClase(
  userId: string,
  cursoId: number,
  values: ClaseFormValues,
): Promise<{ data: Clase | null; error: string | null }> {
  const supabase = createClient();
  const orden =
    values.orden ?? (await getNextOrdenClase(cursoId));
  const { data, error } = await supabase
    .from("clases")
    .insert({
      user_id: userId,
      curso_id: cursoId,
      nombre: values.nombre,
      descripcion: emptyToNull(values.descripcion),
      orden,
      jerarquia: values.jerarquia ?? 0,
      dificultad: emptyToNull(values.dificultad),
    })
    .select()
    .single();

  return { data: data as Clase | null, error: error?.message ?? null };
}

export async function getCursoById(id: number): Promise<{
  data: Curso | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: data as Curso | null, error: error?.message ?? null };
}

export async function listClasesByCurso(cursoId: number): Promise<{
  data: Clase[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clases")
    .select("*")
    .eq("curso_id", cursoId)
    .order("orden", ORDEN)
    .order("jerarquia", ORDEN)
    .order("nombre", ORDEN);

  return { data: data as Clase[] | null, error: error?.message ?? null };
}

export async function listSeguimientosByCurso(cursoId: number): Promise<{
  data: Seguimiento[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seguimientos")
    .select("*")
    .eq("curso_id", cursoId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Seguimiento[] | null, error: error?.message ?? null };
}

export async function listSeguimientosByClase(claseId: number): Promise<{
  data: Seguimiento[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("seguimientos")
    .select("*")
    .eq("clase_id", claseId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Seguimiento[] | null, error: error?.message ?? null };
}

export async function listConceptosByTema(temaId: number): Promise<{
  data: Concepto[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conceptos")
    .select("*")
    .eq("tema_id", temaId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Concepto[] | null, error: error?.message ?? null };
}

export async function listConceptosByCurso(cursoId: number): Promise<{
  data: Concepto[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conceptos")
    .select("*")
    .eq("curso_id", cursoId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Concepto[] | null, error: error?.message ?? null };
}

export async function listConceptosByClase(claseId: number): Promise<{
  data: Concepto[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conceptos")
    .select("*")
    .eq("clase_id", claseId)
    .order("fecha_registro", { ascending: false });

  return { data: data as Concepto[] | null, error: error?.message ?? null };
}

export async function getClaseById(id: number): Promise<{
  data: Clase | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data: data as Clase | null, error: error?.message ?? null };
}

export async function attachDerivadosToClases(
  clases: Clase[],
): Promise<{ data: ClaseConDerivados[]; error: string | null }> {
  const supabase = createClient();
  const ids = clases.map((c) => c.id);
  if (ids.length === 0) return { data: [], error: null };

  const { data: segs, error } = await supabase
    .from("seguimientos")
    .select("*")
    .in("clase_id", ids);

  if (error) return { data: [], error: error.message };

  const porClase = new Map<number, Seguimiento[]>();
  for (const s of (segs ?? []) as Seguimiento[]) {
    if (!s.clase_id) continue;
    const list = porClase.get(s.clase_id) ?? [];
    list.push(s);
    porClase.set(s.clase_id, list);
  }

  return {
    data: clases.map((c) => ({
      ...c,
      derivados: derivarDesdeSeguimientos(porClase.get(c.id) ?? []),
    })),
    error: null,
  };
}

export function cursoConDerivados(
  curso: Curso,
  seguimientos: Seguimiento[],
): CursoConDerivados {
  return { ...curso, derivados: derivarDesdeSeguimientos(seguimientos) };
}

export function claseConDerivados(
  clase: Clase,
  seguimientos: Seguimiento[],
): ClaseConDerivados {
  return { ...clase, derivados: derivarDesdeSeguimientos(seguimientos) };
}

export type InsertSeguimientoInput = SeguimientoInsertValues & {
  tema_id?: number;
  curso_id?: number;
  clase_id?: number;
};

export async function insertSeguimiento(
  userId: string,
  input: InsertSeguimientoInput,
): Promise<{ error: string | null }> {
  const hasTema = input.tema_id != null;
  const hasCurso = input.curso_id != null;
  const hasClase = input.clase_id != null;
  if (Number(hasTema) + Number(hasCurso) + Number(hasClase) !== 1) {
    return { error: "Indicá exactamente tema_id, curso_id o clase_id." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("seguimientos").insert({
    user_id: userId,
    tema_id: input.tema_id ?? null,
    curso_id: input.curso_id ?? null,
    clase_id: input.clase_id ?? null,
    etiqueta_estado: emptyToNull(input.etiqueta_estado),
    porcentaje_avance: input.porcentaje_avance ?? null,
    comentario: emptyToNull(input.comentario),
    fecha_comienzo: emptyToNull(input.fecha_comienzo),
    fecha_alerta: emptyToNull(input.fecha_alerta),
    tiempo_consumido: input.tiempo_consumido ?? null,
    tiempo_faltante_estimado: input.tiempo_faltante_estimado ?? null,
    nivel_entendimiento: emptyToNull(input.nivel_entendimiento),
  });

  return { error: error?.message ?? null };
}

export type InsertConceptoInput = ConceptoFormValues & {
  tema_id?: number;
  curso_id?: number;
  clase_id?: number;
};

/** Misma regla de dimensión única que seguimientos (CHECK en Supabase). */
export async function insertConcepto(
  userId: string,
  input: InsertConceptoInput,
): Promise<{ error: string | null }> {
  const hasTema = input.tema_id != null;
  const hasCurso = input.curso_id != null;
  const hasClase = input.clase_id != null;
  if (Number(hasTema) + Number(hasCurso) + Number(hasClase) !== 1) {
    return { error: "Indicá exactamente tema_id, curso_id o clase_id." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("conceptos").insert({
    user_id: userId,
    tema_id: input.tema_id ?? null,
    curso_id: input.curso_id ?? null,
    clase_id: input.clase_id ?? null,
    titulo: input.titulo,
    descripcion: input.descripcion,
    jerarquia: input.jerarquia ?? 0,
  });

  return { error: error?.message ?? null };
}

/** @deprecated Usar insertSeguimiento */
export async function insertSeguimientoTema(
  userId: string,
  input: InsertSeguimientoTemaInput,
): Promise<{ error: string | null }> {
  return insertSeguimiento(userId, {
    tema_id: input.tema_id,
    etiqueta_estado: input.etiqueta_estado ?? "",
    porcentaje_avance: input.porcentaje_avance ?? undefined,
    comentario: input.comentario ?? undefined,
    fecha_comienzo: input.fecha_comienzo ?? undefined,
    fecha_alerta: input.fecha_alerta ?? undefined,
    tiempo_consumido: input.tiempo_consumido ?? undefined,
    tiempo_faltante_estimado: input.tiempo_faltante_estimado ?? undefined,
    nivel_entendimiento: input.nivel_entendimiento ?? undefined,
  });
}
