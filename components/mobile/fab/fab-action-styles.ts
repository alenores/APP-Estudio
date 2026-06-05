/** Estilos compartidos entre FabExpandMenu y menú contextual en cards hijo. */
export const fabActionButtonClass = {
  dashed:
    "flex items-center gap-2 rounded-full border border-dashed border-accent/50 bg-paper-elevated px-4 py-2.5 text-sm font-semibold text-accent shadow-md transition-[transform,colors] duration-150 hover:border-accent hover:bg-accent-subtle active:scale-95",
  solid:
    "flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-[transform,colors] duration-150 hover:bg-accent-hover active:scale-95",
  seguimiento:
    "fab-action-seguimiento flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-[transform,colors] duration-150 active:scale-95",
} as const;

export function fabActionClassForId(id: string, variant?: "solid" | "dashed"): string {
  if (id === "seguimiento") return fabActionButtonClass.seguimiento;
  return variant === "dashed"
    ? fabActionButtonClass.dashed
    : fabActionButtonClass.solid;
}
