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

  /** Actualiza pos_x/pos_y en memoria tras guardar en el lienzo (sin refetch). */
  const patchPosicion = useCallback(
    (id: number, pos_x: number, pos_y: number) => {
      setNodos((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pos_x, pos_y } : n)),
      );
    },
    [],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { nodos, loading, error, reload, patchPosicion };
}
