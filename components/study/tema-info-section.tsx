import type { SeguimientoDerivados, TemaConDerivados } from "@/app/types/estudio";
import { estadoBadgeClass, estadoLabel } from "@/lib/estado-ui";

function formatFecha(value: string | null) {
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

type TemaInfoSectionProps = {
  tema: TemaConDerivados;
};

/**
 * Metadatos del tema (tabla `temas` + derivados de seguimiento).
 * Sin card: el nombre ya está en AppShell; las cards de abajo son para cursos.
 */
export function TemaInfoSection({ tema }: TemaInfoSectionProps) {
  const { descripcion, fecha_estimada_inicio, fecha_estimada_fin, jerarquia, derivados } =
    tema;
  const inicio = formatFecha(fecha_estimada_inicio);
  const fin = formatFecha(fecha_estimada_fin);
  const estadoTexto = estadoLabel(derivados.etiqueta_estado);
  const comienzoEfectivo = formatFecha(derivados.fecha_comienzo);

  const filas: { label: string; value: string }[] = [
    inicio ? { label: "Inicio estimado", value: inicio } : null,
    fin ? { label: "Fin estimado", value: fin } : null,
    { label: "Jerarquía", value: String(jerarquia) },
  ].filter((f): f is { label: string; value: string } => f != null);

  return (
    <section className="space-y-4 border-b border-border pb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Datos del tema
      </p>

      {descripcion ? (
        <p className="text-sm leading-relaxed text-ink">{descripcion}</p>
      ) : (
        <p className="text-sm italic text-ink-muted">Sin descripción.</p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {filas.map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              {f.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          Seguimiento
        </span>
        {estadoTexto ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoBadgeClass(derivados.etiqueta_estado)}`}
          >
            {estadoTexto}
          </span>
        ) : (
          <span className="rounded-full bg-border px-2.5 py-0.5 text-xs text-ink-muted">
            Sin estado
          </span>
        )}
        {derivados.porcentaje_avance != null ? (
          <span className="text-xs font-medium text-accent">
            {derivados.porcentaje_avance}% avance
          </span>
        ) : null}
        {comienzoEfectivo ? (
          <span className="text-xs text-ink-muted">Comienzo: {comienzoEfectivo}</span>
        ) : null}
      </div>
    </section>
  );
}
