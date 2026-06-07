"use client";

import type {
  EnlaceHijoNodo,
  LienzoHijoPosicion,
  MapaDetalleHijo,
  MapaDetalleHijoKind,
  MapaDetalleScope,
} from "@/lib/mapa-detalle-types";
import { listEnlacesHijosNodos } from "@/lib/mapa-detalle-enlace-queries";
import { listLienzoHijosPosiciones } from "@/lib/mapa-detalle-posicion-queries";
import { listMapaDetalleHijos } from "@/lib/mapa-detalle-queries";
import { useCallback, useEffect, useState } from "react";

/** Hijos, enlaces y posiciones del lienzo detalle — online (ADR 009/010). */
export function useMapaDetalleHijos(scope: MapaDetalleScope | null) {
  const [hijos, setHijos] = useState<MapaDetalleHijo[]>([]);
  const [enlaces, setEnlaces] = useState<EnlaceHijoNodo[]>([]);
  const [posiciones, setPosiciones] = useState<LienzoHijoPosicion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (scope == null) {
      setHijos([]);
      setEnlaces([]);
      setPosiciones([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [hijosRes, enlacesRes, posicionesRes] = await Promise.all([
      listMapaDetalleHijos(scope),
      listEnlacesHijosNodos(scope),
      listLienzoHijosPosiciones(scope),
    ]);
    setLoading(false);

    const err =
      hijosRes.error ?? enlacesRes.error ?? posicionesRes.error;
    if (err) {
      setError(err);
      setHijos([]);
      setEnlaces([]);
      setPosiciones([]);
      return;
    }
    setError(null);
    setHijos(hijosRes.data ?? []);
    setEnlaces(enlacesRes.data ?? []);
    setPosiciones(posicionesRes.data ?? []);
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

  const savePosicion = useCallback(
    (kind: MapaDetalleHijoKind, id: number, pos_x: number, pos_y: number) => {
      setPosiciones((prev) => {
        const idx = prev.findIndex(
          (p) => p.hijo_kind === kind && p.hijo_id === id,
        );
        const next: LienzoHijoPosicion = {
          hijo_kind: kind,
          hijo_id: id,
          pos_x,
          pos_y,
        };
        if (idx === -1) return [...prev, next];
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      });
    },
    [],
  );

  return {
    hijos,
    enlaces,
    posiciones,
    loading,
    error,
    reload,
    addEnlace,
    removeEnlace,
    savePosicion,
  };
}
