import type { Concepto } from "@/app/types/estudio";

type ConceptoListProps = {
  items: Concepto[];
  emptyMessage?: string;
};

export function ConceptoList({
  items,
  emptyMessage = "Todavía no hay conceptos.",
}: ConceptoListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((c) => (
        <li
          key={c.id}
          className="rounded-xl border border-border bg-paper-elevated px-4 py-3 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted">
              {new Date(c.fecha_registro).toLocaleString("es-AR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
              Jerarquía {c.jerarquia}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink whitespace-pre-wrap">{c.descripcion}</p>
        </li>
      ))}
    </ul>
  );
}
