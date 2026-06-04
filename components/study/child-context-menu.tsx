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

/**
 * Barra contextual encima de la card (opción B): seguimiento / concepto del hijo.
 */
export function ChildContextMenu({
  anchorRect,
  entityName,
  onSelect,
  onClose,
}: ChildContextMenuProps) {
  const menuId = useId();
  const pickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barWidth = 260;
  const barHeight = 48;
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
        className="fixed z-50 flex gap-2 rounded-2xl border border-border bg-paper-elevated p-2 shadow-lg"
        style={{ top, left, width: barWidth }}
      >
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            onClick={() => pick(action.id)}
            className={`flex-1 justify-center ${fabActionButtonClass.solid}`}
          >
            <span className="text-lg leading-none">+</span>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );
}
