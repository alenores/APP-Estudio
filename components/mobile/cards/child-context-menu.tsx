"use client";

import { FAB_OPEN_DELAY_MS } from "@/lib/fab-open-delay";
import { fabActionClassForId } from "@/components/mobile/fab/fab-action-styles";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

const BAR_HEIGHT = 52;
/** Separación entre la barra y el borde superior de la card. */
const GAP_ABOVE_CARD = 6;

function menuWidth(anchorRect: DOMRect): number {
  if (typeof window === "undefined") return 320;
  const viewportPad = 16;
  const maxW = window.innerWidth - viewportPad * 2;
  const minW = 300;
  const cardW = anchorRect.width + 24;
  return Math.min(maxW, Math.max(minW, cardW, 280));
}

function menuTop(anchorRect: DOMRect, barHeight: number): number {
  const above = anchorRect.top - barHeight - GAP_ABOVE_CARD;
  if (above >= 8) return above;
  return anchorRect.bottom + GAP_ABOVE_CARD;
}

function menuLeft(anchorRect: DOMRect, barWidth: number): number {
  if (typeof window === "undefined") return anchorRect.left;
  return Math.min(
    Math.max(8, anchorRect.left + anchorRect.width / 2 - barWidth / 2),
    window.innerWidth - barWidth - 8,
  );
}

/**
 * Barra contextual justo encima de la card (portal a body: el panel nav tiene transform).
 */
export function ChildContextMenu({
  anchorRect,
  entityName,
  onSelect,
  onClose,
}: ChildContextMenuProps) {
  const menuId = useId();
  const pickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  const barWidth = menuWidth(anchorRect);
  const top = menuTop(anchorRect, BAR_HEIGHT);
  const left = menuLeft(anchorRect, barWidth);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        className="fixed inset-0 z-[60] bg-ink/25"
        onClick={onClose}
      />
      <div
        id={menuId}
        role="menu"
        aria-label={`Acciones para ${entityName}`}
        className="fixed z-[70] grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-paper-elevated p-2.5 shadow-lg"
        style={{ top, left, width: barWidth }}
      >
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            onClick={() => pick(action.id)}
            className={`min-w-0 whitespace-nowrap ${fabActionClassForId(action.id, "solid")}`}
          >
            <span className="shrink-0 text-lg leading-none">+</span>
            <span className="truncate">{action.label}</span>
          </button>
        ))}
      </div>
    </>,
    document.body,
  );
}
