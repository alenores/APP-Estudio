"use client";

import {
  attachDerivadosToClases,
  cursoConDerivados,
  getCursoById,
  listClasesByCurso,
  listSeguimientosByCurso,
} from "@/lib/estudio-queries";
import type { ClaseConDerivados, CursoConDerivados, Seguimiento } from "@/app/types/estudio";
import { useCallback, useEffect, useState } from "react";

export function useCursoDetalle(cursoId: number | null) {
  const [curso, setCurso] = useState<CursoConDerivados | null>(null);
  const [clases, setClases] = useState<ClaseConDerivados[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (cursoId == null) {
      setError("Identificador de curso inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [cursoRes, clasesRes, segsRes] = await Promise.all([
      getCursoById(cursoId),
      listClasesByCurso(cursoId),
      listSeguimientosByCurso(cursoId),
    ]);

    if (cursoRes.error || clasesRes.error || segsRes.error) {
      setError(cursoRes.error ?? clasesRes.error ?? segsRes.error);
      setLoading(false);
      return;
    }

    if (!cursoRes.data) {
      setError("Curso no encontrado");
      setLoading(false);
      return;
    }

    const segs = segsRes.data ?? [];
    setSeguimientos(segs);
    setCurso(cursoConDerivados(cursoRes.data, segs));

    const withDeriv = await attachDerivadosToClases(clasesRes.data ?? []);
    if (withDeriv.error) {
      setError(withDeriv.error);
    } else {
      setClases(withDeriv.data);
    }

    setLoading(false);
  }, [cursoId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { curso, clases, seguimientos, loading, error, reload };
}
