"use client";

import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import {
  countAccionesByEspecificaFromCache,
  countAccionesByGeneralFromCache,
  countEspecificasByGeneralFromCache,
  listDefinicionesGeneralesFromCache,
} from "@/lib/desarrollos-offline-read";
import type { DefinicionGeneral } from "@/app/types/desarrollos";
import { useMemo } from "react";

export function useDefinicionesGeneralesList() {
  const { cacheData, loadingPack, error, setError, refreshSnapshot } =
    useDesarrollosData();

  const generales: DefinicionGeneral[] = useMemo(() => {
    if (!cacheData) return [];
    return listDefinicionesGeneralesFromCache(cacheData);
  }, [cacheData]);

  const especificasCountByGeneral = useMemo(() => {
    const map = new Map<number, number>();
    if (!cacheData) return map;
    for (const g of generales) {
      map.set(g.id, countEspecificasByGeneralFromCache(cacheData, g.id));
    }
    return map;
  }, [cacheData, generales]);

  const accionesCountByGeneral = useMemo(() => {
    const map = new Map<number, number>();
    if (!cacheData) return map;
    for (const g of generales) {
      map.set(g.id, countAccionesByGeneralFromCache(cacheData, g.id));
    }
    return map;
  }, [cacheData, generales]);

  return {
    generales,
    especificasCountByGeneral,
    accionesCountByGeneral,
    loading: loadingPack,
    error,
    setError,
    reload: refreshSnapshot,
  };
}

export function useDefinicionGeneralDetalle(id: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useDesarrollosData();

  const detalle = useMemo(() => {
    if (!cacheData || id == null) return null;
    const general = cacheData.definicion_general.find((g) => g.id === id) ?? null;
    if (!general) return null;
    const especificas = cacheData.definicion_especifica
      .filter((e) => e.definicion_general_id === id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return { general, especificas };
  }, [cacheData, id]);

  const accionesCountByEspecifica = useMemo(() => {
    const map = new Map<number, number>();
    if (!cacheData || !detalle) return map;
    for (const e of detalle.especificas) {
      map.set(e.id, countAccionesByEspecificaFromCache(cacheData, e.id));
    }
    return map;
  }, [cacheData, detalle]);

  return {
    general: detalle?.general ?? null,
    especificas: detalle?.especificas ?? [],
    accionesCountByEspecifica,
    loading: loadingPack,
    error,
    reload: refreshSnapshot,
  };
}

export function useDefinicionEspecificaDetalle(id: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useDesarrollosData();

  const detalle = useMemo(() => {
    if (!cacheData || id == null) return null;
    const especifica =
      cacheData.definicion_especifica.find((e) => e.id === id) ?? null;
    if (!especifica) return null;
    const general =
      cacheData.definicion_general.find(
        (g) => g.id === especifica.definicion_general_id,
      ) ?? null;
    if (!general) return null;
    const acciones = cacheData.acciones
      .filter((a) => a.definicion_especifica_id === id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return { especifica, general, acciones };
  }, [cacheData, id]);

  return {
    especifica: detalle?.especifica ?? null,
    general: detalle?.general ?? null,
    acciones: detalle?.acciones ?? [],
    loading: loadingPack,
    error,
    reload: refreshSnapshot,
  };
}

export function useAccionDetalle(id: number | null) {
  const { cacheData, loadingPack, error, refreshSnapshot } = useDesarrollosData();

  const detalle = useMemo(() => {
    if (!cacheData || id == null) return null;
    const accion = cacheData.acciones.find((a) => a.id === id) ?? null;
    if (!accion) return null;
    const especifica =
      cacheData.definicion_especifica.find(
        (e) => e.id === accion.definicion_especifica_id,
      ) ?? null;
    if (!especifica) return null;
    const general =
      cacheData.definicion_general.find(
        (g) => g.id === especifica.definicion_general_id,
      ) ?? null;
    if (!general) return null;
    return { accion, especifica, general };
  }, [cacheData, id]);

  return {
    accion: detalle?.accion ?? null,
    especifica: detalle?.especifica ?? null,
    general: detalle?.general ?? null,
    loading: loadingPack,
    error,
    reload: refreshSnapshot,
  };
}
