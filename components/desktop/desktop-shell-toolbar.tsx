"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const ToolbarSlotContext = createContext<HTMLElement | null>(null);

export function DesktopShellToolbarSlotProvider({
  slot,
  children,
}: {
  slot: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <ToolbarSlotContext.Provider value={slot}>
      {children}
    </ToolbarSlotContext.Provider>
  );
}

/** Acciones del mapa en la barra compartida del shell (solo /mapa). */
export function DesktopShellToolbar({ children }: { children: ReactNode }) {
  const slot = useContext(ToolbarSlotContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !slot) return null;
  return createPortal(children, slot);
}
