"use client";

import { useEffect, useId, useState } from "react";

export type FabExpandAction = {
  id: string;
  label: string;
  /** solid = estilo FabLink (seguimiento); dashed = estilo Agregar entidad (curso) */
  variant?: "solid" | "dashed";
};

type FabExpandMenuProps = {
  actions: FabExpandAction[];
  onSelect: (id: string) => void;
  /** Etiqueta del botón principal (solo ícono + visible). */
  mainLabel?: string;
};

/**
 * FAB (+) con acciones apiladas hacia arriba (detalle de tema/curso).
 * onSelect abre sheet en la página padre; sin navegación a /nuevo.
 */
export function FabExpandMenu({
  actions,
  onSelect,
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

  function pick(id: string) {
    setOpen(false);
    onSelect(id);
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-20 bg-ink/20"
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
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                onClick={() => pick(action.id)}
                className={
                  action.variant === "dashed"
                    ? "flex items-center gap-2 rounded-full border border-dashed border-accent/50 bg-paper-elevated px-4 py-2.5 text-sm font-semibold text-accent shadow-md transition-colors hover:border-accent hover:bg-accent-subtle active:scale-95"
                    : "flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover active:scale-95"
                }
              >
                <span className="text-lg leading-none">+</span>
                {action.label}
              </button>
            ))}
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
