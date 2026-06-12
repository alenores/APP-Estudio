import type {
  Accion,
  DefinicionEspecifica,
  DefinicionGeneral,
} from "@/app/types/desarrollos";
import type { DesarrollosOfflineCacheData } from "@/lib/desarrollos-offline-cache";

function sortByNombre<T extends { nombre: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function listDefinicionesGeneralesFromCache(
  cache: DesarrollosOfflineCacheData,
): DefinicionGeneral[] {
  return sortByNombre(cache.definicion_general);
}

export function getDefinicionGeneralFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): DefinicionGeneral | null {
  return cache.definicion_general.find((g) => g.id === id) ?? null;
}

export function listDefinicionesEspecificasByGeneralFromCache(
  cache: DesarrollosOfflineCacheData,
  generalId: number,
): DefinicionEspecifica[] {
  return sortByNombre(
    cache.definicion_especifica.filter((e) => e.definicion_general_id === generalId),
  );
}

export function getDefinicionEspecificaFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): DefinicionEspecifica | null {
  return cache.definicion_especifica.find((e) => e.id === id) ?? null;
}

export function listAccionesByEspecificaFromCache(
  cache: DesarrollosOfflineCacheData,
  especificaId: number,
): Accion[] {
  return sortByNombre(
    cache.acciones.filter((a) => a.definicion_especifica_id === especificaId),
  );
}

export function getAccionFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): Accion | null {
  return cache.acciones.find((a) => a.id === id) ?? null;
}

export function getDefinicionGeneralDetalleFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): {
  general: DefinicionGeneral;
  especificas: DefinicionEspecifica[];
} | null {
  const general = getDefinicionGeneralFromCache(cache, id);
  if (!general) return null;
  return {
    general,
    especificas: listDefinicionesEspecificasByGeneralFromCache(cache, id),
  };
}

export function getDefinicionEspecificaDetalleFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): {
  especifica: DefinicionEspecifica;
  general: DefinicionGeneral;
  acciones: Accion[];
} | null {
  const especifica = getDefinicionEspecificaFromCache(cache, id);
  if (!especifica) return null;
  const general = getDefinicionGeneralFromCache(
    cache,
    especifica.definicion_general_id,
  );
  if (!general) return null;
  return {
    especifica,
    general,
    acciones: listAccionesByEspecificaFromCache(cache, id),
  };
}

export function getAccionDetalleFromCache(
  cache: DesarrollosOfflineCacheData,
  id: number,
): {
  accion: Accion;
  especifica: DefinicionEspecifica;
  general: DefinicionGeneral;
} | null {
  const accion = getAccionFromCache(cache, id);
  if (!accion) return null;
  const especifica = getDefinicionEspecificaFromCache(
    cache,
    accion.definicion_especifica_id,
  );
  if (!especifica) return null;
  const general = getDefinicionGeneralFromCache(
    cache,
    especifica.definicion_general_id,
  );
  if (!general) return null;
  return { accion, especifica, general };
}

export function countEspecificasByGeneralFromCache(
  cache: DesarrollosOfflineCacheData,
  generalId: number,
): number {
  return cache.definicion_especifica.filter(
    (e) => e.definicion_general_id === generalId,
  ).length;
}

export function countAccionesByEspecificaFromCache(
  cache: DesarrollosOfflineCacheData,
  especificaId: number,
): number {
  return cache.acciones.filter((a) => a.definicion_especifica_id === especificaId)
    .length;
}

export function countAccionesByGeneralFromCache(
  cache: DesarrollosOfflineCacheData,
  generalId: number,
): number {
  const especificaIds = new Set(
    cache.definicion_especifica
      .filter((e) => e.definicion_general_id === generalId)
      .map((e) => e.id),
  );
  return cache.acciones.filter((a) => especificaIds.has(a.definicion_especifica_id))
    .length;
}
