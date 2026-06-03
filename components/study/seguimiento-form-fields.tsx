"use client";

import { useState } from "react";
import {
  ESTADO_OPCIONES,
  NIVEL_OPCIONES,
} from "@/lib/estado-ui";
import { FormField, FormInput, FormSelect, FormTextarea } from "@/components/study/form-field";

type SeguimientoFieldsProps = {
  etiqueta: string;
  setEtiqueta: (v: string) => void;
  porcentaje: string;
  setPorcentaje: (v: string) => void;
  comentario: string;
  setComentario: (v: string) => void;
  fechaComienzo: string;
  setFechaComienzo: (v: string) => void;
  fechaAlerta: string;
  setFechaAlerta: (v: string) => void;
  tiempoConsumido: string;
  setTiempoConsumido: (v: string) => void;
  tiempoFaltante: string;
  setTiempoFaltante: (v: string) => void;
  nivelEntendimiento: string;
  setNivelEntendimiento: (v: string) => void;
  fieldErrors?: Partial<Record<string, string>>;
};

export function SeguimientoFormFields({
  etiqueta,
  setEtiqueta,
  porcentaje,
  setPorcentaje,
  comentario,
  setComentario,
  fechaComienzo,
  setFechaComienzo,
  fechaAlerta,
  setFechaAlerta,
  tiempoConsumido,
  setTiempoConsumido,
  tiempoFaltante,
  setTiempoFaltante,
  nivelEntendimiento,
  setNivelEntendimiento,
  fieldErrors = {},
}: SeguimientoFieldsProps) {
  const [detallesAbiertos, setDetallesAbiertos] = useState(false);

  return (
    <>
      <FormField label="Estado *" error={fieldErrors.etiqueta_estado}>
        <FormSelect
          required
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        >
          <option value="">Elegí un estado</option>
          {ESTADO_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <FormField label="Porcentaje de avance" error={fieldErrors.porcentaje_avance}>
        <div className="relative">
          <FormInput
            type="number"
            min={0}
            max={100}
            step={1}
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            className="pr-10"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
            %
          </span>
        </div>
      </FormField>

      <FormField label="Comentario" error={fieldErrors.comentario}>
        <FormTextarea
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Notas breves sobre tu avance…"
        />
      </FormField>

      <div className="rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setDetallesAbiertos((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink transition hover:bg-accent-subtle/50"
          aria-expanded={detallesAbiertos}
        >
          Más detalles
          <span className="text-ink-muted" aria-hidden>
            {detallesAbiertos ? "▲" : "▼"}
          </span>
        </button>
        {detallesAbiertos ? (
          <div className="space-y-4 border-t border-border px-4 py-4">
            <FormField label="Fecha de comienzo" error={fieldErrors.fecha_comienzo}>
              <FormInput
                type="date"
                value={fechaComienzo}
                onChange={(e) => setFechaComienzo(e.target.value)}
              />
            </FormField>
            <FormField label="Fecha de alerta" error={fieldErrors.fecha_alerta}>
              <FormInput
                type="date"
                value={fechaAlerta}
                onChange={(e) => setFechaAlerta(e.target.value)}
              />
            </FormField>
            <FormField label="Tiempo consumido (min)" error={fieldErrors.tiempo_consumido}>
              <FormInput
                type="number"
                min={0}
                step={1}
                value={tiempoConsumido}
                onChange={(e) => setTiempoConsumido(e.target.value)}
              />
            </FormField>
            <FormField
              label="Tiempo faltante estimado (min)"
              error={fieldErrors.tiempo_faltante_estimado}
            >
              <FormInput
                type="number"
                min={0}
                step={1}
                value={tiempoFaltante}
                onChange={(e) => setTiempoFaltante(e.target.value)}
              />
            </FormField>
            <FormField label="Nivel de entendimiento" error={fieldErrors.nivel_entendimiento}>
              <FormSelect
                value={nivelEntendimiento}
                onChange={(e) => setNivelEntendimiento(e.target.value)}
              >
                <option value="">Sin especificar</option>
                {NIVEL_OPCIONES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </div>
        ) : null}
      </div>
    </>
  );
}
