"use client";

import type {
  DefinicionGeneral,
  EnlaceDefinicionGeneral,
} from "@/app/types/desarrollos";
import {
  listDefinicionesGeneralesLienzoMapa,
  listEnlacesDefinicionGeneral,
} from "@/lib/desarrollos-lienzo-queries";
import { useCallback, useEffect, useState } from "react";

/** Grafo lienzo desarrollos — capa 0 (ADR 011). Separado de useMapaGrafo académico. */
export function useMapaDesarrolloGrafo() {
  const [generales, setGenerales] = useState<DefinicionGeneral[]>([]);
  const [enlaces, setEnlaces] = useState<EnlaceDefinicionGeneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [generalesRes, enlacesRes] = await Promise.all([
      listDefinicionesGeneralesLienzoMapa(),
      listEnlacesDefinicionGeneral(),
    ]);
    setLoading(false);
    const err = generalesRes.error ?? enlacesRes.error;
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setGenerales(generalesRes.data ?? []);
    setEnlaces(enlacesRes.data ?? []);
  }, []);

  const patchPosicion = useCallback((id: number, pos_x: number, pos_y: number) => {
    setGenerales((prev) =>
      prev.map((g) => (g.id === id ? { ...g, pos_x, pos_y } : g)),
    );
  }, []);

  const addEnlace = useCallback((enlace: EnlaceDefinicionGeneral) => {
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
    generales,
    enlaces,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlace,
    removeEnlace,
  };
}
