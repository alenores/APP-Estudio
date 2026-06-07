"use client";

import type { MapaGrafoModo } from "@/lib/mapa-lienzo-types";
import type { EnlaceTema, Tema } from "@/app/types/estudio";
import type { MapaEnlace, MapaNodo, MapaObjetivo } from "@/app/types/mapa";
import {
  listMapaEnlaces,
  listMapaNodos,
  listMapaObjetivos,
} from "@/lib/mapa-queries";
import {
  listEnlacesTemas,
  listTemasLienzo,
} from "@/lib/temas-lienzo-queries";
import { useCallback, useEffect, useState } from "react";

/** Datos del mapa dual — separado de useEstudioData (ADR 009). Solo shell escritorio. */
export function useMapaGrafo(modo: MapaGrafoModo) {
  const [nodos, setNodos] = useState<MapaNodo[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [enlacesNodos, setEnlacesNodos] = useState<MapaEnlace[]>([]);
  const [enlacesTemas, setEnlacesTemas] = useState<EnlaceTema[]>([]);
  const [objetivos, setObjetivos] = useState<MapaObjetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    if (modo === "nodos") {
      const [nodosRes, enlacesRes, objetivosRes] = await Promise.all([
        listMapaNodos(),
        listMapaEnlaces(),
        listMapaObjetivos(),
      ]);
      setLoading(false);
      const err = nodosRes.error ?? enlacesRes.error ?? objetivosRes.error;
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setNodos(nodosRes.data ?? []);
      setEnlacesNodos(enlacesRes.data ?? []);
      setObjetivos(objetivosRes.data ?? []);
      return;
    }

    const [temasRes, enlacesRes] = await Promise.all([
      listTemasLienzo(),
      listEnlacesTemas(),
    ]);
    setLoading(false);
    const err = temasRes.error ?? enlacesRes.error;
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setTemas(temasRes.data ?? []);
    setEnlacesTemas(enlacesRes.data ?? []);
  }, [modo]);

  const patchPosicion = useCallback(
    (id: number, pos_x: number, pos_y: number) => {
      if (modo === "nodos") {
        setNodos((prev) =>
          prev.map((n) => (n.id === id ? { ...n, pos_x, pos_y } : n)),
        );
      } else {
        setTemas((prev) =>
          prev.map((t) => (t.id === id ? { ...t, pos_x, pos_y } : t)),
        );
      }
    },
    [modo],
  );

  const addEnlaceNodo = useCallback((enlace: MapaEnlace) => {
    setEnlacesNodos((prev) => {
      if (prev.some((e) => e.id === enlace.id)) return prev;
      return [...prev, enlace];
    });
  }, []);

  const addEnlaceTema = useCallback((enlace: EnlaceTema) => {
    setEnlacesTemas((prev) => {
      if (prev.some((e) => e.id === enlace.id)) return prev;
      return [...prev, enlace];
    });
  }, []);

  const removeEnlaceNodo = useCallback((id: number) => {
    setEnlacesNodos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const removeEnlaceTema = useCallback((id: number) => {
    setEnlacesTemas((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    modo,
    nodos,
    temas,
    enlaces: modo === "nodos" ? enlacesNodos : enlacesTemas,
    enlacesNodos,
    enlacesTemas,
    objetivos,
    loading,
    error,
    reload,
    patchPosicion,
    addEnlaceNodo,
    addEnlaceTema,
    removeEnlaceNodo,
    removeEnlaceTema,
  };
}
