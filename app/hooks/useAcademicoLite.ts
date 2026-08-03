"use client";

import { useCallback, useMemo, useState } from "react";
import { useEstudioData } from "@/app/hooks/useEstudioData";
import {
  buildLiteSnapshot,
  liteKey,
  type LiteEntityKind,
  type LiteItem,
  type LiteSnapshot,
} from "@/lib/academico-lite-read";
import { getSessionUserId, insertSeguimiento } from "@/lib/estudio-queries";
import type { EstadoSeguimiento } from "@/lib/estado-ui";
import type { Concepto } from "@/app/types/estudio";

export type UseAcademicoLite = {
  snapshot: LiteSnapshot;
  loading: boolean;
  error: string | null;
  syncing: boolean;
  packReady: boolean;
  hasUpdatesAvailable: boolean;
  actualizarDatos: () => Promise<void>;
  getItem: (kind: LiteEntityKind, id: number) => LiteItem | null;
  getHijos: (kind: LiteEntityKind, id: number) => LiteItem[];
  getConceptos: (kind: LiteEntityKind, id: number) => Concepto[];
  /** Único dato de seguimiento editable en lite (ADR 012). */
  guardarEstado: (
    kind: LiteEntityKind,
    id: number,
    estado: EstadoSeguimiento,
  ) => Promise<{ error: string | null }>;
  guardandoEstado: boolean;
};

/**
 * Datos de la pantalla académico lite: proyección del paquete local (ADR 001)
 * más el alta de estado, que es el único registro que la pantalla permite crear.
 */
export function useAcademicoLite(): UseAcademicoLite {
  const {
    cacheData,
    loadingPack,
    packReady,
    syncing,
    hasUpdatesAvailable,
    error,
    setError,
    actualizarDatos,
    refreshSnapshot,
  } = useEstudioData();

  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const snapshot = useMemo(() => buildLiteSnapshot(cacheData), [cacheData]);

  const getItem = useCallback(
    (kind: LiteEntityKind, id: number) =>
      snapshot.porClave.get(liteKey(kind, id)) ?? null,
    [snapshot],
  );

  const getHijos = useCallback(
    (kind: LiteEntityKind, id: number) =>
      snapshot.hijosPorClave.get(liteKey(kind, id)) ?? [],
    [snapshot],
  );

  const getConceptos = useCallback(
    (kind: LiteEntityKind, id: number) =>
      snapshot.conceptosPorClave.get(liteKey(kind, id)) ?? [],
    [snapshot],
  );

  const guardarEstado = useCallback(
    async (kind: LiteEntityKind, id: number, estado: EstadoSeguimiento) => {
      setGuardandoEstado(true);
      setError(null);
      try {
        const userId = await getSessionUserId();
        if (!userId) {
          const mensaje = "Sesión vencida. Iniciá sesión de nuevo.";
          setError(mensaje);
          return { error: mensaje };
        }

        const scope =
          kind === "tema"
            ? { tema_id: id }
            : kind === "curso"
              ? { curso_id: id }
              : { clase_id: id };

        const { error: insertError } = await insertSeguimiento(userId, {
          ...scope,
          etiqueta_estado: estado,
        });

        if (insertError) {
          setError(insertError);
          return { error: insertError };
        }

        await refreshSnapshot();
        return { error: null };
      } finally {
        setGuardandoEstado(false);
      }
    },
    [refreshSnapshot, setError],
  );

  return {
    snapshot,
    loading: loadingPack,
    error,
    syncing,
    packReady,
    hasUpdatesAvailable,
    actualizarDatos,
    getItem,
    getHijos,
    getConceptos,
    guardarEstado,
    guardandoEstado,
  };
}
