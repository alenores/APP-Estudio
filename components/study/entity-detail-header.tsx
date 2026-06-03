import type { SeguimientoDerivados } from "@/app/types/estudio";
import { estadoBadgeClass, estadoLabel } from "@/lib/estado-ui";

type EntityDetailHeaderProps = {
  nombre: string;
  descripcion?: string | null;
  derivados: SeguimientoDerivados;
  meta?: { label: string; value: string }[];
};

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export function EntityDetailHeader({
  nombre,
  descripcion,
  derivados,
  meta = [],
}: EntityDetailHeaderProps) {
  const { etiqueta_estado, porcentaje_avance, fecha_comienzo } = derivados;
  const inicio = formatDate(fecha_comienzo);
  const estadoTexto = estadoLabel(etiqueta_estado);

  return (
    <section className="rounded-2xl border border-border bg-paper-elevated p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
          {nombre}
        </h2>
        {estadoTexto ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoBadgeClass(etiqueta_estado)}`}
          >
            {estadoTexto}
          </span>
        ) : (
          <span className="rounded-full bg-border px-3 py-1 text-xs text-ink-muted">
            Sin estado
          </span>
        )}
      </div>

      {descripcion ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{descripcion}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {porcentaje_avance != null ? (
          <span className="rounded-lg bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent">
            {porcentaje_avance}% avance
          </span>
        ) : null}
        {inicio ? (
          <span className="rounded-lg bg-border/60 px-2.5 py-1 text-xs text-ink-muted">
            Comienzo: {inicio}
          </span>
        ) : null}
        {meta.map((m) => (
          <span
            key={m.label}
            className="rounded-lg bg-border/60 px-2.5 py-1 text-xs text-ink-muted"
          >
            {m.label}: {m.value}
          </span>
        ))}
      </div>
    </section>
  );
}
