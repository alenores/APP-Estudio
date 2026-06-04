"use client";

import { FormField, FormInput, FormTextarea } from "@/components/study/form-field";

type ConceptoFormFieldsProps = {
  descripcion: string;
  setDescripcion: (v: string) => void;
  jerarquia: string;
  setJerarquia: (v: string) => void;
  fieldErrors?: Partial<Record<string, string>>;
};

export function ConceptoFormFields({
  descripcion,
  setDescripcion,
  jerarquia,
  setJerarquia,
  fieldErrors,
}: ConceptoFormFieldsProps) {
  return (
    <>
      <FormField label="Descripción" error={fieldErrors?.descripcion}>
        <FormTextarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          placeholder="Qué es o qué debés recordar de este concepto"
        />
      </FormField>
      <FormField label="Jerarquía" error={fieldErrors?.jerarquia}>
        <FormInput
          type="number"
          min={0}
          inputMode="numeric"
          value={jerarquia}
          onChange={(e) => setJerarquia(e.target.value)}
          placeholder="0"
        />
      </FormField>
    </>
  );
}
