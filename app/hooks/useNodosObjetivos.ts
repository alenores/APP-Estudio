"use client";

import type { MapaNodo } from "@/app/types/mapa";
import { listMapaNodos } from "@/lib/mapa-queries";
import { useCallback, useEffect, useState } from "react";

/** Catálogo de nodos objetivo para explorador PC (ADR 009 + estudio). */
export function useNodosObjetivos() {
  const [nodos, setNodos] = useState<MapaNodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await listMapaNodos();
    if (err) {
      setError(err);
      setNodos([]);
    } else {
      setError(null);
      setNodos(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { nodos, loading, error, reload };
}
