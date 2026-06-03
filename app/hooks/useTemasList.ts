"use client";

import { listTemasConDerivados } from "@/lib/estudio-queries";
import type { TemaConDerivados } from "@/app/types/estudio";
import { useCallback, useEffect, useState } from "react";

export function useTemasList() {
  const [temas, setTemas] = useState<TemaConDerivados[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await listTemasConDerivados();
    setTemas(result.data ?? []);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { temas, loading, error, reload };
}
