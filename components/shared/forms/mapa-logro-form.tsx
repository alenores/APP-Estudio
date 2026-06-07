"use client";

import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteMapaNodo,
  getSessionUserId,
  insertMapaNodoClasificado,
  updateMapaNodoSimple,
} from "@/lib/mapa-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { mapaLogroFormSchema } from "@/lib/validations";
import { useState } from "react";

type MapaLogroFormProps = {
  logroId?: number;
  titulo?: string;
  descripcion?: string | null;
  onSuccess: (nodoId?: number) => void;
  onDelete?: () => void;
};

/** Alta/edición de logro — campos propios (evolución futura aparte del nodo). */
export function MapaLogroForm({
  logroId,
  titulo: tituloInitial = "",
  descripcion: descripcionInitial = "",
  onSuccess,
  onDelete,
}: MapaLogroFormProps) {
  const isEdit = logroId != null;
  const [titulo, setTitulo] = useState(tituloInitial);
  const [descripcion, setDescripcion] = useState(descripcionInitial ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = mapaLogroFormSchema.safeParse({ titulo, descripcion });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    if (isEdit) {
      const { error: updErr } = await updateMapaNodoSimple(logroId, parsed.data);
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
      "logro",
      parsed.data,
    );
    setLoading(false);
    if (insErr) {
      setError(insErr);
      return;
    }
    onSuccess(data?.id);
  }

  async function handleDelete() {
    if (!logroId || !onDelete) return;
    if (!window.confirm(`¿Eliminar el logro «${titulo}»?`)) return;
    setLoading(true);
    const { error: delErr } = await deleteMapaNodo(logroId);
    setLoading(false);
    if (delErr) {
      setError(delErr);
      return;
    }
    onDelete();
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

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <FormSubmitButton
          loading={loading}
          label={isEdit ? "Guardar logro" : "Crear logro"}
        />
        {isEdit && onDelete ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleDelete()}
            className="text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
          >
            Eliminar
          </button>
        ) : null}
      </div>
    </form>
  );
}
