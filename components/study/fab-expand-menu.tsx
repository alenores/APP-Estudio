"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

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

const actionBase =
  "flex items-center gap-2 rounded-full text-sm font-semibold shadow-md transition-[opacity,transform,background-color,border-color] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100";

/**
 * FAB circular (+) que despliega acciones apiladas hacia arriba.
 * Usado en detalle de tema: seguimiento + agregar curso.
 */
export function FabExpandMenu({
  actions,
  mainLabel = "Más acciones",
}: FabExpandMenuProps) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      setRevealed(false);
      return;
    }
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setRevealed(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [open]);

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
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className={`fixed inset-0 z-20 bg-ink/20 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="fixed bottom-6 right-4 z-30 flex flex-col items-end gap-3">
        {open ? (
          <div
            id={menuId}
            role="menu"
            className="flex flex-col items-end gap-2.5 pb-1"
          >
            {actions.map((action, index) => {
              const fromBottom = actions.length - 1 - index;
              const delayMs = fromBottom * STAGGER_MS;
              const enterState = revealed
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-7 scale-[0.82]";

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  style={{
                    transitionDuration: `${ENTER_MS}ms`,
                    transitionDelay: revealed ? `${delayMs}ms` : "0ms",
                  }}
                  className={`${actionBase} ${enterState} active:scale-95 ${
                    action.variant === "dashed"
                      ? "border border-dashed border-accent/50 bg-paper-elevated px-4 py-2.5 text-accent hover:border-accent hover:bg-accent-subtle"
                      : "bg-accent px-4 py-2.5 text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
                  }`}
                >
                  <span className="text-lg leading-none">+</span>
                  {action.label}
                </Link>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          aria-label={mainLabel}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light leading-none text-white shadow-lg shadow-accent/25 transition-[transform,background-color] duration-300 ease-out hover:bg-accent-hover active:scale-95 motion-reduce:transition-none ${open ? "rotate-45" : ""}`}
        >
          +
        </button>
      </div>
    </>
  );
}
