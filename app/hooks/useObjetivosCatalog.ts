"use client";

import type { MapaObjetivo } from "@/app/types/mapa";
import { listMapaObjetivos } from "@/lib/mapa-queries";
import { mapaObjetivosOrdenados } from "@/lib/mapa-objetivo";
import { useEffect, useState } from "react";

export function useObjetivosCatalog() {
  const [objetivos, setObjetivos] = useState<MapaObjetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      const { data, error: err } = await listMapaObjetivos();
      if (cancelled) return;
      if (err) {
        setError(err);
        setObjetivos([]);
      } else {
        setError(null);
        setObjetivos(data ? mapaObjetivosOrdenados(data) : []);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { objetivos, loading, error };
}
