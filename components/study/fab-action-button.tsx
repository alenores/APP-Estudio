"use client";

type FabActionButtonProps = {
  label: string;
  onClick: () => void;
};

/** FAB de una sola acción (ej. seguimiento en detalle de clase). */
export function FabActionButton({ label, onClick }: FabActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-4 z-20 flex h-14 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover active:scale-95"
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </button>
  );
}
