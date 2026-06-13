"use client";

import type { DefinicionGeneral } from "@/app/types/desarrollos";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteDefinicionGeneral,
  getSessionUserId,
  insertDefinicionGeneral,
  updateDefinicionGeneral,
} from "@/lib/desarrollos-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { useDesarrollosData } from "@/app/hooks/useDesarrollosData";
import { definicionGeneralFormSchema } from "@/lib/validations";
import { useState } from "react";

type DefinicionGeneralFormProps = {
  general?: DefinicionGeneral;
  onSuccess: (id: number) => void;
  onDelete?: () => void;
};

export function DefinicionGeneralForm({
  general,
  onSuccess,
  onDelete,
}: DefinicionGeneralFormProps) {
  const { refreshSnapshot } = useDesarrollosData();
  const isEdit = general != null;
  const [nombre, setNombre] = useState(general?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(general?.descripcion ?? "");
  const [linkChat, setLinkChat] = useState(general?.link_chat ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = definicionGeneralFormSchema.safeParse({
      nombre,
      descripcion,
      link_chat: linkChat,
    });
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
      ? await updateDefinicionGeneral(general.id, parsed.data)
      : await insertDefinicionGeneral(userId, parsed.data);

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
    if (!general || !onDelete) return;
    setLoading(true);
    const { error: delErr } = await deleteDefinicionGeneral(general.id);
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
      <FormField label="Link de chat" error={fieldErrors.link_chat}>
        <FormInput
          type="url"
          value={linkChat}
          onChange={(e) => setLinkChat(e.target.value)}
          placeholder="https://chatgpt.com/c/..."
        />
      </FormField>
      {error ? <FormError message={error} /> : null}
      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar" : "Crear definición general"}
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
