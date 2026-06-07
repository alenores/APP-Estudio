"use client";

import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  getSessionUserId,
  insertMapaNodoClasificado,
  updateMapaNodoSimple,
} from "@/lib/mapa-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { mapaNodoSimpleFormSchema } from "@/lib/validations";
import { useState } from "react";

type MapaNodoSimpleFormProps = {
  nodoId?: number;
  titulo?: string;
  descripcion?: string | null;
  onSuccess: (nodoId?: number) => void;
};

/** Alta/edición mínima de nodo tipo `nodo` (título + descripción). */
export function MapaNodoSimpleForm({
  nodoId,
  titulo: tituloInitial = "",
  descripcion: descripcionInitial = "",
  onSuccess,
}: MapaNodoSimpleFormProps) {
  const isEdit = nodoId != null;
  const [titulo, setTitulo] = useState(tituloInitial);
  const [descripcion, setDescripcion] = useState(descripcionInitial ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = mapaNodoSimpleFormSchema.safeParse({ titulo, descripcion });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    if (isEdit) {
      const { error: updErr } = await updateMapaNodoSimple(nodoId, parsed.data);
      setLoading(false);
      if (updErr) {
        setError(updErr);
        return;
      }
      onSuccess();
      return;
    }

    const userId = await getSessionUserId();
    if (!userId) {
      setLoading(false);
      setError("Sesión expirada. Volvé a iniciar sesión.");
      return;
    }

    const { data, error: insErr } = await insertMapaNodoClasificado(
      userId,
      "nodo",
      parsed.data,
    );
    setLoading(false);
    if (insErr) {
      setError(insErr);
      return;
    }
    onSuccess(data?.id);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Nombre" error={fieldErrors.titulo}>
        <FormInput
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          autoFocus
          maxLength={200}
        />
      </FormField>

      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormError message={error} />

      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar nodo" : "Crear nodo"}
      />
    </form>
  );
}
