"use client";

import { FAB_OPEN_DELAY_MS } from "@/lib/fab-open-delay";
import { useEffect, useRef } from "react";

type FabActionButtonProps = {
  label: string;
  onClick: () => void;
};

/** FAB de una sola acción (ej. seguimiento en detalle de clase). */
export function FabActionButton({ label, onClick }: FabActionButtonProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onClick();
    }, FAB_OPEN_DELAY_MS);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-[transform,colors] duration-150 hover:bg-accent-hover active:scale-95"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </button>
  );
}
