import type { Seguimiento } from "@/app/types/estudio";

type SeguimientoListProps = {
  items: Seguimiento[];
  emptyMessage?: string;
};

export function SeguimientoList({
  items,
  emptyMessage = "Todavía no hay seguimientos.",
}: SeguimientoListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => (
        <li
          key={s.id}
          className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {new Date(s.fecha_registro).toLocaleString("es-AR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {s.etiqueta_estado ? (
              <span className="text-xs font-medium text-indigo-300">
                {s.etiqueta_estado}
              </span>
            ) : null}
          </div>
          {s.comentario ? (
            <p className="mt-2 text-sm text-slate-300">{s.comentario}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {s.porcentaje_avance != null ? <span>{s.porcentaje_avance}%</span> : null}
            {s.nivel_entendimiento ? <span>{s.nivel_entendimiento}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
