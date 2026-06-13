"use client";

import type { Clase } from "@/app/types/estudio";
import {
  FormError,
  FormField,
  FormInput,
  FormSubmitButton,
  FormTextarea,
} from "@/components/ui";
import {
  deleteClase,
  getSessionUserId,
  insertClase,
  updateClase,
} from "@/lib/estudio-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { numberFieldInitial } from "@/lib/iso-date-input";
import { claseFormSchema } from "@/lib/validations";
import { useState } from "react";

type ClaseFormProps = {
  cursoId: number;
  clase?: Clase;
  onSuccess: (claseId: number) => void;
  onDelete?: () => void;
};

export function ClaseForm({
  cursoId,
  clase,
  onSuccess,
  onDelete,
}: ClaseFormProps) {
  const isEdit = clase != null;
  const [nombre, setNombre] = useState(clase?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(clase?.descripcion ?? "");
  const [orden, setOrden] = useState(numberFieldInitial(clase?.orden));
  const [jerarquia, setJerarquia] = useState(numberFieldInitial(clase?.jerarquia));
  const [dificultad, setDificultad] = useState(clase?.dificultad ?? "");
  const [link, setLink] = useState(clase?.link ?? "");
  const [linkChat, setLinkChat] = useState(clase?.link_chat ?? "");
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
      link,
      link_chat: linkChat,
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

    const result = isEdit
      ? await updateClase(clase.id, parsed.data)
      : await insertClase(userId, cursoId, parsed.data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      onSuccess(result.data.id);
    }
  }

  async function handleDelete() {
    if (!clase || !onDelete) return;
    const ok = window.confirm(
      `¿Eliminar la clase «${clase.nombre}»? Se borran también sus seguimientos y conceptos.`,
    );
    if (!ok) return;
    setLoading(true);
    const { error: delError } = await deleteClase(clase.id);
    setLoading(false);
    if (delError) {
      setError(delError);
      return;
    }
    onDelete();
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
      <FormField label="Link de la clase" error={fieldErrors.link}>
        <FormInput
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://platzi.com/clases/..."
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
      <FormField label="Orden" error={fieldErrors.orden}>
        <FormInput
          type="number"
          min={0}
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          placeholder={isEdit ? undefined : "Vacío = al final"}
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
      <FormSubmitButton
        loading={loading}
        label={isEdit ? "Guardar cambios" : "Crear clase"}
      />
      {isEdit && onDelete ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Eliminar clase
        </button>
      ) : null}
    </form>
  );
}
