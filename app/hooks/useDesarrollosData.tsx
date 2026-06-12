"use client";

import {
  checkDesarrollosUpdatesAvailable,
  downloadDesarrollosSnapshot,
  isDesarrollosPackReady,
  readDesarrollosOfflineCache,
  type DesarrollosOfflineCacheData,
} from "@/lib/desarrollos-offline-cache";
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

export type DesarrollosDataContextValue = {
  cacheData: DesarrollosOfflineCacheData | null;
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

const DesarrollosDataContext = createContext<DesarrollosDataContextValue | null>(
  null,
);

export function DesarrollosDataProvider({ children }: { children: ReactNode }) {
  const [cacheData, setCacheData] = useState<DesarrollosOfflineCacheData | null>(
    () => readDesarrollosOfflineCache(),
  );
  const [loadingPack, setLoadingPack] = useState(
    () => !readDesarrollosOfflineCache(),
  );
  const [syncing, setSyncing] = useState(false);
  const [syncingDetail, setSyncingDetail] = useState<string | null>(null);
  const [hasUpdatesAvailable, setHasUpdatesAvailable] = useState(false);
  const [updatesCheckDone, setUpdatesCheckDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packReady = isDesarrollosPackReady(cacheData);

  const applySnapshot = useCallback((snapshot: DesarrollosOfflineCacheData | null) => {
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
      const { data, error: downloadError } = await downloadDesarrollosSnapshot();
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

    const runUpdatesCheck = async (cached: DesarrollosOfflineCacheData) => {
      if (!navigator.onLine) {
        commitRemoteSyncSession(false, setHasUpdatesAvailable, setUpdatesCheckDone);
        return;
      }

      try {
        const { hasUpdates, error: checkError } =
          await checkDesarrollosUpdatesAvailable(cached);

        if (cancelled) return;

        if (checkError) {
          commitRemoteSyncSession(
            !isDesarrollosPackReady(cached),
            setHasUpdatesAvailable,
            setUpdatesCheckDone,
          );
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
      const cached = readDesarrollosOfflineCache();
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

  const value = useMemo<DesarrollosDataContextValue>(
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
    <DesarrollosDataContext.Provider value={value}>{children}</DesarrollosDataContext.Provider>
  );
}

export function useDesarrollosData(): DesarrollosDataContextValue {
  const ctx = useContext(DesarrollosDataContext);
  if (!ctx) {
    throw new Error("useDesarrollosData debe usarse dentro de DesarrollosDataProvider");
  }
  return ctx;
}
