"use client";

import type { Accion, EnlaceDesarrolloAccion } from "@/app/types/desarrollos";
import type { MapaDesarrolloDetalleScope } from "@/lib/desarrollos-lienzo-types";
import {
  listEnlacesDesarrolloAcciones,
  listLienzoDesarrolloAccionesPosiciones,
} from "@/lib/desarrollos-lienzo-queries";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { useCallback, useEffect, useMemo, useState } from "react";

/** Overlay capa 1 — acciones bajo un definicion_general (ADR 011). */
export function useMapaDesarrollosDetalle(scope: MapaDesarrolloDetalleScope | null) {
  const { cacheData } = useDesarrollosData();
  const [enlaces, setEnlaces] = useState<EnlaceDesarrolloAccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acciones: Accion[] = useMemo(() => {
    if (!cacheData || scope == null) return [];
    const especificaIds = cacheData.definicion_especifica
      .filter((e) => e.definicion_general_id === scope.definicionGeneralId)
      .map((e) => e.id);
    return cacheData.acciones
      .filter((a) => especificaIds.includes(a.definicion_especifica_id))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [cacheData, scope]);

  const reload = useCallback(async () => {
    if (scope == null) return;
    setLoading(true);
    const { data, error: err } = await listEnlacesDesarrolloAcciones(
      scope.definicionGeneralId,
    );
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setEnlaces(data ?? []);
    void listLienzoDesarrolloAccionesPosiciones(scope.definicionGeneralId);
  }, [scope]);

  useEffect(() => {
    if (scope == null) {
      setEnlaces([]);
      return;
    }
    void reload();
  }, [scope, reload]);

  return { acciones, enlaces, loading, error, reload, setEnlaces };
}
