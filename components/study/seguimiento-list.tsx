import type { Seguimiento } from "@/app/types/estudio";
import { estadoBadgeClass, estadoLabel, nivelEntendimientoLabel } from "@/lib/estado-ui";

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
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const estadoTexto = estadoLabel(s.etiqueta_estado);
        return (
          <li
            key={s.id}
            className="rounded-xl border border-border bg-paper-elevated px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {new Date(s.fecha_registro).toLocaleString("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              {estadoTexto ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoBadgeClass(s.etiqueta_estado)}`}
                >
                  {estadoTexto}
                </span>
              ) : null}
            </div>
            {s.comentario ? (
              <p className="mt-2 text-sm text-ink">{s.comentario}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
              {s.porcentaje_avance != null ? <span>{s.porcentaje_avance}%</span> : null}
              {nivelEntendimientoLabel(s.nivel_entendimiento) ? (
                <span>
                  Nivel {nivelEntendimientoLabel(s.nivel_entendimiento)}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
