"use client";

import type {
  EnlaceHijoNodo,
  MapaDetalleHijo,
  MapaDetalleScope,
} from "@/lib/mapa-detalle-types";
import { listEnlacesHijosNodos } from "@/lib/mapa-detalle-enlace-queries";
import { listMapaDetalleHijos } from "@/lib/mapa-detalle-queries";
import { useCallback, useEffect, useState } from "react";

/** Hijos + enlaces del lienzo detalle — online, fuera de useEstudioData (ADR 009/010). */
export function useMapaDetalleHijos(scope: MapaDetalleScope | null) {
  const [hijos, setHijos] = useState<MapaDetalleHijo[]>([]);
  const [enlaces, setEnlaces] = useState<EnlaceHijoNodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (scope == null) {
      setHijos([]);
      setEnlaces([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [hijosRes, enlacesRes] = await Promise.all([
      listMapaDetalleHijos(scope),
      listEnlacesHijosNodos(scope),
    ]);
    setLoading(false);

    const err = hijosRes.error ?? enlacesRes.error;
    if (err) {
      setError(err);
      setHijos([]);
      setEnlaces([]);
      return;
    }
    setError(null);
    setHijos(hijosRes.data ?? []);
    setEnlaces(enlacesRes.data ?? []);
  }, [scope]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addEnlace = useCallback((enlace: EnlaceHijoNodo) => {
    setEnlaces((prev) => {
      if (prev.some((e) => e.id === enlace.id)) return prev;
      return [...prev, enlace];
    });
  }, []);

  const removeEnlace = useCallback((id: number) => {
    setEnlaces((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { hijos, enlaces, loading, error, reload, addEnlace, removeEnlace };
}
