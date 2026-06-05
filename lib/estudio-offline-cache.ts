import { createClient } from "@/lib/supabase/client";
import {
  buildTableContentSignature,
  emptyTableContentSignature,
  tableContentSignatureChanged,
  type TableContentSignature,
} from "@/lib/estudio-table-digest";
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

/** Huella por tabla: max id, cantidad de filas y digest del contenido. */
export type EstudioTableSignature = TableContentSignature;

export type EstudioDataSignature = {
  temas: EstudioTableSignature;
  cursos: EstudioTableSignature;
  clases: EstudioTableSignature;
  seguimientos: EstudioTableSignature;
  conceptos: EstudioTableSignature;
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

export function buildSignatureFromSnapshot(
  data: EstudioOfflineCacheData,
): EstudioDataSignature {
  return {
    temas: buildTableContentSignature(data.temas),
    cursos: buildTableContentSignature(data.cursos),
    clases: buildTableContentSignature(data.clases),
    seguimientos: buildTableContentSignature(data.seguimientos),
    conceptos: buildTableContentSignature(data.conceptos),
  };
}

/** Siempre desde filas del paquete local (incluye digest por columnas). */
function resolveLocalSignature(cached: EstudioOfflineCacheData): EstudioDataSignature {
  return buildSignatureFromSnapshot(cached);
}

function normalizeTableSignature(raw: unknown): EstudioTableSignature {
  if (raw && typeof raw === "object" && "digest" in raw) {
    const row = raw as Partial<EstudioTableSignature>;
    return {
      maxId: finiteId(row.maxId),
      rowCount: finiteId(row.rowCount),
      digest: typeof row.digest === "string" ? row.digest : "0",
    };
  }

  if (typeof raw === "number") {
    return { maxId: finiteId(raw), rowCount: 0, digest: "0" };
  }

  return emptyTableContentSignature();
}

/** Acepta firmas legacy (solo max id numérico por tabla). */
export function normalizeSignature(
  raw: Partial<Record<EstudioTableName, unknown>> | undefined,
): EstudioDataSignature {
  return {
    temas: normalizeTableSignature(raw?.temas),
    cursos: normalizeTableSignature(raw?.cursos),
    clases: normalizeTableSignature(raw?.clases),
    seguimientos: normalizeTableSignature(raw?.seguimientos),
    conceptos: normalizeTableSignature(raw?.conceptos),
  };
}

function finiteId(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function fetchTableContentSignature(table: EstudioTableName): Promise<{
  signature: EstudioTableSignature;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return {
      signature: emptyTableContentSignature(),
      error: `No se pudo consultar ${table}: ${error.message}`,
    };
  }

  const rows = (data ?? []) as { id: number }[];
  return {
    signature: buildTableContentSignature(rows),
    error: null,
  };
}

async function fetchRemoteSignature(): Promise<{
  signature: EstudioDataSignature | null;
  error: string | null;
}> {
  const [temasRes, cursosRes, clasesRes, segsRes, conceptosRes] = await Promise.all([
    fetchTableContentSignature(ESTUDIO_TABLE.temas),
    fetchTableContentSignature(ESTUDIO_TABLE.cursos),
    fetchTableContentSignature(ESTUDIO_TABLE.clases),
    fetchTableContentSignature(ESTUDIO_TABLE.seguimientos),
    fetchTableContentSignature(ESTUDIO_TABLE.conceptos),
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
      temas: temasRes.signature,
      cursos: cursosRes.signature,
      clases: clasesRes.signature,
      seguimientos: segsRes.signature,
      conceptos: conceptosRes.signature,
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
    temas: tableContentSignatureChanged(local.temas, remote.temas),
    cursos: tableContentSignatureChanged(local.cursos, remote.cursos),
    clases: tableContentSignatureChanged(local.clases, remote.clases),
    seguimientos: tableContentSignatureChanged(
      local.seguimientos,
      remote.seguimientos,
    ),
    conceptos: tableContentSignatureChanged(local.conceptos, remote.conceptos),
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
    writeEstudioOfflineCache({
      ...cached,
      signature: remoteSignature,
    });
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
    signature: buildSignatureFromSnapshot({
      updatedAt: "",
      userId: user.id,
      temas,
      cursos,
      clases,
      seguimientos,
      conceptos,
    }),
  };

  if (!writeEstudioOfflineCache(snapshot)) {
    return { data: null, error: "No se pudo guardar el paquete en el dispositivo." };
  }

  return { data: snapshot, error: null };
}
