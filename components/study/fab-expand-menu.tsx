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
const STAGGER_MS = 160;

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
          className="fab-backdrop-enter fixed inset-0 z-20 bg-ink/20"
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
              // Índice visual desde abajo: el último del array está junto al +.
              const fromBottom = actions.length - 1 - index;
              const delayMs = fromBottom * STAGGER_MS;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${delayMs}ms` }}
                  className={`fab-action-enter ${
                    action.variant === "dashed"
                      ? "flex items-center gap-2 rounded-full border border-dashed border-accent/50 bg-paper-elevated px-4 py-2.5 text-sm font-semibold text-accent shadow-md transition hover:border-accent hover:bg-accent-subtle active:scale-95"
                      : "flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover active:scale-95"
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
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light leading-none text-white shadow-lg shadow-accent/25 transition-[transform,background-color] duration-300 ease-out hover:bg-accent-hover active:scale-95 ${open ? "rotate-45" : ""}`}
        >
          +
        </button>
      </div>
    </>
  );
}
