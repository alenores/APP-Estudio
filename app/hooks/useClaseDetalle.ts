"use client";

import {
  claseConDerivados,
  getClaseById,
  listSeguimientosByClase,
} from "@/lib/estudio-queries";
import type { ClaseConDerivados, Seguimiento } from "@/app/types/estudio";
import { useCallback, useEffect, useState } from "react";

export function useClaseDetalle(claseId: number | null) {
  const [clase, setClase] = useState<ClaseConDerivados | null>(null);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (claseId == null) {
      setError("Identificador de clase inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [claseRes, segsRes] = await Promise.all([
      getClaseById(claseId),
      listSeguimientosByClase(claseId),
    ]);

    if (claseRes.error || segsRes.error) {
      setError(claseRes.error ?? segsRes.error);
      setLoading(false);
      return;
    }

    if (!claseRes.data) {
      setError("Clase no encontrada");
      setLoading(false);
      return;
    }

    const segs = segsRes.data ?? [];
    setSeguimientos(segs);
    setClase(claseConDerivados(claseRes.data, segs));
    setLoading(false);
  }, [claseId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { clase, seguimientos, loading, error, reload };
}
