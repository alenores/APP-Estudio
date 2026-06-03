import type { SeguimientoDerivados } from "@/app/types/estudio";

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

function estadoTone(etiqueta: string | null) {
  if (!etiqueta) return "bg-slate-700 text-slate-300";
  const lower = etiqueta.toLowerCase();
  if (lower.includes("termin") || lower.includes("complet"))
    return "bg-emerald-500/20 text-emerald-300";
  if (lower.includes("comenz") || lower.includes("curso"))
    return "bg-indigo-500/20 text-indigo-200";
  if (lower.includes("paus") || lower.includes("pend"))
    return "bg-amber-500/20 text-amber-200";
  return "bg-slate-700 text-slate-300";
}

export function EntityDetailHeader({
  nombre,
  descripcion,
  derivados,
  meta = [],
}: EntityDetailHeaderProps) {
  const { etiqueta_estado, porcentaje_avance, fecha_comienzo } = derivados;
  const inicio = formatDate(fecha_comienzo);

  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-white">{nombre}</h2>
        {etiqueta_estado ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoTone(etiqueta_estado)}`}
          >
            {etiqueta_estado}
          </span>
        ) : (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-500">
            Sin estado
          </span>
        )}
      </div>

      {descripcion ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{descripcion}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {porcentaje_avance != null ? (
          <span className="rounded-lg bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-200">
            {porcentaje_avance}% avance
          </span>
        ) : null}
        {inicio ? (
          <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
            Comienzo: {inicio}
          </span>
        ) : null}
        {meta.map((m) => (
          <span
            key={m.label}
            className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
          >
            {m.label}: {m.value}
          </span>
        ))}
      </div>
    </section>
  );
}
