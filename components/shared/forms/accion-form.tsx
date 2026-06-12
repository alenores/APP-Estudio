"use client";

import type { Accion } from "@/app/types/desarrollos";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteAccion,
  getSessionUserId,
  insertAccion,
  updateAccion,
} from "@/lib/desarrollos-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { accionFormSchema } from "@/lib/validations";
import { useState } from "react";

type AccionFormProps = {
  especificaId: number;
  accion?: Accion;
  onSuccess: (id: number) => void;
  onDelete?: () => void;
};

export function AccionForm({
  especificaId,
  accion,
  onSuccess,
  onDelete,
}: AccionFormProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const isEdit = accion != null;
  const [nombre, setNombre] = useState(accion?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(accion?.descripcion ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = accionFormSchema.safeParse({ nombre, descripcion });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setError("Sesión no disponible.");
      setLoading(false);
      return;
    }

    const result = isEdit
      ? await updateAccion(accion.id, parsed.data)
      : await insertAccion(userId, especificaId, parsed.data);

    if (result.error || !result.data) {
      setError(result.error ?? "No se pudo guardar.");
      setLoading(false);
      return;
    }

    await refreshSnapshot();
    setLoading(false);
    onSuccess(result.data.id);
  }

  async function handleDelete() {
    if (!accion || !onDelete) return;
    setLoading(true);
    const { error: delErr } = await deleteAccion(accion.id);
    if (delErr) {
      setError(delErr);
      setLoading(false);
      return;
    }
    await refreshSnapshot();
    setLoading(false);
    onDelete();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Nombre" error={fieldErrors.nombre}>
        <FormInput value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </FormField>
      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          value={descripcion ?? ""}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </FormField>
      {error ? <FormError message={error} /> : null}
      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar" : "Crear acción"}
      />
      {isEdit && onDelete ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700"
        >
          Eliminar
        </button>
      ) : null}
    </form>
  );
}
