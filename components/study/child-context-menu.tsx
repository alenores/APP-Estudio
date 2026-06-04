"use client";

import { FAB_OPEN_DELAY_MS } from "@/lib/fab-open-delay";
import { fabActionButtonClass } from "@/components/study/fab-action-styles";
import { useEffect, useId, useRef } from "react";

export type ChildQuickAction = "seguimiento" | "concepto";

type ChildContextMenuProps = {
  anchorRect: DOMRect;
  entityName: string;
  onSelect: (action: ChildQuickAction) => void;
  onClose: () => void;
};

const ACTIONS: { id: ChildQuickAction; label: string }[] = [
  { id: "seguimiento", label: "Seguimiento" },
  { id: "concepto", label: "Concepto" },
];

function menuWidth(anchorRect: DOMRect): number {
  if (typeof window === "undefined") return 320;
  const viewportPad = 16;
  const maxW = window.innerWidth - viewportPad * 2;
  const minW = 300;
  const cardW = anchorRect.width + 24;
  return Math.min(maxW, Math.max(minW, cardW, 280));
}

/**
 * Barra contextual encima de la card: dos acciones fijas, ancho adaptativo.
 */
export function ChildContextMenu({
  anchorRect,
  entityName,
  onSelect,
  onClose,
}: ChildContextMenuProps) {
  const menuId = useId();
  const pickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barWidth = menuWidth(anchorRect);
  const barHeight = 52;
  const top = Math.max(12, anchorRect.top - barHeight - 10);
  const left = Math.min(
    Math.max(8, anchorRect.left + anchorRect.width / 2 - barWidth / 2),
    typeof window !== "undefined" ? window.innerWidth - barWidth - 8 : anchorRect.left,
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (pickTimerRef.current) clearTimeout(pickTimerRef.current);
    };
  }, []);

  function pick(action: ChildQuickAction) {
    if (pickTimerRef.current) return;
    pickTimerRef.current = setTimeout(() => {
      pickTimerRef.current = null;
      onSelect(action);
    }, FAB_OPEN_DELAY_MS);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        className="fixed inset-0 z-40 bg-ink/25"
        onClick={onClose}
      />
      <div
        id={menuId}
        role="menu"
        aria-label={`Acciones para ${entityName}`}
        className="fixed z-50 grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-paper-elevated p-2.5 shadow-lg"
        style={{ top, left, width: barWidth }}
      >
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            onClick={() => pick(action.id)}
            className={`min-w-0 whitespace-nowrap ${fabActionButtonClass.solid}`}
          >
            <span className="shrink-0 text-lg leading-none">+</span>
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
