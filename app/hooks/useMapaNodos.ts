"use client";

import type { MapaNodo } from "@/app/types/mapa";
import { listMapaNodos } from "@/lib/mapa-queries";
import { useCallback, useEffect, useState } from "react";

/** Datos del mapa — separado de useEstudioData (ADR 009). Solo shell escritorio. */
export function useMapaNodos() {
  const [nodos, setNodos] = useState<MapaNodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listMapaNodos();
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setNodos(data ?? []);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { nodos, loading, error, reload };
}
