"use client";

import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/study/form-field";
import { getSessionUserId, insertCurso } from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { cursoFormSchema } from "@/lib/validations";
import { useState } from "react";

type CursoFormProps = {
  temaId: number;
  onSuccess: () => void;
};

export function CursoForm({ temaId, onSuccess }: CursoFormProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = cursoFormSchema.safeParse({
      nombre,
      descripcion,
      orden,
      jerarquia,
      fecha_estimada_inicio: fechaInicio,
      fecha_estimada_fin: fechaFin,
      plataforma: "",
      link,
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

    const result = await insertCurso(userId, temaId, parsed.data);
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
      <FormField label="Link del curso" error={fieldErrors.link}>
        <FormInput
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://platzi.com/cursos/..."
        />
      </FormField>
      <p className="text-xs text-ink-muted">
        El ícono de la plataforma se obtiene automáticamente del link.
      </p>
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
      <FormField label="Fecha estimada inicio" error={fieldErrors.fecha_estimada_inicio}>
        <FormInput
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </FormField>
      <FormField label="Fecha estimada fin" error={fieldErrors.fecha_estimada_fin}>
        <FormInput
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </FormField>
      <FormError message={error} />
      <FormSubmitButton loading={loading} label="Crear curso" />
    </form>
  );
}
