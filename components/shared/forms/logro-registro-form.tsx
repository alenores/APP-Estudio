"use client";

import type { Logro } from "@/app/types/estudio";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteLogroRegistro,
  getSessionUserId,
  insertLogroRegistro,
  updateLogroRegistro,
} from "@/lib/logros-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { logroRegistroFormSchema } from "@/lib/validations";
import { useState } from "react";

type LogroRegistroFormProps = {
  nodoId: number;
  logro?: Logro;
  onSuccess: (logroId: number) => void;
  onDelete?: () => void;
};

/** Alta/edición de fila en tabla `logros` (hijo de nodo tipo logro). */
export function LogroRegistroForm({
  nodoId,
  logro,
  onSuccess,
  onDelete,
}: LogroRegistroFormProps) {
  const isEdit = logro != null;
  const [nombre, setNombre] = useState(logro?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(logro?.descripcion ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = logroRegistroFormSchema.safeParse({ nombre, descripcion });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    if (isEdit) {
      const { data, error: updErr } = await updateLogroRegistro(
        logro.id,
        parsed.data,
      );
      setLoading(false);
      if (updErr || !data) {
        setError(updErr ?? "No se pudo guardar.");
        return;
      }
      onSuccess(data.id);
      return;
    }

    const userId = await getSessionUserId();
    if (!userId) {
      setLoading(false);
      setError("Sesión expirada.");
      return;
    }

    const { data, error: insErr } = await insertLogroRegistro(
      userId,
      nodoId,
      parsed.data,
    );
    setLoading(false);
    if (insErr || !data) {
      setError(insErr ?? "No se pudo crear.");
      return;
    }
    onSuccess(data.id);
  }

  async function handleDelete() {
    if (!logro || !onDelete) return;
    if (!window.confirm(`¿Eliminar el logro «${logro.nombre}»?`)) return;
    setLoading(true);
    const { error: delErr } = await deleteLogroRegistro(logro.id);
    setLoading(false);
    if (delErr) {
      setError(delErr);
      return;
    }
    onDelete();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Nombre *" error={fieldErrors.nombre}>
        <FormInput
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
          maxLength={200}
        />
      </FormField>
      <FormField label="Descripción" error={fieldErrors.descripcion}>
        <FormTextarea
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
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
