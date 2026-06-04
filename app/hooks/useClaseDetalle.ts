"use client";

import {
  claseConDerivados,
  getClaseById,
  listConceptosByClase,
  listSeguimientosByClase,
} from "@/lib/estudio-queries";
import type { ClaseConDerivados, Concepto, Seguimiento } from "@/app/types/estudio";
import { useCallback, useEffect, useState } from "react";

export function useClaseDetalle(claseId: number | null) {
  const [clase, setClase] = useState<ClaseConDerivados | null>(null);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    if (claseId == null) {
      setError("Identificador de clase inválido");
      setLoading(false);
      return;
    }

    if (!opts?.silent) setLoading(true);
    setError(null);

    const [claseRes, segsRes, conceptosRes] = await Promise.all([
      getClaseById(claseId),
      listSeguimientosByClase(claseId),
      listConceptosByClase(claseId),
    ]);

    if (claseRes.error || segsRes.error || conceptosRes.error) {
      setError(claseRes.error ?? segsRes.error ?? conceptosRes.error);
      if (!opts?.silent) setLoading(false);
      return;
    }

    if (!claseRes.data) {
      setError("Clase no encontrada");
      if (!opts?.silent) setLoading(false);
      return;
    }

    const segs = segsRes.data ?? [];
    setSeguimientos(segs);
    setConceptos(conceptosRes.data ?? []);
    setClase(claseConDerivados(claseRes.data, segs));
    if (!opts?.silent) setLoading(false);
  }, [claseId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { clase, seguimientos, conceptos, loading, error, reload };
}
