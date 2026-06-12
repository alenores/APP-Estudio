"use client";

import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import {
  countAccionesByEspecificaFromCache,
  countAccionesByGeneralFromCache,
  countEspecificasByGeneralFromCache,
  getAccionFromCache,
  getDefinicionEspecificaFromCache,
  getDefinicionGeneralFromCache,
  listAccionesByEspecificaFromCache,
  listDefinicionesEspecificasByGeneralFromCache,
  listDefinicionesGeneralesFromCache,
} from "@/lib/desarrollos-offline-read";
import type {
  Accion,
  DefinicionEspecifica,
  DefinicionGeneral,
} from "@/app/types/desarrollos";
import { useMemo } from "react";

export type DesarrollosExplorerSelection = {
  generalId: number | null;
  especificaId: number | null;
  accionId: number | null;
};

function parseId(value: string | null): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseDesarrollosExplorerSelection(
  params: URLSearchParams,
): DesarrollosExplorerSelection {
  return {
    generalId: parseId(params.get("general")),
    especificaId: parseId(params.get("especifica")),
    accionId: parseId(params.get("accion")),
  };
}

export function desarrollosExplorerHref(
  selection: DesarrollosExplorerSelection,
): string {
  const params = new URLSearchParams();
  if (selection.generalId != null) {
    params.set("general", String(selection.generalId));
  }
  if (selection.especificaId != null) {
    params.set("especifica", String(selection.especificaId));
  }
  if (selection.accionId != null) {
    params.set("accion", String(selection.accionId));
  }
  const q = params.toString();
  return q ? `/explorador-desarrollos?${q}` : "/explorador-desarrollos";
}

export function normalizeDesarrollosExplorerSelection(
  cache: NonNullable<ReturnType<typeof useDesarrollosData>["cacheData"]>,
  raw: DesarrollosExplorerSelection,
): DesarrollosExplorerSelection {
  let { generalId, especificaId, accionId } = raw;

  if (accionId != null) {
    const accion = getAccionFromCache(cache, accionId);
    if (!accion) {
      accionId = null;
    } else {
      especificaId = accion.definicion_especifica_id;
      const especifica = getDefinicionEspecificaFromCache(cache, especificaId);
      generalId = especifica?.definicion_general_id ?? null;
    }
  } else if (especificaId != null) {
    accionId = null;
    const especifica = getDefinicionEspecificaFromCache(cache, especificaId);
    if (!especifica) {
      especificaId = null;
    } else {
      generalId = especifica.definicion_general_id;
    }
  }

  if (generalId != null && !getDefinicionGeneralFromCache(cache, generalId)) {
    generalId = null;
    especificaId = null;
    accionId = null;
  }

  if (especificaId != null && generalId != null) {
    const especifica = getDefinicionEspecificaFromCache(cache, especificaId);
    if (!especifica || especifica.definicion_general_id !== generalId) {
      especificaId = null;
      accionId = null;
    }
  }

  if (accionId != null && especificaId != null) {
    const accion = getAccionFromCache(cache, accionId);
    if (!accion || accion.definicion_especifica_id !== especificaId) {
      accionId = null;
    }
  }

  return { generalId, especificaId, accionId };
}

export function useDesarrollosExplorer(selection: DesarrollosExplorerSelection) {
  const { cacheData, packReady, loadingPack, error, refreshSnapshot } =
    useDesarrollosData();

  const normalized = useMemo(
    () =>
      cacheData
        ? normalizeDesarrollosExplorerSelection(cacheData, selection)
        : { generalId: null, especificaId: null, accionId: null },
    [cacheData, selection],
  );

  const generales: DefinicionGeneral[] = useMemo(
    () => (cacheData ? listDefinicionesGeneralesFromCache(cacheData) : []),
    [cacheData],
  );

  const especificas: DefinicionEspecifica[] = useMemo(() => {
    if (!cacheData || normalized.generalId == null) return [];
    return listDefinicionesEspecificasByGeneralFromCache(
      cacheData,
      normalized.generalId,
    );
  }, [cacheData, normalized.generalId]);

  const acciones: Accion[] = useMemo(() => {
    if (!cacheData || normalized.especificaId == null) return [];
    return listAccionesByEspecificaFromCache(cacheData, normalized.especificaId);
  }, [cacheData, normalized.especificaId]);

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

  const accionesCountByEspecifica = useMemo(() => {
    const map = new Map<number, number>();
    if (!cacheData) return map;
    for (const e of cacheData.definicion_especifica) {
      map.set(e.id, countAccionesByEspecificaFromCache(cacheData, e.id));
    }
    return map;
  }, [cacheData]);

  return {
    generales,
    especificas,
    acciones,
    especificasCountByGeneral,
    accionesCountByGeneral,
    accionesCountByEspecifica,
    selection: normalized,
    loading: loadingPack,
    error,
    packReady,
    reload: refreshSnapshot,
  };
}
