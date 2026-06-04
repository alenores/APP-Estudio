"use client";

import { ESTADO_OPCIONES, NIVEL_MAX, NIVEL_MIN } from "@/lib/estado-ui";
import type { SeguimientoFormScope } from "@/lib/seguimiento-form-scope";
import { seguimientoMuestraAvanceCurso, seguimientoMuestraTiempoRestante } from "@/lib/seguimiento-form-scope";
import { FormField, FormInput, FormSelect } from "@/components/study/form-field";

type SeguimientoFieldsProps = {
  scope: SeguimientoFormScope;
  etiqueta: string;
  setEtiqueta: (v: string) => void;
  porcentaje: string;
  setPorcentaje: (v: string) => void;
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
  scope,
  etiqueta,
  setEtiqueta,
  porcentaje,
  setPorcentaje,
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
  const muestraAvance = seguimientoMuestraAvanceCurso(scope);
  const muestraTiempoRestante = seguimientoMuestraTiempoRestante(scope);

  return (
    <>
      <FormField label="Etiqueta de estado" error={fieldErrors.etiqueta_estado}>
        <FormSelect
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
        >
          <option value="">Sin especificar</option>
          {ESTADO_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </FormSelect>
      </FormField>

      {muestraAvance ? (
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
      ) : null}

      <FormField label="Tiempo consumido (min)" error={fieldErrors.tiempo_consumido}>
        <FormInput
          type="number"
          min={0}
          step={1}
          value={tiempoConsumido}
          onChange={(e) => setTiempoConsumido(e.target.value)}
        />
      </FormField>

      <FormField label="Fecha de alerta" error={fieldErrors.fecha_alerta}>
        <FormInput
          type="date"
          value={fechaAlerta}
          onChange={(e) => setFechaAlerta(e.target.value)}
        />
      </FormField>

      <FormField label="Fecha de comienzo" error={fieldErrors.fecha_comienzo}>
        <FormInput
          type="date"
          value={fechaComienzo}
          onChange={(e) => setFechaComienzo(e.target.value)}
        />
      </FormField>

      <FormField label="Nivel de entendimiento (1–10)" error={fieldErrors.nivel_entendimiento}>
        <FormInput
          type="number"
          min={NIVEL_MIN}
          max={NIVEL_MAX}
          step={1}
          inputMode="numeric"
          value={nivelEntendimiento}
          onChange={(e) => setNivelEntendimiento(e.target.value)}
          placeholder="Sin especificar"
        />
      </FormField>

      {muestraTiempoRestante ? (
        <FormField
          label="Tiempo estimado restante (min)"
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
      ) : null}
    </>
  );
}
