"use client";

import type {
  MapaDetalleHijo,
  MapaDetalleScope,
} from "@/lib/mapa-detalle-types";
import { listMapaDetalleHijos } from "@/lib/mapa-detalle-queries";
import { useCallback, useEffect, useState } from "react";

/** Hijos del lienzo detalle — online, fuera de useEstudioData (ADR 009/010). */
export function useMapaDetalleHijos(scope: MapaDetalleScope | null) {
  const [hijos, setHijos] = useState<MapaDetalleHijo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (scope == null) {
      setHijos([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await listMapaDetalleHijos(scope);
    setLoading(false);
    if (err) {
      setError(err);
      setHijos([]);
      return;
    }
    setError(null);
    setHijos(data ?? []);
  }, [scope]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { hijos, loading, error, reload };
}
