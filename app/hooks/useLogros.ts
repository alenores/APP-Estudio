"use client";

import type { Logro } from "@/app/types/estudio";
import { listLogrosPorNodo, listLogrosPorNodos } from "@/lib/logros-queries";
import { useCallback, useEffect, useState } from "react";

/** Registros `logros` para explorador PC (online-first, fuera del paquete offline). */
export function useLogrosPorNodo(nodoId: number | null, enabled: boolean) {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled || nodoId == null) {
      setLogros([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await listLogrosPorNodo(nodoId);
    setLoading(false);
    if (err) {
      setError(err);
      setLogros([]);
      return;
    }
    setError(null);
    setLogros(data ?? []);
  }, [enabled, nodoId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { logros, loading, error, reload };
}

/** Conteos por nodo (cards columna nodos). */
export function useLogrosCatalog(nodoIds: number[]) {
  const [logros, setLogros] = useState<Logro[]>([]);

  const reload = useCallback(async () => {
    if (nodoIds.length === 0) {
      setLogros([]);
      return;
    }
    const { data } = await listLogrosPorNodos(nodoIds);
    setLogros(data ?? []);
  }, [nodoIds]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { logros, reload };
}
