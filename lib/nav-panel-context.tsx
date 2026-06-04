"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NavPanelMotion = {
  swipeOffset: number;
  isSwiping: boolean;
  isLeaving: boolean;
  activeItemKey: string | null;
  setSwipeOffset: (value: number) => void;
  setIsSwiping: (value: boolean) => void;
  setIsLeaving: (value: boolean) => void;
  setActiveItemKey: (key: string | null) => void;
  resetSwipe: () => void;
};

const NavPanelContext = createContext<NavPanelMotion | null>(null);

export function NavPanelProvider({ children }: { children: ReactNode }) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);

  const resetSwipe = useCallback(() => {
    setSwipeOffset(0);
    setIsSwiping(false);
    setIsLeaving(false);
    setActiveItemKey(null);
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      resetSwipe();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [resetSwipe]);

  const value = useMemo<NavPanelMotion>(
    () => ({
      swipeOffset,
      isSwiping,
      isLeaving,
      activeItemKey,
      setSwipeOffset,
      setIsSwiping,
      setIsLeaving,
      setActiveItemKey,
      resetSwipe,
    }),
    [
      swipeOffset,
      isSwiping,
      isLeaving,
      activeItemKey,
      resetSwipe,
    ],
  );

  return (
    <NavPanelContext.Provider value={value}>{children}</NavPanelContext.Provider>
  );
}

export function useNavPanel(): NavPanelMotion {
  const ctx = useContext(NavPanelContext);
  if (!ctx) {
    throw new Error("useNavPanel debe usarse dentro de NavPanelProvider");
  }
  return ctx;
}

export function useNavPanelOptional(): NavPanelMotion | null {
  return useContext(NavPanelContext);
}
