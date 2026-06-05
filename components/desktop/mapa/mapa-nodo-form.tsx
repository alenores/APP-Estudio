"use client";

import type { MapaNodo } from "@/app/types/mapa";
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
  insertMapaNodo,
  updateMapaNodo,
} from "@/lib/mapa-queries";
import { zodFieldErrors } from "@/lib/form-errors";
import { numberFieldInitial } from "@/lib/iso-date-input";
import { mapaNodoFormSchema } from "@/lib/validations";
import { useState } from "react";

type MapaNodoFormProps = {
  nodo?: MapaNodo;
  onSuccess: () => void;
  onDelete?: () => void;
};

export function MapaNodoForm({ nodo, onSuccess, onDelete }: MapaNodoFormProps) {
  const isEdit = nodo != null;
  const [titulo, setTitulo] = useState(nodo?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(nodo?.descripcion ?? "");
  const [etapa, setEtapa] = useState(numberFieldInitial(nodo?.etapa));
  const [carril, setCarril] = useState(numberFieldInitial(nodo?.carril));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = mapaNodoFormSchema.safeParse({
      titulo,
      descripcion,
      etapa,
      carril,
      pos_x: nodo ? String(nodo.pos_x) : "0",
      pos_y: nodo ? String(nodo.pos_y) : "0",
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const userId = await getSessionUserId();
    if (!userId) {
      setLoading(false);
      setError("Sesión expirada. Volvé a iniciar sesión.");
      return;
    }

    const result = isEdit
      ? await updateMapaNodo(nodo.id, parsed.data)
      : await insertMapaNodo(userId, parsed.data);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  async function handleDelete() {
    if (!nodo || !onDelete) return;
    if (!window.confirm(`¿Eliminar el nodo «${nodo.titulo}»?`)) return;
    setLoading(true);
    const { error: delErr } = await deleteMapaNodo(nodo.id);
    setLoading(false);
    if (delErr) {
      setError(delErr);
      return;
    }
    onDelete();
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <FormField label="Título" error={fieldErrors.titulo}>
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

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Etapa (timeline)" error={fieldErrors.etapa}>
          <FormInput
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            inputMode="numeric"
          />
        </FormField>
        <FormField label="Carril (eje Y)" error={fieldErrors.carril}>
          <FormInput
            value={carril}
            onChange={(e) => setCarril(e.target.value)}
            inputMode="numeric"
          />
        </FormField>
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <FormSubmitButton
          loading={loading}
          label={isEdit ? "Guardar nodo" : "Crear nodo"}
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
