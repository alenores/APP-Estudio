"use client";

import type {
  FormLienzoColocacionConfig,
  FormLienzoColocacionState,
} from "@/lib/form-lienzo-colocacion-types";
import { listMapaNodos } from "@/lib/mapa-queries";
import { listMapaDetalleHijos } from "@/lib/mapa-detalle-queries";
import { listTemasLienzo } from "@/lib/temas-lienzo-queries";
import type { MapaDetalleHijo } from "@/lib/mapa-detalle-types";
import { FormField, FormInput } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";

type FormLienzoColocacionSectionProps = {
  config: FormLienzoColocacionConfig;
  value: FormLienzoColocacionState;
  onChange: (value: FormLienzoColocacionState) => void;
  /** Ocultar en edición si no aplica */
  show?: boolean;
  /** Padre del enlace fijado (p. ej. botón + en card del lienzo). */
  lockEnlacePadre?: boolean;
  enlacePadreLabel?: string;
};

type PadreOption = { id: number; label: string };

/**
 * Sección opcional al pie del formulario: etapa/carril y enlace desde padre en el lienzo.
 * Compartida entre explorador y /mapa (ADR 010).
 */
export function FormLienzoColocacionSection({
  config,
  value,
  onChange,
  show = true,
  lockEnlacePadre = false,
  enlacePadreLabel,
}: FormLienzoColocacionSectionProps) {
  const [padresMacro, setPadresMacro] = useState<PadreOption[]>([]);
  const [detalleHijos, setDetalleHijos] = useState<MapaDetalleHijo[]>([]);

  useEffect(() => {
    if (config.mode !== "detalle" || config.hijos.length > 0) {
      setDetalleHijos([]);
      return;
    }
    void listMapaDetalleHijos(config.scope).then(({ data }) => {
      setDetalleHijos(data ?? []);
    });
  }, [config]);

  useEffect(() => {
    if (config.mode === "macro-nodos") {
      void listMapaNodos().then(({ data }) => {
        setPadresMacro(
          (data ?? []).map((n) => ({ id: n.id, label: n.titulo })),
        );
      });
      return;
    }
    if (config.mode === "macro-temas") {
      void listTemasLienzo().then(({ data }) => {
        setPadresMacro(
          (data ?? []).map((t) => ({ id: t.id, label: t.nombre })),
        );
      });
    }
  }, [config.mode]);

  const detallePadreOptions = useMemo((): PadreOption[] => {
    if (config.mode !== "detalle") return [];
    const source = detalleHijos.length > 0 ? detalleHijos : config.hijos;
    return source
      .filter((h) => h.kind === value.enlacePadreKind)
      .map((h) => ({ id: h.id, label: h.nombre }));
  }, [config, value.enlacePadreKind, detalleHijos]);

  const padreOptions =
    config.mode === "detalle" ? detallePadreOptions : padresMacro;

  const showPadreKindSwitch =
    !lockEnlacePadre &&
    config.mode === "detalle" &&
    config.scope.kind === "nodo" &&
    config.scope.childKind === "mixto";

  const padreLabel =
    config.mode === "macro-nodos"
      ? "Enlace desde nodo (opcional)"
      : config.mode === "macro-temas"
        ? "Enlace desde tema (opcional)"
        : "Enlace desde (opcional)";

  if (!show) return null;

  return (
    <section
      className="form-lienzo-colocacion mt-6 space-y-4 rounded-xl border border-dashed border-[var(--td-line)] bg-[var(--td-line-soft)]/25 px-4 py-4"
      aria-labelledby="form-lienzo-colocacion-heading"
    >
      <div>
        <h3
          id="form-lienzo-colocacion-heading"
          className="text-xs font-extrabold uppercase tracking-wide text-[var(--td-ink-soft)]"
        >
          Lienzo (opcional)
        </h3>
        <p className="mt-1 text-xs leading-snug text-[var(--td-faint)]">
          Podés completar esto ahora o más tarde. Si lo dejás vacío, el ítem se
          crea igual; en el mapa podés ubicarlo y enlazarlo después.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Etapa (columna X)">
          <FormInput
            type="number"
            min={0}
            value={value.etapa}
            onChange={(e) => onChange({ ...value, etapa: e.target.value })}
            placeholder="Ej. 0"
          />
        </FormField>
        <FormField label="Carril (fila Y)">
          <FormInput
            type="number"
            min={0}
            value={value.carril}
            onChange={(e) => onChange({ ...value, carril: e.target.value })}
            placeholder="Ej. 0"
          />
        </FormField>
      </div>

      {showPadreKindSwitch ? (
        <div className="flex flex-wrap gap-2">
          <span className="w-full text-xs font-semibold text-[var(--td-ink-soft)]">
            Tipo de padre del enlace
          </span>
          {(
            [
              { id: "curso" as const, label: "Curso" },
              { id: "logro" as const, label: "Logro" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  enlacePadreKind: opt.id,
                  enlacePadreId: "",
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                value.enlacePadreKind === opt.id
                  ? "border-[var(--td-navy)] bg-white text-[var(--td-navy)]"
                  : "border-[var(--td-line)] bg-white/80 text-[var(--td-ink-soft)] hover:border-[var(--td-navy)]/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      <FormField label={padreLabel}>
        {lockEnlacePadre && value.enlacePadreId ? (
          <p className="rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--td-navy)]">
            {enlacePadreLabel?.trim() || `#${value.enlacePadreId}`}
          </p>
        ) : (
          <select
            value={value.enlacePadreId}
            onChange={(e) =>
              onChange({ ...value, enlacePadreId: e.target.value })
            }
            className="w-full rounded-xl border border-[var(--td-line)] bg-white px-3 py-2.5 text-sm text-[var(--td-ink)] outline-none focus:border-[var(--td-navy)]/50"
          >
            <option value="">Sin enlace automático</option>
            {padreOptions.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.label}
              </option>
            ))}
          </select>
        )}
        {!lockEnlacePadre &&
        config.mode === "detalle" &&
        padreOptions.length === 0 ? (
          <p className="mt-1 text-[11px] text-[var(--td-faint)]">
            Todavía no hay {value.enlacePadreKind === "logro" ? "logros" : "cursos"}{" "}
            en este lienzo para enlazar.
          </p>
        ) : null}
      </FormField>
    </section>
  );
}
