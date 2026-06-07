"use client";

import type { MapaNodo } from "@/app/types/mapa";
import { listMapaNodos } from "@/lib/mapa-queries";
import { useEffect, useState } from "react";

/** Catálogo de nodos objetivo para explorador PC (ADR 009 + estudio). */
export function useNodosObjetivos() {
  const [nodos, setNodos] = useState<MapaNodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      const { data, error: err } = await listMapaNodos();
      if (cancelled) return;
      if (err) {
        setError(err);
        setNodos([]);
      } else {
        setError(null);
        setNodos(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { nodos, loading, error };
}
