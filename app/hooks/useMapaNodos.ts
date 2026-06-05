"use client";

import type { MapaEnlace, MapaNodo } from "@/app/types/mapa";
import { listMapaEnlaces, listMapaNodos } from "@/lib/mapa-queries";
import { useCallback, useEffect, useState } from "react";

/** Datos del mapa — separado de useEstudioData (ADR 009). Solo shell escritorio. */
export function useMapaNodos() {
  const [nodos, setNodos] = useState<MapaNodo[]>([]);
  const [enlaces, setEnlaces] = useState<MapaEnlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [nodosRes, enlacesRes] = await Promise.all([
      listMapaNodos(),
      listMapaEnlaces(),
    ]);
    setLoading(false);

    const err = nodosRes.error ?? enlacesRes.error;
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setNodos(nodosRes.data ?? []);
    setEnlaces(enlacesRes.data ?? []);
  }, []);

  const patchPosicion = useCallback(
    (id: number, pos_x: number, pos_y: number) => {
      setNodos((prev) =>
        prev.map((n) => (n.id === id ? { ...n, pos_x, pos_y } : n)),
      );
    },
    [],
  );

  const addEnlace = useCallback((enlace: MapaEnlace) => {
    setEnlaces((prev) => {
      if (prev.some((e) => e.id === enlace.id)) return prev;
      return [...prev, enlace];
    });
  }, []);

  const removeEnlace = useCallback((id: number) => {
    setEnlaces((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    nodos,
    enlaces,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlace,
    removeEnlace,
  };
}
