import { FormField, FormInput, FormTextarea } from "@/components/study/form-field";

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
  return (
    <>
      <FormField label="Etiqueta de estado" error={fieldErrors.etiqueta_estado}>
        <FormInput
          value={etiqueta}
          onChange={(e) => setEtiqueta(e.target.value)}
          placeholder="ej. comenzado, en curso"
        />
      </FormField>
      <FormField label="Porcentaje de avance" error={fieldErrors.porcentaje_avance}>
        <FormInput
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={porcentaje}
          onChange={(e) => setPorcentaje(e.target.value)}
        />
      </FormField>
      <FormField label="Comentario" error={fieldErrors.comentario}>
        <FormTextarea
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </FormField>
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
        <FormInput
          value={nivelEntendimiento}
          onChange={(e) => setNivelEntendimiento(e.target.value)}
          placeholder="ej. alto, medio, bajo"
        />
      </FormField>
    </>
  );
}
