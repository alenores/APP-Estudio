import { createClient } from "@/lib/supabase/client";
import type {
  Clase,
  Concepto,
  Curso,
  Seguimiento,
  Tema,
} from "@/app/types/estudio";

/** Tablas ADR 002 — nombres exactos. */
export const ESTUDIO_TABLE = {
  temas: "temas",
  cursos: "cursos",
  clases: "clases",
  seguimientos: "seguimientos",
  conceptos: "conceptos",
} as const;

export type EstudioTableName = (typeof ESTUDIO_TABLE)[keyof typeof ESTUDIO_TABLE];

export type EstudioDataSignature = {
  temas: number;
  cursos: number;
  clases: number;
  seguimientos: number;
  conceptos: number;
};

export type EstudioOfflineCacheData = {
  updatedAt: string;
  userId: string;
  temas: Tema[];
  cursos: Curso[];
  clases: Clase[];
  seguimientos: Seguimiento[];
  conceptos: Concepto[];
  signature?: EstudioDataSignature;
};

export const ESTUDIO_OFFLINE_CACHE_KEY = "app-estudio-offline-cache-v1";

const ORDEN_ASC = { ascending: true } as const;

export function readEstudioOfflineCache(): EstudioOfflineCacheData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ESTUDIO_OFFLINE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EstudioOfflineCacheData;
  } catch {
    return null;
  }
}

export function writeEstudioOfflineCache(data: EstudioOfflineCacheData): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(ESTUDIO_OFFLINE_CACHE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearEstudioOfflineCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ESTUDIO_OFFLINE_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

function maxEntityId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map((item) => item.id)) : 0;
}

export function buildSignatureFromSnapshot(
  data: EstudioOfflineCacheData,
): EstudioDataSignature {
  return {
    temas: maxEntityId(data.temas),
    cursos: maxEntityId(data.cursos),
    clases: maxEntityId(data.clases),
    seguimientos: maxEntityId(data.seguimientos),
    conceptos: maxEntityId(data.conceptos),
  };
}

function resolveLocalSignature(cached: EstudioOfflineCacheData): EstudioDataSignature {
  if (cached.signature) {
    return normalizeSignature(cached.signature);
  }
  return buildSignatureFromSnapshot(cached);
}

function normalizeSignature(raw: Partial<EstudioDataSignature> | undefined): EstudioDataSignature {
  return {
    temas: finiteId(raw?.temas),
    cursos: finiteId(raw?.cursos),
    clases: finiteId(raw?.clases),
    seguimientos: finiteId(raw?.seguimientos),
    conceptos: finiteId(raw?.conceptos),
  };
}

function finiteId(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function fetchTableLastId(table: EstudioTableName): Promise<{
  lastId: number;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    return {
      lastId: 0,
      error: `No se pudo consultar ${table}: ${error.message}`,
    };
  }

  const rawId = data?.[0]?.id;
  const lastId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number(rawId)
        : 0;

  return {
    lastId: Number.isFinite(lastId) ? lastId : 0,
    error: null,
  };
}

async function fetchRemoteSignature(): Promise<{
  signature: EstudioDataSignature | null;
  error: string | null;
}> {
  const [temasRes, cursosRes, clasesRes, segsRes, conceptosRes] = await Promise.all([
    fetchTableLastId(ESTUDIO_TABLE.temas),
    fetchTableLastId(ESTUDIO_TABLE.cursos),
    fetchTableLastId(ESTUDIO_TABLE.clases),
    fetchTableLastId(ESTUDIO_TABLE.seguimientos),
    fetchTableLastId(ESTUDIO_TABLE.conceptos),
  ]);

  const firstError =
    temasRes.error ??
    cursosRes.error ??
    clasesRes.error ??
    segsRes.error ??
    conceptosRes.error;

  if (firstError) {
    return { signature: null, error: firstError };
  }

  return {
    signature: {
      temas: temasRes.lastId,
      cursos: cursosRes.lastId,
      clases: clasesRes.lastId,
      seguimientos: segsRes.lastId,
      conceptos: conceptosRes.lastId,
    },
    error: null,
  };
}

export type EstudioChangedTables = {
  temas: boolean;
  cursos: boolean;
  clases: boolean;
  seguimientos: boolean;
  conceptos: boolean;
};

function buildChangedTables(
  local: EstudioDataSignature,
  remote: EstudioDataSignature,
): EstudioChangedTables {
  return {
    temas: local.temas !== remote.temas,
    cursos: local.cursos !== remote.cursos,
    clases: local.clases !== remote.clases,
    seguimientos: local.seguimientos !== remote.seguimientos,
    conceptos: local.conceptos !== remote.conceptos,
  };
}

export async function checkEstudioUpdatesAvailable(
  cached: EstudioOfflineCacheData,
): Promise<{
  hasUpdates: boolean;
  error: string | null;
  changedTables: EstudioChangedTables;
  remoteSignature: EstudioDataSignature | null;
}> {
  const { signature: remoteSignature, error } = await fetchRemoteSignature();

  if (error || !remoteSignature) {
    return {
      hasUpdates: false,
      error,
      changedTables: {
        temas: false,
        cursos: false,
        clases: false,
        seguimientos: false,
        conceptos: false,
      },
      remoteSignature: null,
    };
  }

  const localSignature = resolveLocalSignature(cached);
  const changedTables = buildChangedTables(localSignature, remoteSignature);
  const hasUpdates = Object.values(changedTables).some(Boolean);

  if (!hasUpdates) {
    writeEstudioOfflineCache({ ...cached, signature: remoteSignature });
  }

  return {
    hasUpdates,
    error: null,
    changedTables,
    remoteSignature,
  };
}

export function isEstudioPackReady(cache: EstudioOfflineCacheData | null): boolean {
  if (!cache?.userId) return false;
  return cache.temas.length > 0 || cache.cursos.length > 0 || cache.clases.length > 0;
}

export async function downloadEstudioSnapshot(): Promise<{
  data: EstudioOfflineCacheData | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: authError?.message ?? "Sesión no disponible." };
  }

  const [temasRes, cursosRes, clasesRes, segsRes, conceptosRes] = await Promise.all([
    supabase
      .from(ESTUDIO_TABLE.temas)
      .select("*")
      .order("orden", ORDEN_ASC)
      .order("jerarquia", ORDEN_ASC)
      .order("nombre", ORDEN_ASC),
    supabase
      .from(ESTUDIO_TABLE.cursos)
      .select("*")
      .order("orden", ORDEN_ASC)
      .order("jerarquia", ORDEN_ASC)
      .order("nombre", ORDEN_ASC),
    supabase
      .from(ESTUDIO_TABLE.clases)
      .select("*")
      .order("orden", ORDEN_ASC)
      .order("jerarquia", ORDEN_ASC)
      .order("nombre", ORDEN_ASC),
    supabase
      .from(ESTUDIO_TABLE.seguimientos)
      .select("*")
      .order("fecha_registro", { ascending: false }),
    supabase
      .from(ESTUDIO_TABLE.conceptos)
      .select("*")
      .order("fecha_registro", { ascending: false }),
  ]);

  const firstError =
    temasRes.error?.message ??
    cursosRes.error?.message ??
    clasesRes.error?.message ??
    segsRes.error?.message ??
    conceptosRes.error?.message;

  if (firstError) {
    return { data: null, error: firstError };
  }

  const temas = (temasRes.data ?? []) as Tema[];
  const cursos = (cursosRes.data ?? []) as Curso[];
  const clases = (clasesRes.data ?? []) as Clase[];
  const seguimientos = (segsRes.data ?? []) as Seguimiento[];
  const conceptos = (conceptosRes.data ?? []) as Concepto[];

  const snapshot: EstudioOfflineCacheData = {
    updatedAt: new Date().toISOString(),
    userId: user.id,
    temas,
    cursos,
    clases,
    seguimientos,
    conceptos,
    signature: {
      temas: maxEntityId(temas),
      cursos: maxEntityId(cursos),
      clases: maxEntityId(clases),
      seguimientos: maxEntityId(seguimientos),
      conceptos: maxEntityId(conceptos),
    },
  };

  if (!writeEstudioOfflineCache(snapshot)) {
    return { data: null, error: "No se pudo guardar el paquete en el dispositivo." };
  }

  return { data: snapshot, error: null };
}
