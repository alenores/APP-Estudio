import { createClient } from "@/lib/supabase/client";
import {
  buildTableContentSignature,
  emptyTableContentSignature,
  tableContentSignatureChanged,
  type TableContentSignature,
} from "@/lib/estudio-table-digest";
import type {
  Accion,
  Caracteristica,
  DefinicionEspecifica,
  DefinicionGeneral,
  Pendiente,
} from "@/app/types/desarrollos";

/** Tablas ADR 011 — nombres exactos. */
export const DESARROLLOS_TABLE = {
  definicion_general: "definicion_general",
  definicion_especifica: "definicion_especifica",
  acciones: "acciones",
  caracteristicas: "caracteristicas",
  pendientes: "pendientes",
} as const;

export type DesarrollosTableName =
  (typeof DESARROLLOS_TABLE)[keyof typeof DESARROLLOS_TABLE];

export type DesarrollosTableSignature = TableContentSignature;

export type DesarrollosDataSignature = {
  definicion_general: DesarrollosTableSignature;
  definicion_especifica: DesarrollosTableSignature;
  acciones: DesarrollosTableSignature;
  caracteristicas: DesarrollosTableSignature;
  pendientes: DesarrollosTableSignature;
};

export type DesarrollosOfflineCacheData = {
  updatedAt: string;
  userId: string;
  definicion_general: DefinicionGeneral[];
  definicion_especifica: DefinicionEspecifica[];
  acciones: Accion[];
  caracteristicas: Caracteristica[];
  pendientes: Pendiente[];
  signature?: DesarrollosDataSignature;
};

export const DESARROLLOS_OFFLINE_CACHE_KEY = "app-estudio-desarrollos-cache-v1";

const NOMBRE_ASC = { ascending: true } as const;

export function readDesarrollosOfflineCache(): DesarrollosOfflineCacheData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(DESARROLLOS_OFFLINE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DesarrollosOfflineCacheData;
  } catch {
    return null;
  }
}

export function writeDesarrollosOfflineCache(data: DesarrollosOfflineCacheData): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(DESARROLLOS_OFFLINE_CACHE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearDesarrollosOfflineCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DESARROLLOS_OFFLINE_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildDesarrollosSignatureFromSnapshot(
  data: DesarrollosOfflineCacheData,
): DesarrollosDataSignature {
  return {
    definicion_general: buildTableContentSignature(data.definicion_general),
    definicion_especifica: buildTableContentSignature(data.definicion_especifica),
    acciones: buildTableContentSignature(data.acciones),
    caracteristicas: buildTableContentSignature(data.caracteristicas),
    pendientes: buildTableContentSignature(data.pendientes ?? []),
  };
}

function resolveLocalSignature(
  cached: DesarrollosOfflineCacheData,
): DesarrollosDataSignature {
  return buildDesarrollosSignatureFromSnapshot(cached);
}

function normalizeTableSignature(raw: unknown): DesarrollosTableSignature {
  if (raw && typeof raw === "object" && "digest" in raw) {
    const row = raw as Partial<DesarrollosTableSignature>;
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

export function normalizeDesarrollosSignature(
  raw: Partial<Record<DesarrollosTableName, unknown>> | undefined,
): DesarrollosDataSignature {
  return {
    definicion_general: normalizeTableSignature(raw?.definicion_general),
    definicion_especifica: normalizeTableSignature(raw?.definicion_especifica),
    acciones: normalizeTableSignature(raw?.acciones),
    caracteristicas: normalizeTableSignature(raw?.caracteristicas),
    pendientes: normalizeTableSignature(raw?.pendientes),
  };
}

function finiteId(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function fetchTableContentSignature(table: DesarrollosTableName): Promise<{
  signature: DesarrollosTableSignature;
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
  signature: DesarrollosDataSignature | null;
  error: string | null;
}> {
  const [generalRes, especificaRes, accionesRes, carRes, pendRes] = await Promise.all([
    fetchTableContentSignature(DESARROLLOS_TABLE.definicion_general),
    fetchTableContentSignature(DESARROLLOS_TABLE.definicion_especifica),
    fetchTableContentSignature(DESARROLLOS_TABLE.acciones),
    fetchTableContentSignature(DESARROLLOS_TABLE.caracteristicas),
    fetchTableContentSignature(DESARROLLOS_TABLE.pendientes),
  ]);

  const firstError =
    generalRes.error ??
    especificaRes.error ??
    accionesRes.error ??
    carRes.error ??
    pendRes.error;

  if (firstError) {
    return { signature: null, error: firstError };
  }

  return {
    signature: {
      definicion_general: generalRes.signature,
      definicion_especifica: especificaRes.signature,
      acciones: accionesRes.signature,
      caracteristicas: carRes.signature,
      pendientes: pendRes.signature,
    },
    error: null,
  };
}

export type DesarrollosChangedTables = {
  definicion_general: boolean;
  definicion_especifica: boolean;
  acciones: boolean;
  caracteristicas: boolean;
  pendientes: boolean;
};

function buildChangedTables(
  local: DesarrollosDataSignature,
  remote: DesarrollosDataSignature,
): DesarrollosChangedTables {
  return {
    definicion_general: tableContentSignatureChanged(
      local.definicion_general,
      remote.definicion_general,
    ),
    definicion_especifica: tableContentSignatureChanged(
      local.definicion_especifica,
      remote.definicion_especifica,
    ),
    acciones: tableContentSignatureChanged(local.acciones, remote.acciones),
    caracteristicas: tableContentSignatureChanged(
      local.caracteristicas,
      remote.caracteristicas,
    ),
    pendientes: tableContentSignatureChanged(local.pendientes, remote.pendientes),
  };
}

export async function checkDesarrollosUpdatesAvailable(
  cached: DesarrollosOfflineCacheData,
): Promise<{
  hasUpdates: boolean;
  error: string | null;
  changedTables: DesarrollosChangedTables;
  remoteSignature: DesarrollosDataSignature | null;
}> {
  const { signature: remoteSignature, error } = await fetchRemoteSignature();

  if (error || !remoteSignature) {
    return {
      hasUpdates: false,
      error,
      changedTables: {
        definicion_general: false,
        definicion_especifica: false,
        acciones: false,
        caracteristicas: false,
        pendientes: false,
      },
      remoteSignature: null,
    };
  }

  const localSignature = resolveLocalSignature(cached);
  const changedTables = buildChangedTables(localSignature, remoteSignature);
  const hasUpdates = Object.values(changedTables).some(Boolean);

  if (!hasUpdates) {
    writeDesarrollosOfflineCache({
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

export function isDesarrollosPackReady(
  cache: DesarrollosOfflineCacheData | null,
): boolean {
  if (!cache?.userId) return false;
  return (
    cache.definicion_general.length > 0 ||
    cache.definicion_especifica.length > 0 ||
    cache.acciones.length > 0
  );
}

export async function downloadDesarrollosSnapshot(): Promise<{
  data: DesarrollosOfflineCacheData | null;
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

  const [generalRes, especificaRes, accionesRes, carRes, pendRes] = await Promise.all([
    supabase
      .from(DESARROLLOS_TABLE.definicion_general)
      .select("*")
      .order("nombre", NOMBRE_ASC),
    supabase
      .from(DESARROLLOS_TABLE.definicion_especifica)
      .select("*")
      .order("nombre", NOMBRE_ASC),
    supabase.from(DESARROLLOS_TABLE.acciones).select("*").order("nombre", NOMBRE_ASC),
    supabase.from(DESARROLLOS_TABLE.caracteristicas).select("*").order("id", NOMBRE_ASC),
    supabase.from(DESARROLLOS_TABLE.pendientes).select("*").order("id", NOMBRE_ASC),
  ]);

  const firstError =
    generalRes.error?.message ??
    especificaRes.error?.message ??
    accionesRes.error?.message ??
    carRes.error?.message ??
    pendRes.error?.message;

  if (firstError) {
    return { data: null, error: firstError };
  }

  const definicion_general = (generalRes.data ?? []) as DefinicionGeneral[];
  const definicion_especifica = (especificaRes.data ?? []) as DefinicionEspecifica[];
  const acciones = (accionesRes.data ?? []) as Accion[];
  const caracteristicas = (carRes.data ?? []) as Caracteristica[];
  const pendientes = (pendRes.data ?? []) as Pendiente[];

  const snapshot: DesarrollosOfflineCacheData = {
    updatedAt: new Date().toISOString(),
    userId: user.id,
    definicion_general,
    definicion_especifica,
    acciones,
    caracteristicas,
    pendientes,
    signature: buildDesarrollosSignatureFromSnapshot({
      updatedAt: "",
      userId: user.id,
      definicion_general,
      definicion_especifica,
      acciones,
      caracteristicas,
      pendientes,
    }),
  };

  if (!writeDesarrollosOfflineCache(snapshot)) {
    return { data: null, error: "No se pudo guardar el paquete en el dispositivo." };
  }

  return { data: snapshot, error: null };
}
