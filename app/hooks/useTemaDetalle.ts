"use client";

import {
  attachDerivadosToCursos,
  getTemaById,
  listCursosByTema,
  listSeguimientosByTema,
  temaConDerivados,
} from "@/lib/estudio-queries";
import type { CursoConDerivados, Seguimiento, TemaConDerivados } from "@/app/types/estudio";
import { useCallback, useEffect, useState } from "react";

export function useTemaDetalle(temaId: number | null) {
  const [tema, setTema] = useState<TemaConDerivados | null>(null);
  const [cursos, setCursos] = useState<CursoConDerivados[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (temaId == null) {
      setError("Identificador de tema inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [temaRes, cursosRes, segsRes] = await Promise.all([
      getTemaById(temaId),
      listCursosByTema(temaId),
      listSeguimientosByTema(temaId),
    ]);

    if (temaRes.error || cursosRes.error || segsRes.error) {
      setError(temaRes.error ?? cursosRes.error ?? segsRes.error);
      setLoading(false);
      return;
    }

    if (!temaRes.data) {
      setError("Tema no encontrado");
      setLoading(false);
      return;
    }

    const segs = segsRes.data ?? [];
    setSeguimientos(segs);
    setTema(temaConDerivados(temaRes.data, segs));

    const withDeriv = await attachDerivadosToCursos(cursosRes.data ?? []);
    if (withDeriv.error) {
      setError(withDeriv.error);
    } else {
      setCursos(withDeriv.data);
    }

    setLoading(false);
  }, [temaId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tema, cursos, seguimientos, loading, error, reload };
}
