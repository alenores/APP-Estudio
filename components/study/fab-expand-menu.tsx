"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export type FabExpandAction = {
  href: string;
  label: string;
  /** solid = estilo FabLink (seguimiento); dashed = estilo Agregar entidad (curso) */
  variant?: "solid" | "dashed";
};

type FabExpandMenuProps = {
  actions: FabExpandAction[];
  /** Etiqueta del botón principal (solo ícono + visible). */
  mainLabel?: string;
};

/** Retraso entre cada ítem: el más cercano al + (abajo) sale primero. */
const STAGGER_MS = 90;
const ENTER_MS = 320;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const actionBase =
  "flex items-center gap-2 rounded-full text-sm font-semibold shadow-md transition-colors duration-150";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * FAB circular (+) que despliega acciones apiladas hacia arriba.
 * Usado en detalle de tema: seguimiento + agregar curso.
 */
export function FabExpandMenu({
  actions,
  mainLabel = "Más acciones",
}: FabExpandMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const backdropRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const runningRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    runningRef.current.forEach((a) => a.cancel());
    runningRef.current = [];

    const items = itemRefs.current.filter(
      (el): el is HTMLAnchorElement => el != null,
    );

    const clearInline = () => {
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "";
      }
      for (const el of items) {
        el.style.opacity = "";
        el.style.transform = "";
      }
    };

    if (!open) {
      clearInline();
      return;
    }

    const reduced = prefersReducedMotion();
    if (reduced) {
      clearInline();
      return;
    }

    let cancelled = false;
    const fromTransform = "translateY(1.75rem) scale(0.82)";
    const toTransform = "translateY(0) scale(1)";

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;

      for (const el of items) {
        el.style.opacity = "0";
        el.style.transform = fromTransform;
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "0";
      }

      if (items[0]) {
        void items[0].offsetHeight;
      }

      const anims: Animation[] = [];

      if (backdropRef.current) {
        anims.push(
          backdropRef.current.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 200, easing: "ease-out", fill: "forwards" },
          ),
        );
      }

      items.forEach((el, index) => {
        const fromBottom = actions.length - 1 - index;
        anims.push(
          el.animate(
            [
              { opacity: 0, transform: fromTransform },
              { opacity: 1, transform: toTransform },
            ],
            {
              duration: ENTER_MS,
              delay: fromBottom * STAGGER_MS,
              easing: EASING,
              fill: "forwards",
            },
          ),
        );
      });

      runningRef.current = anims;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      runningRef.current.forEach((a) => a.cancel());
      runningRef.current = [];
      clearInline();
    };
  }, [open, actions.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        ref={backdropRef}
        className={`fixed inset-0 z-20 bg-ink/20 ${
          open ? "pointer-events-auto" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      <div className="fixed bottom-6 right-4 z-30 flex flex-col items-end gap-3">
        <div
          id={menuId}
          role="menu"
          aria-hidden={!open}
          className={`flex flex-col items-end gap-2.5 pb-1 ${
            open
              ? "pointer-events-auto"
              : "pointer-events-none h-0 overflow-hidden opacity-0"
          }`}
        >
          {actions.map((action, index) => (
            <Link
              key={action.href}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={action.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              onClick={() => setOpen(false)}
              className={`${actionBase} active:scale-95 ${
                action.variant === "dashed"
                  ? "border border-dashed border-accent/50 bg-paper-elevated px-4 py-2.5 text-accent hover:border-accent hover:bg-accent-subtle"
                  : "bg-accent px-4 py-2.5 text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
              }`}
            >
              <span className="text-lg leading-none">+</span>
              {action.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={mainLabel}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light leading-none text-white shadow-lg shadow-accent/25 transition-[transform,background-color] duration-300 ease-out hover:bg-accent-hover active:scale-95 ${open ? "rotate-45" : ""}`}
        >
          +
        </button>
      </div>
    </>
  );
}
