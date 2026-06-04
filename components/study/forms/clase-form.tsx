"use client";

import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/study/form-field";
import { getSessionUserId, insertClase } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { claseFormSchema } from "@/lib/validations";
import { useState } from "react";

type ClaseFormProps = {
  cursoId: number;
  onSuccess: () => void;
};

export function ClaseForm({ cursoId, onSuccess }: ClaseFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [dificultad, setDificultad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = claseFormSchema.safeParse({
      nombre,
      descripcion,
      orden,
      jerarquia,
      dificultad,
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión expirada.");
      setLoading(false);
      return;
    }

    const result = await insertClase(userId, cursoId, parsed.data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Nombre *" error={fieldErrors.nombre}>
        <FormInput
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </FormField>
      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </FormField>
      <FormField label="Dificultad" error={fieldErrors.dificultad}>
        <FormInput
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value)}
          placeholder="ej. baja, media, alta"
        />
      </FormField>
      <FormField label="Orden" error={fieldErrors.orden}>
        <FormInput
          type="number"
          min={0}
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          placeholder="Vacío = al final"
        />
      </FormField>
      <FormField label="Jerarquía" error={fieldErrors.jerarquia}>
        <FormInput
          type="number"
          min={0}
          value={jerarquia}
          onChange={(e) => setJerarquia(e.target.value)}
        />
      </FormField>
      <FormError message={error} />
      <FormSubmitButton loading={loading} label="Crear clase" />
    </form>
  );
}
