"use client";

import {
  checkEstudioUpdatesAvailable,
  downloadEstudioSnapshot,
  isEstudioPackReady,
  readEstudioOfflineCache,
  type EstudioOfflineCacheData,
} from "@/lib/estudio-offline-cache";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const LOADING_PACK_SAFETY_MS = 3000;

const remoteSyncSession = {
  completed: false,
  hasUpdatesAvailable: false,
  updatesCheckDone: false,
};

function commitRemoteSyncSession(
  hasUpdatesAvailable: boolean,
  setHasUpdatesAvailable: (v: boolean) => void,
  setUpdatesCheckDone: (v: boolean) => void,
) {
  remoteSyncSession.completed = true;
  remoteSyncSession.hasUpdatesAvailable = hasUpdatesAvailable;
  remoteSyncSession.updatesCheckDone = true;
  setHasUpdatesAvailable(hasUpdatesAvailable);
  setUpdatesCheckDone(true);
}

export type EstudioDataContextValue = {
  cacheData: EstudioOfflineCacheData | null;
  packReady: boolean;
  loadingPack: boolean;
  syncing: boolean;
  syncingDetail: string | null;
  hasUpdatesAvailable: boolean;
  updatesCheckDone: boolean;
  error: string | null;
  setError: (value: string | null) => void;
  actualizarDatos: () => Promise<void>;
  refreshSnapshot: () => Promise<void>;
};

const EstudioDataContext = createContext<EstudioDataContextValue | null>(null);

export function EstudioDataProvider({ children }: { children: ReactNode }) {
  const [cacheData, setCacheData] = useState<EstudioOfflineCacheData | null>(() =>
    readEstudioOfflineCache(),
  );
  const [loadingPack, setLoadingPack] = useState(() => !readEstudioOfflineCache());
  const [syncing, setSyncing] = useState(false);
  const [syncingDetail, setSyncingDetail] = useState<string | null>(null);
  const [hasUpdatesAvailable, setHasUpdatesAvailable] = useState(false);
  const [updatesCheckDone, setUpdatesCheckDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packReady = isEstudioPackReady(cacheData);

  const applySnapshot = useCallback((snapshot: EstudioOfflineCacheData | null) => {
    setCacheData(snapshot);
  }, []);

  const refreshSnapshot = useCallback(async () => {
    if (!navigator.onLine) {
      setError("Sin conexión. Conectate para actualizar los datos.");
      return;
    }

    setSyncing(true);
    setSyncingDetail("Descargando datos…");
    setError(null);

    try {
      const { data, error: downloadError } = await downloadEstudioSnapshot();
      if (downloadError) {
        setError(downloadError);
        return;
      }
      if (data) {
        applySnapshot(data);
        setHasUpdatesAvailable(false);
        remoteSyncSession.hasUpdatesAvailable = false;
      }
    } finally {
      setSyncing(false);
      setSyncingDetail(null);
    }
  }, [applySnapshot]);

  const actualizarDatos = refreshSnapshot;

  useEffect(() => {
    const safety = window.setTimeout(() => {
      setLoadingPack(false);
    }, LOADING_PACK_SAFETY_MS);
    return () => window.clearTimeout(safety);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runUpdatesCheck = async (cached: EstudioOfflineCacheData) => {
      if (!navigator.onLine) {
        commitRemoteSyncSession(false, setHasUpdatesAvailable, setUpdatesCheckDone);
        return;
      }

      try {
        const { hasUpdates, error: checkError } =
          await checkEstudioUpdatesAvailable(cached);

        if (cancelled) return;

        if (checkError) {
          commitRemoteSyncSession(!isEstudioPackReady(cached), setHasUpdatesAvailable, setUpdatesCheckDone);
          return;
        }

        commitRemoteSyncSession(hasUpdates, setHasUpdatesAvailable, setUpdatesCheckDone);
      } catch {
        if (!cancelled) {
          commitRemoteSyncSession(false, setHasUpdatesAvailable, setUpdatesCheckDone);
        }
      }
    };

    const bootstrap = async () => {
      setError(null);
      const cached = readEstudioOfflineCache();
      if (cached) {
        applySnapshot(cached);
      }
      setLoadingPack(false);

      if (remoteSyncSession.completed) {
        setHasUpdatesAvailable(remoteSyncSession.hasUpdatesAvailable);
        setUpdatesCheckDone(remoteSyncSession.updatesCheckDone);
        return;
      }

      if (cached) {
        await runUpdatesCheck(cached);
      } else {
        commitRemoteSyncSession(true, setHasUpdatesAvailable, setUpdatesCheckDone);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  const value = useMemo<EstudioDataContextValue>(
    () => ({
      cacheData,
      packReady,
      loadingPack,
      syncing,
      syncingDetail,
      hasUpdatesAvailable,
      updatesCheckDone,
      error,
      setError,
      actualizarDatos,
      refreshSnapshot,
    }),
    [
      cacheData,
      packReady,
      loadingPack,
      syncing,
      syncingDetail,
      hasUpdatesAvailable,
      updatesCheckDone,
      error,
      actualizarDatos,
      refreshSnapshot,
    ],
  );

  return (
    <EstudioDataContext.Provider value={value}>{children}</EstudioDataContext.Provider>
  );
}

export function useEstudioData(): EstudioDataContextValue {
  const ctx = useContext(EstudioDataContext);
  if (!ctx) {
    throw new Error("useEstudioData debe usarse dentro de EstudioDataProvider");
  }
  return ctx;
}
